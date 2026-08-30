/**
 * Universal Import, Export and Sample Format Utility for ConnectCare
 */

export interface ColumnDefinition {
  key: string;
  label: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'select';
  options?: string[];
  description?: string;
  sampleValue?: string | number | boolean;
}

export interface ModuleImportExportConfig {
  moduleKey: string;
  displayName: string;
  templateFilename: string;
  exportFilenamePrefix: string;
  columns: ColumnDefinition[];
  sampleData: Record<string, any>[];
  mapRowToEntity: (row: Record<string, string>) => any;
  mapEntityToRow: (entity: any) => Record<string, any>;
  permissionModule?: string;
}

/**
 * Escapes a field for CSV according to RFC 4180 standard.
 */
export function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, double-quote, or newline, enclose in double quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports data to a CSV file and triggers an immediate browser download.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const headerLine = headers.map(escapeCsvField).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvField).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n'); // UTF-8 BOM for Excel compatibility

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a standardized sample import format CSV template.
 */
export function downloadCsvTemplate(
  filename: string,
  columns: ColumnDefinition[],
  sampleRows?: Record<string, any>[]
): void {
  const headers = columns.map((c) => c.label);
  const rows: (string | number | boolean | null | undefined)[][] = [];

  if (sampleRows && sampleRows.length > 0) {
    sampleRows.forEach((rowObj) => {
      const row = columns.map((col) => rowObj[col.key] ?? rowObj[col.label] ?? col.sampleValue ?? '');
      rows.push(row);
    });
  } else {
    // Generate default sample row from column definitions
    const sampleRow = columns.map((col) => col.sampleValue ?? '');
    rows.push(sampleRow);
  }

  exportToCsv(filename, headers, rows);
}

/**
 * Parses raw CSV text into array of rows using RFC 4180 rules.
 */
export function parseCsvText(text: string): { headers: string[]; rows: string[][]; errors: string[] } {
  const errors: string[] = [];
  if (!text || !text.trim()) {
    return { headers: [], rows: [], errors: ['CSV text is empty'] };
  }

  // Remove UTF-8 BOM if present
  let cleanText = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r' || char === '\n') {
        if (char === '\r' && nextChar === '\n') {
          i++; // handle CRLF
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Add remaining field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ['No data rows found'] };
  }

  const headers = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const dataRows = lines.slice(1).map((r) => r.map((c) => c.replace(/^["']|["']$/g, '').trim()));

  return { headers, rows: dataRows, errors };
}

/**
 * Maps parsed CSV rows to an array of key-value objects matching the column headers.
 */
export function mapCsvRowsToObjects(
  headers: string[],
  rows: string[][],
  columns: ColumnDefinition[]
): { objects: Record<string, string>[]; warnings: string[] } {
  const warnings: string[] = [];
  const headerMap: Record<number, ColumnDefinition> = {};

  // Find column mapping for each header index
  headers.forEach((header, idx) => {
    const normalizedHeader = header.toLowerCase().replace(/[\s_\-/]/g, '');
    const matchedCol = columns.find((col) => {
      const colLabelNorm = col.label.toLowerCase().replace(/[\s_\-/]/g, '');
      const colKeyNorm = col.key.toLowerCase().replace(/[\s_\-/]/g, '');
      return colLabelNorm === normalizedHeader || colKeyNorm === normalizedHeader;
    });

    if (matchedCol) {
      headerMap[idx] = matchedCol;
    }
  });

  const objects: Record<string, string>[] = [];

  rows.forEach((row, rowIdx) => {
    const obj: Record<string, string> = {};
    row.forEach((val, colIdx) => {
      const colDef = headerMap[colIdx];
      if (colDef) {
        obj[colDef.key] = val;
      } else if (headers[colIdx]) {
        obj[headers[colIdx]] = val;
      }
    });

    // Check required fields
    columns
      .filter((c) => c.required)
      .forEach((reqCol) => {
        if (!obj[reqCol.key] || obj[reqCol.key].trim() === '') {
          warnings.push(`Row ${rowIdx + 1}: Missing required field "${reqCol.label}"`);
        }
      });

    objects.push(obj);
  });

  return { objects, warnings };
}

/**
 * Registry of all Module Configurations for Import/Export
 */
export const MODULE_CONFIGS: Record<string, ModuleImportExportConfig> = {
  // 1. PATIENTS / RESIDENTS
  patients: {
    moduleKey: 'patients',
    displayName: 'Patients / Residents',
    templateFilename: 'ConnectCare_Patients_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Patients',
    permissionModule: 'Residents',
    columns: [
      { key: 'name', label: 'Patient Name', required: true, description: 'Full legal name of the resident/patient', sampleValue: 'Eleanor Vance' },
      { key: 'dob', label: 'Date of Birth', required: false, description: 'YYYY-MM-DD', sampleValue: '1952-04-12' },
      { key: 'gender', label: 'Gender', required: false, description: 'Male, Female, Other', sampleValue: 'Female' },
      { key: 'phone', label: 'Phone', required: false, description: 'Contact phone number', sampleValue: '(512) 555-0144' },
      { key: 'email', label: 'Email', required: false, description: 'Email address', sampleValue: 'eleanor.vance@example.com' },
      { key: 'careUnit', label: 'Care Unit', required: false, description: 'Assigned care unit or ward', sampleValue: 'Memory Care' },
      { key: 'floorRoom', label: 'Floor / Room', required: false, description: 'Assigned floor and room number', sampleValue: '2nd Floor - 204B' },
      { key: 'primaryDoctorName', label: 'Primary Doctor', required: false, description: 'Attending physician name', sampleValue: 'Dr. Marcus Bennett' },
      { key: 'status', label: 'Status', required: false, description: 'InCare, Discharged, Transferred, Observation', sampleValue: 'InCare' },
      { key: 'riskLevel', label: 'Risk Level', required: false, description: 'Low, Medium, High, Critical', sampleValue: 'High' },
      { key: 'allergies', label: 'Allergies', required: false, description: 'Comma-separated allergies', sampleValue: 'Penicillin, Peanuts' },
      { key: 'medicalHistory', label: 'Medical History', required: false, description: 'Key diagnoses & past history', sampleValue: 'Type 2 Diabetes, Hypertension' },
      { key: 'emergencyContact', label: 'Emergency Contact', required: false, description: 'Name, Relationship, Phone', sampleValue: 'Thomas Vance (Son) - (512) 555-0145' },
    ],
    sampleData: [
      {
        name: 'Eleanor Vance',
        dob: '1952-04-12',
        gender: 'Female',
        phone: '(512) 555-0144',
        email: 'eleanor.vance@example.com',
        careUnit: 'Memory Care',
        floorRoom: '2nd Floor - 204B',
        primaryDoctorName: 'Dr. Marcus Bennett',
        status: 'InCare',
        riskLevel: 'High',
        allergies: 'Penicillin',
        medicalHistory: 'Type 2 Diabetes, Hypertension',
        emergencyContact: 'Thomas Vance (Son) - (512) 555-0145',
      },
      {
        name: 'Arthur Pendelton',
        dob: '1948-11-23',
        gender: 'Male',
        phone: '(512) 555-0188',
        email: 'arthur.p@example.com',
        careUnit: 'Assisted Living',
        floorRoom: '1st Floor - 105',
        primaryDoctorName: 'Dr. Sarah Wilson',
        status: 'InCare',
        riskLevel: 'Medium',
        allergies: 'None',
        medicalHistory: 'Mild Osteoarthritis',
        emergencyContact: 'Clara Pendelton (Daughter) - (512) 555-0189',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.name || 'New Patient',
      dob: row.dob || '1960-01-01',
      gender: row.gender || 'Other',
      phone: row.phone || '(512) 555-0100',
      email: row.email || `patient_${Date.now()}@connectcare.org`,
      careUnit: row.careUnit || 'General Ward',
      floorRoom: row.floorRoom || '1st Floor - 101',
      primaryDoctorName: row.primaryDoctorName || '',
      status: row.status || 'InCare',
      riskLevel: row.riskLevel || 'Medium',
      allergies: row.allergies || '',
      medicalHistory: row.medicalHistory || '',
      emergencyContactName: row.emergencyContact || '',
    }),
    mapEntityToRow: (p) => ({
      name: p.name || '',
      dob: p.dob || '',
      gender: p.gender || p.ageGender || '',
      phone: p.phone || '',
      email: p.email || '',
      careUnit: p.careUnit || '',
      floorRoom: p.floorRoom || '',
      primaryDoctorName: p.primaryDoctorName || '',
      status: p.status || '',
      riskLevel: p.riskLevel || '',
      allergies: p.allergies || '',
      medicalHistory: p.medicalHistory || '',
      emergencyContact: p.emergencyContactName || p.emergencyContact || '',
    }),
  },

  // 2. DOCTORS
  doctors: {
    moduleKey: 'doctors',
    displayName: 'Doctors & Physicians',
    templateFilename: 'ConnectCare_Doctors_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Doctors',
    permissionModule: 'Doctors',
    columns: [
      { key: 'name', label: 'Doctor Name', required: true, description: 'Full name with title (e.g. Dr. Jonathan Hayes)', sampleValue: 'Dr. Jonathan Hayes' },
      { key: 'email', label: 'Email', required: true, description: 'Official medical email', sampleValue: 'dr.hayes@connectcare.org' },
      { key: 'phone', label: 'Phone', required: false, description: 'Direct contact phone', sampleValue: '(512) 555-0182' },
      { key: 'specialty', label: 'Specialty', required: true, description: 'Cardiology, Neurology, General Medicine, Orthopedics, Pediatrics, Pulmonology, Internal Medicine', sampleValue: 'Cardiology' },
      { key: 'department', label: 'Department', required: false, description: 'Department Name', sampleValue: 'Cardiology Department' },
      { key: 'location', label: 'Location / Suite', required: false, description: 'Clinic Suite or Room', sampleValue: 'Main Clinic - Suite 402' },
      { key: 'status', label: 'Status', required: false, description: 'Active, OnLeave, Inactive', sampleValue: 'Active' },
      { key: 'shift', label: 'Shift', required: false, description: 'Day Shift, Night Shift, On Call', sampleValue: 'Day Shift (08:00 AM - 04:00 PM)' },
      { key: 'qualifications', label: 'Qualifications', required: false, description: 'Degrees & Board certifications', sampleValue: 'MD, FACC - Harvard Medical School' },
      { key: 'experienceYears', label: 'Experience Years', required: false, description: 'Number of years', sampleValue: '12' },
      { key: 'consultationFee', label: 'Consultation Fee', required: false, description: 'Numerical fee', sampleValue: '150.00' },
      { key: 'teleconsultation', label: 'Teleconsultation', required: false, description: 'Yes / No', sampleValue: 'Yes' },
    ],
    sampleData: [
      {
        name: 'Dr. Jonathan Hayes',
        email: 'dr.hayes@connectcare.org',
        phone: '(512) 555-0182',
        specialty: 'Cardiology',
        department: 'Cardiology Department',
        location: 'Main Clinic - Suite 402',
        status: 'Active',
        shift: 'Day Shift (08:00 AM - 04:00 PM)',
        qualifications: 'MD, FACC - Harvard Medical School',
        experienceYears: '14',
        consultationFee: '150.00',
        teleconsultation: 'Yes',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.name || 'Dr. New Doctor',
      email: row.email || `doc_${Date.now()}@connectcare.org`,
      phone: row.phone || '(512) 555-0100',
      specialty: row.specialty || 'General Medicine',
      department: row.department || 'General Medicine',
      location: row.location || 'Suite 101',
      status: row.status || 'Active',
      shift: row.shift || 'Day Shift',
      qualifications: row.qualifications || 'MD',
      experienceYears: parseInt(row.experienceYears || '5', 10),
      consultationFee: parseFloat(row.consultationFee || '100.00'),
      teleconsultationEnabled: (row.teleconsultation || '').toLowerCase().startsWith('y'),
    }),
    mapEntityToRow: (d) => ({
      name: d.name || '',
      email: d.email || '',
      phone: d.phone || '',
      specialty: d.specialty || '',
      department: d.department || '',
      location: d.location || '',
      status: d.status || '',
      shift: d.shift || '',
      qualifications: d.qualifications || '',
      experienceYears: d.experienceYears || '',
      consultationFee: d.consultationFee || '',
      teleconsultation: d.teleconsultationEnabled ? 'Yes' : 'No',
    }),
  },

  // 3. NURSES
  nurses: {
    moduleKey: 'nurses',
    displayName: 'Nurses & Care Staff',
    templateFilename: 'ConnectCare_Nurses_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Nurses',
    permissionModule: 'Nurses',
    columns: [
      { key: 'name', label: 'Nurse Name', required: true, description: 'Full name with title (e.g. Sarah Jenkins, RN)', sampleValue: 'Sarah Jenkins, RN' },
      { key: 'email', label: 'Email', required: true, description: 'Official nursing email', sampleValue: 's.jenkins@connectcare.org' },
      { key: 'phone', label: 'Phone', required: false, description: 'Contact number', sampleValue: '(512) 555-0199' },
      { key: 'department', label: 'Department', required: false, description: 'Department Name', sampleValue: 'General Nursing' },
      { key: 'careUnit', label: 'Care Unit', required: false, description: 'Assigned Care Unit', sampleValue: 'ICU & Critical Care' },
      { key: 'status', label: 'Status', required: false, description: 'Active, OnLeave, Inactive', sampleValue: 'Active' },
      { key: 'shift', label: 'Shift', required: false, description: 'Day Shift, Night Shift, Rotating', sampleValue: 'Day Shift (07:00 AM - 07:00 PM)' },
      { key: 'licenseNumber', label: 'License Number', required: false, description: 'State Nursing License Code', sampleValue: 'RN-9928114' },
      { key: 'experienceYears', label: 'Experience Years', required: false, description: 'Years in practice', sampleValue: '8' },
    ],
    sampleData: [
      {
        name: 'Sarah Jenkins, RN',
        email: 's.jenkins@connectcare.org',
        phone: '(512) 555-0199',
        department: 'General Nursing',
        careUnit: 'ICU & Critical Care',
        status: 'Active',
        shift: 'Day Shift (07:00 AM - 07:00 PM)',
        licenseNumber: 'RN-9928114',
        experienceYears: '8',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.name || 'Nurse Practitioner',
      email: row.email || `nurse_${Date.now()}@connectcare.org`,
      phone: row.phone || '(512) 555-0101',
      department: row.department || 'General Ward',
      careUnit: row.careUnit || 'General Ward',
      status: row.status || 'Active',
      shift: row.shift || 'Day Shift',
      licenseNumber: row.licenseNumber || `RN-${Math.floor(100000 + Math.random() * 900000)}`,
      experienceYears: parseInt(row.experienceYears || '3', 10),
    }),
    mapEntityToRow: (n) => ({
      name: n.name || '',
      email: n.email || '',
      phone: n.phone || '',
      department: n.department || '',
      careUnit: n.careUnit || '',
      status: n.status || '',
      shift: n.shift || '',
      licenseNumber: n.licenseNumber || '',
      experienceYears: n.experienceYears || '',
    }),
  },

  // 4. CARE TEAMS
  'care-teams': {
    moduleKey: 'care-teams',
    displayName: 'Care Teams & Rosters',
    templateFilename: 'ConnectCare_CareTeams_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_CareTeams',
    permissionModule: 'Care Team',
    columns: [
      { key: 'name', label: 'Member Name', required: true, description: 'Full name of care team member', sampleValue: 'Dr. Alan Walker' },
      { key: 'role', label: 'Role', required: true, description: 'Doctor, Nurse, AlliedHealth, SupportStaff', sampleValue: 'Doctor' },
      { key: 'teamName', label: 'Team Name', required: true, description: 'Assigned care team', sampleValue: 'Cardiology Care Team' },
      { key: 'specialty', label: 'Specialty', required: false, description: 'Clinical specialty', sampleValue: 'Cardiology' },
      { key: 'department', label: 'Department', required: false, description: 'Department Name', sampleValue: 'Cardiology Unit' },
      { key: 'location', label: 'Location', required: false, description: 'Facility Location / Floor', sampleValue: 'Main Campus (3rd Floor)' },
      { key: 'phone', label: 'Phone', required: false, description: 'Contact Phone', sampleValue: '(512) 555-0133' },
      { key: 'email', label: 'Email', required: false, description: 'Contact Email', sampleValue: 'a.walker@connectcare.org' },
      { key: 'status', label: 'Status', required: false, description: 'Active, OnLeave, Inactive', sampleValue: 'Active' },
      { key: 'shift', label: 'Shift', required: false, description: 'Shift timings', sampleValue: 'Day Shift (07:00 AM - 03:00 PM)' },
    ],
    sampleData: [
      {
        name: 'Dr. Alan Walker',
        role: 'Doctor',
        teamName: 'Cardiology Care Team',
        specialty: 'Cardiology',
        department: 'Cardiology Unit',
        location: 'Main Campus (3rd Floor)',
        phone: '(512) 555-0133',
        email: 'a.walker@connectcare.org',
        status: 'Active',
        shift: 'Day Shift (07:00 AM - 03:00 PM)',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.name || 'Team Member',
      role: row.role || 'Doctor',
      teamName: row.teamName || 'General Care Team',
      specialty: row.specialty || 'General',
      department: row.department || 'General Ward',
      location: row.location || 'Main Building',
      phone: row.phone || '(512) 555-0100',
      email: row.email || `careteam_${Date.now()}@connectcare.org`,
      status: row.status || 'Active',
      shift: row.shift || 'Day Shift',
    }),
    mapEntityToRow: (m) => ({
      name: m.name || '',
      role: m.role || '',
      teamName: m.teamName || '',
      specialty: m.specialty || '',
      department: m.department || '',
      location: m.location || '',
      phone: m.phone || '',
      email: m.email || '',
      status: m.status || '',
      shift: m.shift || '',
    }),
  },

  // 5. LOCATIONS & UNITS
  locations: {
    moduleKey: 'locations',
    displayName: 'Locations & Units',
    templateFilename: 'ConnectCare_Locations_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Locations',
    permissionModule: 'Locations',
    columns: [
      { key: 'code', label: 'Location Code', required: false, description: 'Unique code (e.g. LOC-101)', sampleValue: 'LOC-501' },
      { key: 'name', label: 'Location Name', required: true, description: 'Unit or Ward Name', sampleValue: 'Memory Care Wing B' },
      { key: 'facility', label: 'Facility', required: false, description: 'Facility or Building Name', sampleValue: 'Austin Care Center' },
      { key: 'type', label: 'Type', required: false, description: 'Ward, ICU, Memory Care, Rehab, Outpatient', sampleValue: 'Memory Care' },
      { key: 'floor', label: 'Floor', required: false, description: 'Floor number / wing', sampleValue: 'Floor 2' },
      { key: 'beds', label: 'Total Beds', required: false, description: 'Number of beds', sampleValue: 24 },
      { key: 'capacity', label: 'Capacity', required: false, description: 'Max patient capacity', sampleValue: 24 },
      { key: 'occupied', label: 'Occupied Beds', required: false, description: 'Current occupied bed count', sampleValue: 18 },
      { key: 'status', label: 'Status', required: false, description: 'Active, Inactive, Maintenance', sampleValue: 'Active' },
    ],
    sampleData: [
      {
        code: 'LOC-501',
        name: 'Memory Care Wing B',
        facility: 'Austin Care Center',
        type: 'Memory Care',
        floor: 'Floor 2',
        beds: 24,
        capacity: 24,
        occupied: 18,
        status: 'Active',
      },
    ],
    mapRowToEntity: (row) => ({
      code: row.code || `LOC-${Math.floor(100 + Math.random() * 900)}`,
      name: row.name || 'New Unit',
      facility: row.facility || 'Main Facility',
      type: row.type || 'General Ward',
      floor: row.floor || 'Floor 1',
      beds: parseInt(String(row.beds || '20'), 10),
      capacity: parseInt(String(row.capacity || '20'), 10),
      occupied: parseInt(String(row.occupied || '0'), 10),
      status: row.status || 'Active',
    }),
    mapEntityToRow: (l) => ({
      code: l.code || '',
      name: l.name || '',
      facility: l.facility || '',
      type: l.type || '',
      floor: l.floor || '',
      beds: l.beds || 0,
      capacity: l.capacity || 0,
      occupied: l.occupied || 0,
      status: l.status || '',
    }),
  },

  // 6. ALERTS & INCIDENTS
  alerts: {
    moduleKey: 'alerts',
    displayName: 'Alerts & Incidents',
    templateFilename: 'ConnectCare_Alerts_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Alerts',
    permissionModule: 'Alerts & Incidents',
    columns: [
      { key: 'title', label: 'Alert Title', required: true, description: 'Short summary of alert', sampleValue: 'High Systolic BP Warning' },
      { key: 'category', label: 'Category', required: true, description: 'Vital Signs, Medication, Clinical, Fall Risk, Lab, System', sampleValue: 'Vital Signs' },
      { key: 'severity', label: 'Severity', required: true, description: 'Critical, High, Medium, Low', sampleValue: 'Critical' },
      { key: 'patientName', label: 'Patient Name', required: false, description: 'Associated patient name', sampleValue: 'Eleanor Vance' },
      { key: 'roomLocation', label: 'Room / Location', required: false, description: 'Room or location code', sampleValue: 'Room 204B' },
      { key: 'status', label: 'Status', required: false, description: 'New, Acknowledged, InProgress, Resolved', sampleValue: 'New' },
      { key: 'description', label: 'Description', required: false, description: 'Detailed alert message / clinical observation', sampleValue: 'Systolic blood pressure exceeded 165 mmHg' },
      { key: 'timestampText', label: 'Timestamp', required: false, description: 'Time triggered (e.g. 2 mins ago)', sampleValue: 'Just now' },
    ],
    sampleData: [
      {
        title: 'High Systolic BP Warning',
        category: 'Vital Signs',
        severity: 'Critical',
        patientName: 'Eleanor Vance',
        roomLocation: 'Room 204B',
        status: 'New',
        description: 'Systolic blood pressure exceeded 165 mmHg',
        timestampText: 'Just now',
      },
    ],
    mapRowToEntity: (row) => ({
      title: row.title || 'Clinical Alert',
      category: row.category || 'Clinical',
      severity: row.severity || 'Medium',
      patientName: row.patientName || '',
      roomLocation: row.roomLocation || 'General Ward',
      status: row.status || 'New',
      description: row.description || row.title || '',
      timestampText: row.timestampText || 'Just now',
    }),
    mapEntityToRow: (a) => ({
      title: a.title || '',
      category: a.category || '',
      severity: a.severity || '',
      patientName: a.patientName || '',
      roomLocation: a.roomLocation || '',
      status: a.status || '',
      description: a.description || a.message || '',
      timestampText: a.timestampText || a.timeAgo || '',
    }),
  },

  // 7. TASKS & ACTIVITIES
  tasks: {
    moduleKey: 'tasks',
    displayName: 'Tasks & Activities',
    templateFilename: 'ConnectCare_Tasks_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Tasks',
    permissionModule: 'Tasks',
    columns: [
      { key: 'title', label: 'Task Title', required: true, description: 'Actionable task title', sampleValue: 'Administer Evening Insulin' },
      { key: 'category', label: 'Category', required: false, description: 'Medication, Vital Signs, Assessment, Hygiene, Nutrition', sampleValue: 'Medication' },
      { key: 'priority', label: 'Priority', required: false, description: 'Low, Medium, High, Critical', sampleValue: 'High' },
      { key: 'status', label: 'Status', required: false, description: 'Pending, InProgress, Completed, Overdue', sampleValue: 'Pending' },
      { key: 'assignedCaregiver', label: 'Assigned To', required: false, description: 'Name of nurse / doctor', sampleValue: 'Sarah Jenkins' },
      { key: 'assigneeRole', label: 'Assignee Role', required: false, description: 'Nurse, Doctor, Caregiver', sampleValue: 'Nurse' },
      { key: 'patientName', label: 'Patient Name', required: false, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'dueTime', label: 'Due Time', required: false, description: 'Time (e.g. 08:00 PM)', sampleValue: '08:00 PM' },
      { key: 'dueDate', label: 'Due Date', required: false, description: 'YYYY-MM-DD', sampleValue: '2026-08-30' },
      { key: 'description', label: 'Description', required: false, description: 'Task instructions & notes', sampleValue: 'Administer 10 units of Lantus subcutaneous' },
    ],
    sampleData: [
      {
        title: 'Administer Evening Insulin',
        category: 'Medication',
        priority: 'High',
        status: 'Pending',
        assignedCaregiver: 'Sarah Jenkins',
        assigneeRole: 'Nurse',
        patientName: 'Eleanor Vance',
        dueTime: '08:00 PM',
        dueDate: '2026-08-30',
        description: 'Administer 10 units of Lantus subcutaneous',
      },
    ],
    mapRowToEntity: (row) => ({
      title: row.title || 'Care Task',
      category: row.category || 'General',
      priority: row.priority || 'Medium',
      statusStr: row.status || 'Pending',
      assignedCaregiver: row.assignedCaregiver || 'Care Team',
      assigneeRole: row.assigneeRole || 'Nurse',
      patientName: row.patientName || '',
      dueTime: row.dueTime || '12:00 PM',
      dueDate: row.dueDate || new Date().toISOString().slice(0, 10),
      description: row.description || '',
    }),
    mapEntityToRow: (t) => ({
      title: t.title || '',
      category: t.category || '',
      priority: t.priority || '',
      status: t.statusStr || t.status || '',
      assignedCaregiver: t.assignedCaregiver || '',
      assigneeRole: t.assigneeRole || '',
      patientName: t.patientName || '',
      dueTime: t.dueTime || '',
      dueDate: t.dueDate || '',
      description: t.description || '',
    }),
  },

  // 8. MEDICATIONS
  medications: {
    moduleKey: 'medications',
    displayName: 'Medication Management',
    templateFilename: 'ConnectCare_Medications_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Medications',
    permissionModule: 'Medication',
    columns: [
      { key: 'name', label: 'Medication Name', required: true, description: 'Drug name and strength (e.g. Metformin 500mg)', sampleValue: 'Metformin 500mg' },
      { key: 'dosage', label: 'Dosage', required: true, description: 'Dose amount (e.g. 500 mg)', sampleValue: '500 mg' },
      { key: 'frequency', label: 'Frequency', required: true, description: 'Once daily, Twice daily, Every 8 hours, PRN', sampleValue: 'Twice daily with meals' },
      { key: 'route', label: 'Route', required: false, description: 'Oral, Subcutaneous, IV, Topical, Inhalation', sampleValue: 'Oral' },
      { key: 'patientName', label: 'Patient Name', required: false, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'prescribedBy', label: 'Prescribed By', required: false, description: 'Prescribing Physician', sampleValue: 'Dr. Marcus Bennett' },
      { key: 'status', label: 'Status', required: false, description: 'Active, OnHold, Discontinued', sampleValue: 'Active' },
      { key: 'stock', label: 'Stock / Inventory', required: false, description: 'Available quantity (e.g. 120 tabs)', sampleValue: '120 tabs' },
      { key: 'instructions', label: 'Instructions', required: false, description: 'Special administration instructions', sampleValue: 'Take with breakfast and dinner' },
    ],
    sampleData: [
      {
        name: 'Metformin 500mg',
        dosage: '500 mg',
        frequency: 'Twice daily with meals',
        route: 'Oral',
        patientName: 'Eleanor Vance',
        prescribedBy: 'Dr. Marcus Bennett',
        status: 'Active',
        stock: '120 tabs',
        instructions: 'Take with breakfast and dinner',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.name || 'Medication',
      dosage: row.dosage || 'Standard Dose',
      frequency: row.frequency || 'Daily',
      route: row.route || 'Oral',
      patientName: row.patientName || '',
      prescribedBy: row.prescribedBy || 'Attending Physician',
      status: row.status || 'Active',
      stock: row.stock || '100 units',
      instructions: row.instructions || '',
    }),
    mapEntityToRow: (m) => ({
      name: m.name || '',
      dosage: m.dosage || '',
      frequency: m.frequency || '',
      route: m.route || '',
      patientName: m.patientName || '',
      prescribedBy: m.prescribedBy || '',
      status: m.status || '',
      stock: m.stock || '',
      instructions: m.instructions || '',
    }),
  },

  // 9. CONSULTATIONS / APPOINTMENTS
  consultations: {
    moduleKey: 'consultations',
    displayName: 'Consultations & Appointments',
    templateFilename: 'ConnectCare_Consultations_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Consultations',
    permissionModule: 'Clinical',
    columns: [
      { key: 'patientName', label: 'Patient Name', required: true, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'doctorName', label: 'Doctor Name', required: true, description: 'Doctor name', sampleValue: 'Dr. Marcus Bennett' },
      { key: 'specialty', label: 'Specialty', required: false, description: 'Specialty / Department', sampleValue: 'Cardiology' },
      { key: 'dateTime', label: 'Date & Time', required: true, description: 'YYYY-MM-DD HH:MM', sampleValue: '2026-08-31 10:00 AM' },
      { key: 'type', label: 'Type', required: false, description: 'In-Person, Teleconsultation, Ward Visit, Specialist', sampleValue: 'In-Person' },
      { key: 'status', label: 'Status', required: false, description: 'Scheduled, InProgress, Completed, Cancelled', sampleValue: 'Scheduled' },
      { key: 'diagnosis', label: 'Reason / Diagnosis', required: false, description: 'Consultation purpose or diagnosis', sampleValue: 'Hypertension Routine Follow-up' },
      { key: 'notes', label: 'Clinical Notes', required: false, description: 'Doctor consultation notes', sampleValue: 'Evaluate systolic BP trend and adjust ACE inhibitor' },
    ],
    sampleData: [
      {
        patientName: 'Eleanor Vance',
        doctorName: 'Dr. Marcus Bennett',
        specialty: 'Cardiology',
        dateTime: '2026-08-31 10:00 AM',
        type: 'In-Person',
        status: 'Scheduled',
        diagnosis: 'Hypertension Routine Follow-up',
        notes: 'Evaluate systolic BP trend and adjust ACE inhibitor',
      },
    ],
    mapRowToEntity: (row) => ({
      patientName: row.patientName || 'Patient',
      doctorName: row.doctorName || 'Doctor',
      specialty: row.specialty || 'General',
      date: row.dateTime || '2026-08-31 10:00 AM',
      type: row.type || 'In-Person',
      status: row.status || 'Scheduled',
      diagnosis: row.diagnosis || '',
      notes: row.notes || '',
    }),
    mapEntityToRow: (c) => ({
      patientName: c.patientName || c.patient || '',
      doctorName: c.doctorName || c.doctor || '',
      specialty: c.specialty || '',
      dateTime: c.date || c.dateTime || c.time || '',
      type: c.type || '',
      status: c.status || '',
      diagnosis: c.diagnosis || c.reason || '',
      notes: c.notes || '',
    }),
  },

  // 10. CARE PLANS
  'care-plans': {
    moduleKey: 'care-plans',
    displayName: 'Care Plans',
    templateFilename: 'ConnectCare_CarePlans_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_CarePlans',
    permissionModule: 'Clinical',
    columns: [
      { key: 'patientName', label: 'Patient Name', required: true, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'careUnit', label: 'Care Unit', required: false, description: 'Assigned care unit', sampleValue: 'Memory Care' },
      { key: 'condition', label: 'Primary Condition / Diagnosis', required: true, description: 'Clinical condition', sampleValue: 'Mild Cognitive Impairment & Type 2 Diabetes' },
      { key: 'goals', label: 'Goals', required: false, description: 'Target clinical goals', sampleValue: 'Maintain HbA1c < 7.0% and daily physical mobility' },
      { key: 'interventions', label: 'Interventions', required: false, description: 'Nursing interventions', sampleValue: 'Daily glucose monitoring and low-sodium diet' },
      { key: 'targetDate', label: 'Target Date', required: false, description: 'Target review date (YYYY-MM-DD)', sampleValue: '2026-12-31' },
      { key: 'status', label: 'Status', required: false, description: 'Active, UnderReview, Completed', sampleValue: 'Active' },
      { key: 'createdBy', label: 'Created By', required: false, description: 'Doctor or care coordinator', sampleValue: 'Dr. Marcus Bennett' },
    ],
    sampleData: [
      {
        patientName: 'Eleanor Vance',
        careUnit: 'Memory Care',
        condition: 'Mild Cognitive Impairment & Type 2 Diabetes',
        goals: 'Maintain HbA1c < 7.0% and daily physical mobility',
        interventions: 'Daily glucose monitoring and low-sodium diet',
        targetDate: '2026-12-31',
        status: 'Active',
        createdBy: 'Dr. Marcus Bennett',
      },
    ],
    mapRowToEntity: (row) => ({
      patientName: row.patientName || 'Patient',
      careUnit: row.careUnit || 'General Ward',
      condition: row.condition || 'General Care Plan',
      goals: row.goals || '',
      interventions: row.interventions || '',
      targetDate: row.targetDate || '2026-12-31',
      status: row.status || 'Active',
      createdBy: row.createdBy || 'Care Team',
    }),
    mapEntityToRow: (cp) => ({
      patientName: cp.patientName || cp.patient || '',
      careUnit: cp.careUnit || cp.unit || '',
      condition: cp.condition || cp.diagnosis || '',
      goals: cp.goals || '',
      interventions: cp.interventions || '',
      targetDate: cp.targetDate || '',
      status: cp.status || '',
      createdBy: cp.createdBy || '',
    }),
  },

  // 11. VITAL ROUNDS
  'vital-rounds': {
    moduleKey: 'vital-rounds',
    displayName: 'Vital Rounds & Observations',
    templateFilename: 'ConnectCare_VitalRounds_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_VitalRounds',
    permissionModule: 'Clinical',
    columns: [
      { key: 'patientName', label: 'Patient Name', required: true, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'room', label: 'Room / Bed', required: false, description: 'Room location', sampleValue: 'Room 204B' },
      { key: 'bloodPressure', label: 'Blood Pressure', required: false, description: 'Systolic/Diastolic (e.g. 128/82)', sampleValue: '128/82' },
      { key: 'heartRate', label: 'Heart Rate (bpm)', required: false, description: 'Beats per minute', sampleValue: '74' },
      { key: 'respiratoryRate', label: 'Respiratory Rate', required: false, description: 'Breaths per min', sampleValue: '16' },
      { key: 'temperature', label: 'Temperature', required: false, description: 'Degrees (e.g. 98.6°F)', sampleValue: '98.6°F' },
      { key: 'spO2', label: 'SpO2 (%)', required: false, description: 'Oxygen saturation', sampleValue: '98%' },
      { key: 'bloodSugar', label: 'Blood Sugar (mg/dL)', required: false, description: 'Glucose reading', sampleValue: '112 mg/dL' },
      { key: 'recordedBy', label: 'Recorded By', required: false, description: 'Nurse name', sampleValue: 'Sarah Jenkins, RN' },
      { key: 'time', label: 'Recorded Time', required: false, description: 'Timestamp', sampleValue: '08:00 AM' },
    ],
    sampleData: [
      {
        patientName: 'Eleanor Vance',
        room: 'Room 204B',
        bloodPressure: '128/82',
        heartRate: '74',
        respiratoryRate: '16',
        temperature: '98.6°F',
        spO2: '98%',
        bloodSugar: '112 mg/dL',
        recordedBy: 'Sarah Jenkins, RN',
        time: '08:00 AM',
      },
    ],
    mapRowToEntity: (row) => ({
      patientName: row.patientName || 'Patient',
      room: row.room || 'Room 101',
      bloodPressure: row.bloodPressure || '120/80',
      heartRate: row.heartRate || '72',
      respiratoryRate: row.respiratoryRate || '16',
      temperature: row.temperature || '98.6°F',
      spO2: row.spO2 || '98%',
      bloodSugar: row.bloodSugar || '100 mg/dL',
      recordedBy: row.recordedBy || 'Staff Nurse',
      time: row.time || 'Now',
    }),
    mapEntityToRow: (vr) => ({
      patientName: vr.patientName || vr.patient || '',
      room: vr.room || vr.roomNumber || '',
      bloodPressure: vr.bloodPressure || vr.bp || '',
      heartRate: vr.heartRate || vr.hr || '',
      respiratoryRate: vr.respiratoryRate || vr.rr || '',
      temperature: vr.temperature || vr.temp || '',
      spO2: vr.spO2 || vr.spo2 || '',
      bloodSugar: vr.bloodSugar || vr.glucose || '',
      recordedBy: vr.recordedBy || '',
      time: vr.time || vr.recordedTime || '',
    }),
  },

  // 12. SHIFT HANDOVER
  'shift-handover': {
    moduleKey: 'shift-handover',
    displayName: 'Shift Handover',
    templateFilename: 'ConnectCare_ShiftHandover_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_ShiftHandover',
    permissionModule: 'Clinical',
    columns: [
      { key: 'shiftType', label: 'Shift Type', required: true, description: 'Day to Night, Night to Day, Mid-Day', sampleValue: 'Day to Night' },
      { key: 'wardUnit', label: 'Ward / Unit', required: true, description: 'Unit name', sampleValue: 'Memory Care Wing B' },
      { key: 'outgoingNurse', label: 'Outgoing Nurse', required: true, description: 'Staff nurse handing over', sampleValue: 'Sarah Jenkins, RN' },
      { key: 'incomingNurse', label: 'Incoming Nurse', required: true, description: 'Staff nurse receiving handover', sampleValue: 'David Miller, RN' },
      { key: 'patientsCount', label: 'Patients Count', required: false, description: 'Total patients reviewed', sampleValue: '18' },
      { key: 'criticalNotes', label: 'Critical Notes', required: false, description: 'Key patient updates & watchouts', sampleValue: 'Bed 204B post-prandial glucose monitored. Bed 105 fall precautions in place.' },
      { key: 'status', label: 'Status', required: false, description: 'Pending, InProgress, Completed', sampleValue: 'Completed' },
    ],
    sampleData: [
      {
        shiftType: 'Day to Night',
        wardUnit: 'Memory Care Wing B',
        outgoingNurse: 'Sarah Jenkins, RN',
        incomingNurse: 'David Miller, RN',
        patientsCount: '18',
        criticalNotes: 'Bed 204B post-prandial glucose monitored. Bed 105 fall precautions in place.',
        status: 'Completed',
      },
    ],
    mapRowToEntity: (row) => ({
      shiftType: row.shiftType || 'Day to Night',
      wardUnit: row.wardUnit || 'General Ward',
      outgoingNurse: row.outgoingNurse || 'Outgoing Staff',
      incomingNurse: row.incomingNurse || 'Incoming Staff',
      patientsCount: parseInt(row.patientsCount || '10', 10),
      criticalNotes: row.criticalNotes || '',
      status: row.status || 'Completed',
    }),
    mapEntityToRow: (sh) => ({
      shiftType: sh.shiftType || sh.shift || '',
      wardUnit: sh.wardUnit || sh.unit || '',
      outgoingNurse: sh.outgoingNurse || '',
      incomingNurse: sh.incomingNurse || '',
      patientsCount: sh.patientsCount || 0,
      criticalNotes: sh.criticalNotes || sh.notes || '',
      status: sh.status || '',
    }),
  },

  // 13. DISCHARGE CHECKLISTS
  'discharge-checklists': {
    moduleKey: 'discharge-checklists',
    displayName: 'Discharge Checklists',
    templateFilename: 'ConnectCare_DischargeChecklists_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_DischargeChecklists',
    permissionModule: 'Clinical',
    columns: [
      { key: 'patientName', label: 'Patient Name', required: true, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'doctorName', label: 'Doctor Name', required: false, description: 'Discharging physician', sampleValue: 'Dr. Marcus Bennett' },
      { key: 'targetDate', label: 'Target Discharge Date', required: false, description: 'YYYY-MM-DD', sampleValue: '2026-09-05' },
      { key: 'status', label: 'Status', required: false, description: 'Pending, InProgress, Ready, Discharged', sampleValue: 'InProgress' },
      { key: 'medicalClearance', label: 'Medical Clearance', required: false, description: 'Yes / No', sampleValue: 'Yes' },
      { key: 'medicationsDispensed', label: 'Medications Dispensed', required: false, description: 'Yes / No', sampleValue: 'Yes' },
      { key: 'transportation', label: 'Transportation Arranged', required: false, description: 'Family, Ambulance, Taxi, N/A', sampleValue: 'Yes - Family pickup' },
      { key: 'followupScheduled', label: 'Follow-up Scheduled', required: false, description: 'Details of followup appointment', sampleValue: 'Yes - Sept 12 Cardiology' },
    ],
    sampleData: [
      {
        patientName: 'Eleanor Vance',
        doctorName: 'Dr. Marcus Bennett',
        targetDate: '2026-09-05',
        status: 'InProgress',
        medicalClearance: 'Yes',
        medicationsDispensed: 'Yes',
        transportation: 'Yes - Family pickup',
        followupScheduled: 'Yes - Sept 12 Cardiology',
      },
    ],
    mapRowToEntity: (row) => ({
      patientName: row.patientName || 'Patient',
      doctorName: row.doctorName || 'Doctor',
      targetDate: row.targetDate || '2026-09-05',
      status: row.status || 'InProgress',
      medicalClearance: (row.medicalClearance || '').toLowerCase().startsWith('y'),
      medicationsDispensed: (row.medicationsDispensed || '').toLowerCase().startsWith('y'),
      transportation: row.transportation || 'Family pickup',
      followupScheduled: row.followupScheduled || 'Scheduled',
    }),
    mapEntityToRow: (dc) => ({
      patientName: dc.patientName || dc.patient || '',
      doctorName: dc.doctorName || dc.doctor || '',
      targetDate: dc.targetDate || dc.targetDischargeDate || '',
      status: dc.status || '',
      medicalClearance: dc.medicalClearance ? 'Yes' : 'No',
      medicationsDispensed: dc.medicationsDispensed ? 'Yes' : 'No',
      transportation: dc.transportation || '',
      followupScheduled: dc.followupScheduled || '',
    }),
  },

  // 14. DOCUMENTATIONS
  documentations: {
    moduleKey: 'documentations',
    displayName: 'Clinical Documentation & Notes',
    templateFilename: 'ConnectCare_Documentations_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Documentations',
    permissionModule: 'Clinical',
    columns: [
      { key: 'documentName', label: 'Document Name', required: true, description: 'Title of clinical note', sampleValue: 'Daily Nursing Assessment' },
      { key: 'docType', label: 'Document Type', required: true, description: 'Progress Note, Assessment, Care Plan, Incident, Handover', sampleValue: 'Progress Note' },
      { key: 'patientName', label: 'Patient Name', required: true, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'authorName', label: 'Author Name', required: false, description: 'Staff author', sampleValue: 'Sarah Jenkins, RN' },
      { key: 'status', label: 'Status', required: false, description: 'Draft, Completed, Approved', sampleValue: 'Completed' },
      { key: 'createdDate', label: 'Created Date', required: false, description: 'YYYY-MM-DD', sampleValue: '2026-08-30' },
      { key: 'notesContent', label: 'Notes / Summary', required: false, description: 'Clinical narrative and documentation content', sampleValue: 'Patient alert and oriented x3. Tolerated meals well.' },
    ],
    sampleData: [
      {
        documentName: 'Daily Nursing Assessment',
        docType: 'Progress Note',
        patientName: 'Eleanor Vance',
        authorName: 'Sarah Jenkins, RN',
        status: 'Completed',
        createdDate: '2026-08-30',
        notesContent: 'Patient alert and oriented x3. Tolerated meals well.',
      },
    ],
    mapRowToEntity: (row) => ({
      documentName: row.documentName || 'Clinical Note',
      docType: row.docType || 'Progress Note',
      patientName: row.patientName || 'Patient',
      authorName: row.authorName || 'Staff Nurse',
      status: row.status || 'Completed',
      createdDate: row.createdDate || new Date().toISOString().slice(0, 10),
      notesContent: row.notesContent || '',
    }),
    mapEntityToRow: (d) => ({
      documentName: d.documentName || d.name || d.title || '',
      docType: d.docType || d.type || '',
      patientName: d.patientName || d.patient || '',
      authorName: d.authorName || d.author || '',
      status: d.status || '',
      createdDate: d.createdDate || d.date || '',
      notesContent: d.notesContent || d.summary || d.content || '',
    }),
  },

  // 15. MESSAGES & CARE CHAT
  messages: {
    moduleKey: 'messages',
    displayName: 'Messages & Care Chat',
    templateFilename: 'ConnectCare_Messages_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Messages',
    permissionModule: 'Messages',
    columns: [
      { key: 'sender', label: 'Sender Name', required: true, description: 'Sender of the message', sampleValue: 'Dr. Marcus Bennett' },
      { key: 'recipient', label: 'Recipient / Channel', required: true, description: 'Recipient user or care channel', sampleValue: 'Sarah Jenkins, RN' },
      { key: 'subject', label: 'Subject / Topic', required: false, description: 'Subject or category', sampleValue: 'Medication Change - Bed 204B' },
      { key: 'priority', label: 'Priority', required: false, description: 'Normal, High, Urgent', sampleValue: 'High' },
      { key: 'content', label: 'Message Content', required: true, description: 'Full message body', sampleValue: 'Please hold morning ACE inhibitor pending lab review.' },
      { key: 'timestamp', label: 'Timestamp', required: false, description: 'Sent timestamp', sampleValue: '2026-08-30 09:15 AM' },
    ],
    sampleData: [
      {
        sender: 'Dr. Marcus Bennett',
        recipient: 'Sarah Jenkins, RN',
        subject: 'Medication Change - Bed 204B',
        priority: 'High',
        content: 'Please hold morning ACE inhibitor pending lab review.',
        timestamp: '2026-08-30 09:15 AM',
      },
    ],
    mapRowToEntity: (row) => ({
      sender: row.sender || 'Staff',
      recipient: row.recipient || 'Care Team',
      subject: row.subject || 'Clinical Message',
      priority: row.priority || 'Normal',
      content: row.content || '',
      timestamp: row.timestamp || 'Just now',
    }),
    mapEntityToRow: (m) => ({
      sender: m.senderName || m.sender || '',
      recipient: m.recipientName || m.recipient || '',
      subject: m.subject || m.title || '',
      priority: m.priority || '',
      content: m.content || m.message || m.text || '',
      timestamp: m.timestamp || m.sentAt || '',
    }),
  },

  // 16. NOTIFICATIONS
  notifications: {
    moduleKey: 'notifications',
    displayName: 'Notifications Center',
    templateFilename: 'ConnectCare_Notifications_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Notifications',
    columns: [
      { key: 'title', label: 'Notification Title', required: true, description: 'Title headline', sampleValue: 'Lab Results Ready' },
      { key: 'message', label: 'Message', required: true, description: 'Notification message body', sampleValue: 'Potassium lab results ready for review' },
      { key: 'category', label: 'Category', required: false, description: 'Lab, Medication, Alert, System, Task', sampleValue: 'Lab' },
      { key: 'severity', label: 'Severity', required: false, description: 'Low, Medium, High, Critical', sampleValue: 'Medium' },
      { key: 'patientName', label: 'Patient Name', required: false, description: 'Patient name', sampleValue: 'Eleanor Vance' },
      { key: 'roomLocation', label: 'Room Location', required: false, description: 'Room number', sampleValue: '204B' },
      { key: 'status', label: 'Status', required: false, description: 'Read, Unread', sampleValue: 'Unread' },
      { key: 'timestamp', label: 'Timestamp', required: false, description: 'Time created', sampleValue: '2026-08-30 08:45 AM' },
    ],
    sampleData: [
      {
        title: 'Lab Results Ready',
        message: 'Potassium lab results ready for review',
        category: 'Lab',
        severity: 'Medium',
        patientName: 'Eleanor Vance',
        roomLocation: '204B',
        status: 'Unread',
        timestamp: '2026-08-30 08:45 AM',
      },
    ],
    mapRowToEntity: (row) => ({
      title: row.title || 'Notification',
      message: row.message || '',
      type: row.category || 'General',
      severity: row.severity || 'Medium',
      patientName: row.patientName || '',
      roomLocation: row.roomLocation || '',
      isRead: (row.status || '').toLowerCase() === 'read',
      timestampText: row.timestamp || 'Just now',
    }),
    mapEntityToRow: (n) => ({
      title: n.title || '',
      message: n.message || '',
      category: n.type || n.category || '',
      severity: n.severity || '',
      patientName: n.patientName || '',
      roomLocation: n.roomLocation || '',
      status: n.isRead ? 'Read' : 'Unread',
      timestamp: n.timestampText || n.createdDate || '',
    }),
  },

  // 17. AUDIT LOGS
  'audit-logs': {
    moduleKey: 'audit-logs',
    displayName: 'Audit Logs',
    templateFilename: 'ConnectCare_AuditLogs_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_AuditLogs',
    permissionModule: 'Audit Logs',
    columns: [
      { key: 'timestamp', label: 'Timestamp', required: false, description: 'YYYY-MM-DD HH:MM:SS', sampleValue: '2026-08-30 08:30:15' },
      { key: 'userName', label: 'User Name', required: true, description: 'Name of user performing action', sampleValue: 'Admin User' },
      { key: 'role', label: 'Role', required: false, description: 'User role', sampleValue: 'Administrator' },
      { key: 'action', label: 'Action', required: true, description: 'CREATE, UPDATE, DELETE, LOGIN, EXPORT', sampleValue: 'UPDATE' },
      { key: 'module', label: 'Module', required: true, description: 'System module affected', sampleValue: 'Medication' },
      { key: 'ipAddress', label: 'IP Address', required: false, description: 'IP address', sampleValue: '192.168.1.45' },
      { key: 'status', label: 'Status', required: false, description: 'Success, Failed, Warning', sampleValue: 'Success' },
      { key: 'description', label: 'Description', required: false, description: 'Details of action taken', sampleValue: 'Updated dosage for Metformin on Patient P-1001' },
    ],
    sampleData: [
      {
        timestamp: '2026-08-30 08:30:15',
        userName: 'Admin User',
        role: 'Administrator',
        action: 'UPDATE',
        module: 'Medication',
        ipAddress: '192.168.1.45',
        status: 'Success',
        description: 'Updated dosage for Metformin on Patient P-1001',
      },
    ],
    mapRowToEntity: (row) => ({
      userName: row.userName || 'System User',
      userRole: row.role || 'User',
      action: row.action || 'UPDATE',
      module: row.module || 'System',
      ipAddress: row.ipAddress || '127.0.0.1',
      status: row.status || 'Success',
      recordDescription: row.description || '',
      createdDate: row.timestamp || new Date().toISOString(),
    }),
    mapEntityToRow: (a) => ({
      timestamp: a.createdDate || a.timestamp || '',
      userName: a.userName || a.user || '',
      role: a.userRole || a.role || '',
      action: a.action || '',
      module: a.module || '',
      ipAddress: a.ipAddress || '',
      status: a.status || '',
      description: a.recordDescription || a.description || a.details || '',
    }),
  },

  // 18. INTEGRATIONS
  integrations: {
    moduleKey: 'integrations',
    displayName: 'System Integrations',
    templateFilename: 'ConnectCare_Integrations_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Integrations',
    permissionModule: 'Integrations',
    columns: [
      { key: 'name', label: 'Integration Name', required: true, description: 'Name of integration service', sampleValue: 'Epic EHR Gateway' },
      { key: 'category', label: 'Category', required: true, description: 'EHR / EMR, Pharmacy, Lab, Billing, Device', sampleValue: 'EHR / EMR' },
      { key: 'provider', label: 'Provider', required: false, description: 'Vendor provider name', sampleValue: 'Epic Systems' },
      { key: 'environment', label: 'Environment', required: false, description: 'Production, Staging, Development', sampleValue: 'Production' },
      { key: 'status', label: 'Status', required: false, description: 'Active, Inactive, Error', sampleValue: 'Active' },
      { key: 'syncFrequency', label: 'Sync Frequency', required: false, description: 'Real-time, Every 5 mins, Hourly, Daily', sampleValue: 'Every 5 mins' },
      { key: 'healthStatus', label: 'Health Status', required: false, description: 'Healthy, Degraded, Offline', sampleValue: 'Healthy' },
    ],
    sampleData: [
      {
        name: 'Epic EHR Gateway',
        category: 'EHR / EMR',
        provider: 'Epic Systems',
        environment: 'Production',
        status: 'Active',
        syncFrequency: 'Every 5 mins',
        healthStatus: 'Healthy',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.name || 'Integration Service',
      category: row.category || 'EHR',
      provider: row.provider || 'Provider',
      environment: row.environment || 'Production',
      status: row.status || 'Active',
      syncFrequency: row.syncFrequency || 'Real-time',
      healthStatus: row.healthStatus || 'Healthy',
    }),
    mapEntityToRow: (i) => ({
      name: i.name || '',
      category: i.category || '',
      provider: i.provider || '',
      environment: i.environment || '',
      status: i.status || '',
      syncFrequency: i.syncFrequency || i.frequency || '',
      healthStatus: i.healthStatus || i.health || '',
    }),
  },

  // 19. AI OPERATIONS & WORKFLOWS
  'ai-operations': {
    moduleKey: 'ai-operations',
    displayName: 'AI Operations & Workflows',
    templateFilename: 'ConnectCare_AiOperations_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_AiOperations',
    permissionModule: 'AI Operations',
    columns: [
      { key: 'name', label: 'Workflow / Service Name', required: true, description: 'AI service name', sampleValue: 'Clinical Alert Triage Copilot' },
      { key: 'category', label: 'Category', required: true, description: 'Alerts, Medication, Diagnostics, Documentation, Triage', sampleValue: 'Alerts' },
      { key: 'model', label: 'Model', required: false, description: 'Gemini 1.5 Pro, Claude 3.5 Sonnet, GPT-4o', sampleValue: 'Gemini 1.5 Pro' },
      { key: 'trigger', label: 'Trigger Event', required: false, description: 'Triggering event', sampleValue: 'New Vital Reading' },
      { key: 'status', label: 'Status', required: false, description: 'Active, Testing, Inactive', sampleValue: 'Active' },
      { key: 'latency', label: 'Avg Latency', required: false, description: 'Average response time', sampleValue: '240ms' },
      { key: 'accuracy', label: 'Accuracy Rate', required: false, description: 'Validation accuracy rate', sampleValue: '98.4%' },
      { key: 'lastRun', label: 'Last Run', required: false, description: 'Last execution timestamp', sampleValue: '2026-08-30 09:20 AM' },
    ],
    sampleData: [
      {
        name: 'Clinical Alert Triage Copilot',
        category: 'Alerts',
        model: 'Gemini 1.5 Pro',
        trigger: 'New Vital Reading',
        status: 'Active',
        latency: '240ms',
        accuracy: '98.4%',
        lastRun: '2026-08-30 09:20 AM',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.name || 'AI Workflow',
      category: row.category || 'Clinical',
      model: row.model || 'Gemini 1.5 Pro',
      trigger: row.trigger || 'Manual',
      status: row.status || 'Active',
      latency: row.latency || '200ms',
      accuracy: row.accuracy || '99%',
      lastRun: row.lastRun || 'Now',
    }),
    mapEntityToRow: (w) => ({
      name: w.name || w.title || '',
      category: w.category || '',
      model: w.model || '',
      trigger: w.trigger || '',
      status: w.status || '',
      latency: w.latency || w.avgLatency || '',
      accuracy: w.accuracy || w.accuracyRate || '',
      lastRun: w.lastRun || w.lastExecuted || '',
    }),
  },

  // 20. REPORTS & ANALYTICS
  reports: {
    moduleKey: 'reports',
    displayName: 'Reports & Analytics',
    templateFilename: 'ConnectCare_Reports_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Reports',
    permissionModule: 'Reports & Analytics',
    columns: [
      { key: 'reportName', label: 'Report Name', required: true, description: 'Title of the report', sampleValue: 'Monthly Clinical Quality & Safety' },
      { key: 'category', label: 'Category', required: true, description: 'Clinical, Operational, Financial, Staffing, Custom', sampleValue: 'Clinical' },
      { key: 'period', label: 'Reporting Period', required: false, description: 'Month / Quarter / Year', sampleValue: 'August 2026' },
      { key: 'totalRecords', label: 'Total Records', required: false, description: 'Count of records', sampleValue: 342 },
      { key: 'primaryMetric', label: 'Key Metric', required: false, description: 'Primary KPI result', sampleValue: '99.2% Adherence' },
      { key: 'secondaryMetric', label: 'Secondary Metric', required: false, description: 'Secondary KPI result', sampleValue: '0 Fall Incidents' },
      { key: 'status', label: 'Status', required: false, description: 'Draft, Finalized, Published', sampleValue: 'Finalized' },
      { key: 'generatedDate', label: 'Generated Date', required: false, description: 'YYYY-MM-DD', sampleValue: '2026-08-30' },
    ],
    sampleData: [
      {
        reportName: 'Monthly Clinical Quality & Safety',
        category: 'Clinical',
        period: 'August 2026',
        totalRecords: 342,
        primaryMetric: '99.2% Adherence',
        secondaryMetric: '0 Fall Incidents',
        status: 'Finalized',
        generatedDate: '2026-08-30',
      },
    ],
    mapRowToEntity: (row) => ({
      name: row.reportName || 'Custom Report',
      category: row.category || 'General',
      period: row.period || 'Current',
      totalRecords: parseInt(String(row.totalRecords || '100'), 10),
      primaryMetric: row.primaryMetric || '',
      secondaryMetric: row.secondaryMetric || '',
      status: row.status || 'Finalized',
      generatedDate: row.generatedDate || new Date().toISOString().slice(0, 10),
    }),
    mapEntityToRow: (r) => ({
      reportName: r.name || r.reportName || r.title || '',
      category: r.category || r.type || '',
      period: r.period || r.timeframe || '',
      totalRecords: r.totalRecords || r.recordCount || 0,
      primaryMetric: r.primaryMetric || r.keyMetric || '',
      secondaryMetric: r.secondaryMetric || '',
      status: r.status || '',
      generatedDate: r.generatedDate || r.date || '',
    }),
  },

  // 21. SETTINGS / ROLES
  'settings-roles': {
    moduleKey: 'settings-roles',
    displayName: 'Roles & Permissions',
    templateFilename: 'ConnectCare_RolesPermissions_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_RolesPermissions',
    permissionModule: 'Settings',
    columns: [
      { key: 'roleName', label: 'Role Name', required: true, description: 'Role display title (e.g. Clinical Coordinator)', sampleValue: 'Clinical Coordinator' },
      { key: 'description', label: 'Description', required: false, description: 'Role scope and responsibilities', sampleValue: 'Manages clinical assignments, vitals, and care plans' },
      { key: 'userCount', label: 'Assigned Users Count', required: false, description: 'Count of users', sampleValue: '4' },
      { key: 'isSystemRole', label: 'Is System Role', required: false, description: 'Yes / No', sampleValue: 'No' },
      { key: 'permissionsSummary', label: 'Permissions Summary', required: false, description: 'Summary of granted modules', sampleValue: 'Residents (Full), Clinical (Full), Medication (Read/Edit), Tasks (Full)' },
    ],
    sampleData: [
      {
        roleName: 'Clinical Coordinator',
        description: 'Manages clinical assignments, vitals, and care plans',
        userCount: '4',
        isSystemRole: 'No',
        permissionsSummary: 'Residents (Full), Clinical (Full), Medication (Read/Edit), Tasks (Full)',
      },
    ],
    mapRowToEntity: (row) => ({
      roleName: row.roleName || 'Custom Role',
      description: row.description || '',
      isSystemRole: (row.isSystemRole || '').toLowerCase().startsWith('y'),
      permissionsSummary: row.permissionsSummary || '',
    }),
    mapEntityToRow: (r) => ({
      roleName: r.roleName || r.name || '',
      description: r.description || '',
      userCount: r.userCount || r.assignedUsersCount || 0,
      isSystemRole: r.isSystemRole ? 'Yes' : 'No',
      permissionsSummary: r.permissionsSummary || '',
    }),
  },

  // 22. SETTINGS / GENERAL & ORG
  'settings-general': {
    moduleKey: 'settings-general',
    displayName: 'Organization & System Settings',
    templateFilename: 'ConnectCare_Settings_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Settings',
    permissionModule: 'Settings',
    columns: [
      { key: 'settingKey', label: 'Setting Key', required: true, description: 'Unique configuration key', sampleValue: 'organization.name' },
      { key: 'category', label: 'Category', required: true, description: 'Organization, Security, Localization, Notifications, Backup', sampleValue: 'Organization' },
      { key: 'settingName', label: 'Setting Name', required: true, description: 'Human-readable name', sampleValue: 'Facility Organization Name' },
      { key: 'settingValue', label: 'Configuration Value', required: true, description: 'Setting value', sampleValue: 'ConnectCare Health Network' },
      { key: 'dataType', label: 'Data Type', required: false, description: 'String, Number, Boolean, JSON', sampleValue: 'String' },
      { key: 'description', label: 'Description', required: false, description: 'Purpose of setting', sampleValue: 'Primary facility header name' },
    ],
    sampleData: [
      {
        settingKey: 'organization.name',
        category: 'Organization',
        settingName: 'Facility Organization Name',
        settingValue: 'ConnectCare Health Network',
        dataType: 'String',
        description: 'Primary facility header name',
      },
      {
        settingKey: 'security.mfa_enforced',
        category: 'Security',
        settingName: 'Enforce MFA for Staff',
        settingValue: 'true',
        dataType: 'Boolean',
        description: 'Requires Two-Factor Authentication for all clinical logins',
      },
    ],
    mapRowToEntity: (row) => ({
      settingKey: row.settingKey || `setting.${Date.now()}`,
      category: row.category || 'General',
      settingName: row.settingName || row.settingKey || 'Config',
      settingValue: row.settingValue || '',
      dataType: row.dataType || 'String',
      description: row.description || '',
    }),
    mapEntityToRow: (s) => ({
      settingKey: s.settingKey || s.key || '',
      category: s.category || '',
      settingName: s.settingName || s.name || '',
      settingValue: s.settingValue || s.value || '',
      dataType: s.dataType || 'String',
      description: s.description || '',
    }),
  },

  // 23. DASHBOARD SUMMARY
  dashboard: {
    moduleKey: 'dashboard',
    displayName: 'Dashboard Overview Metrics',
    templateFilename: 'ConnectCare_Dashboard_Import_Template.csv',
    exportFilenamePrefix: 'ConnectCare_Dashboard_Summary',
    permissionModule: 'Dashboard',
    columns: [
      { key: 'metricName', label: 'Metric Name', required: true, description: 'KPI Metric Name', sampleValue: 'Total Active Patients' },
      { key: 'category', label: 'Category', required: false, description: 'Census, Clinical, Safety, Tasks, AI', sampleValue: 'Census' },
      { key: 'value', label: 'Value', required: true, description: 'Current metric value', sampleValue: '142' },
      { key: 'status', label: 'Status / Trend', required: false, description: 'Normal, High, Critical, Stable', sampleValue: 'Normal' },
      { key: 'updatedDate', label: 'Updated Date', required: false, description: 'Timestamp', sampleValue: '2026-08-30 09:00 AM' },
    ],
    sampleData: [
      {
        metricName: 'Total Active Patients',
        category: 'Census',
        value: '142',
        status: 'Normal',
        updatedDate: '2026-08-30 09:00 AM',
      },
      {
        metricName: 'Active Clinical Alerts',
        category: 'Safety',
        value: '3',
        status: 'High',
        updatedDate: '2026-08-30 09:00 AM',
      },
    ],
    mapRowToEntity: (row) => ({
      metricName: row.metricName || 'Metric',
      category: row.category || 'General',
      value: row.value || '0',
      status: row.status || 'Normal',
      updatedDate: row.updatedDate || 'Now',
    }),
    mapEntityToRow: (d) => ({
      metricName: d.metricName || d.title || d.label || '',
      category: d.category || '',
      value: d.value || 0,
      status: d.status || d.changeType || '',
      updatedDate: d.updatedDate || new Date().toISOString(),
    }),
  },
};
