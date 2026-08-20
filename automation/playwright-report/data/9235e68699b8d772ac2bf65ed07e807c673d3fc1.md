# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: data\bootstrap.spec.ts >> ConnectCare - bootstrap database with demo records
- Location: tests\data\bootstrap.spec.ts:3:5

# Error details

```
Error: POST /locations should succeed

expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1   | import { test, expect, request } from '@playwright/test';
  2   | 
  3   | test('ConnectCare - bootstrap database with demo records', async ({ }) => {
  4   |   const baseURL = process.env.BASE_URL || 'http://localhost:80';
  5   |   const api = await request.newContext({ baseURL, extraHTTPHeaders: { 'Content-Type': 'application/json' } });
  6   | 
  7   |   async function get(path: string) {
  8   |     const response = await api.get(`/api${path}`);
  9   |     expect(response.ok(), `${path} should be reachable`).toBeTruthy();
  10  |     const body = await response.json();
  11  |     return body.data ?? body;
  12  |   }
  13  | 
  14  |   async function post(path: string, payload: any) {
  15  |     const response = await api.post(`/api${path}`, { data: payload });
  16  | 
  17  |     if (!response.ok()) {
  18  |         const responseText = await response.text();
  19  | 
  20  |         console.log("\n========================================");
  21  |         console.log(`POST ${path} FAILED`);
  22  |         console.log(`HTTP Status : ${response.status()}`);
  23  |         console.log(`Status Text : ${response.statusText()}`);
  24  |         console.log(`Response    : ${responseText}`);
  25  |         console.log(`Payload     : ${JSON.stringify(payload, null, 2)}`);
  26  |         console.log("========================================\n");
  27  |     }
  28  | 
> 29  |     expect(response.ok(), `POST ${path} should succeed`).toBeTruthy();
      |                                                          ^ Error: POST /locations should succeed
  30  | 
  31  |     const body = await response.json();
  32  |     return body.data ?? body;
  33  | }
  34  | 
  35  |   const doctors = await get('/doctors');
  36  |   const doctorSeeds = [
  37  |     { doctorIdCode: 'DOC-AUTO-001', name: 'Dr. Michael Brown', specialty: 'Cardiology', department: 'Cardiology Unit', location: 'Cardiology Unit', phone: '(512) 555-1001', email: 'michael.brown@connectcare.test', status: 'Active', experience: '15 Years', teleconsultationEnabled: true },
  38  |     { doctorIdCode: 'DOC-AUTO-002', name: 'Dr. Sarah Wilson', specialty: 'Emergency Medicine', department: 'Emergency Department', location: 'Emergency Department', phone: '(512) 555-1002', email: 'sarah.wilson@connectcare.test', status: 'Active', experience: '10 Years', teleconsultationEnabled: true },
  39  |     { doctorIdCode: 'DOC-AUTO-003', name: 'Dr. James Lee', specialty: 'Orthopedics', department: 'Orthopedics Unit', location: 'Orthopedics Unit', phone: '(512) 555-1003', email: 'james.lee@connectcare.test', status: 'Active', experience: '12 Years', teleconsultationEnabled: true },
  40  |     { doctorIdCode: 'DOC-AUTO-004', name: 'Dr. Emily Clark', specialty: 'Endocrinology', department: 'Diabetes Care', location: 'Diabetes Care', phone: '(512) 555-1004', email: 'emily.clark@connectcare.test', status: 'Active', experience: '8 Years', teleconsultationEnabled: false },
  41  |   ];
  42  |   for (const seed of doctorSeeds) {
  43  |     if (!doctors.some((d: any) => d.doctorIdCode === seed.doctorIdCode)) await post('/doctors', seed);
  44  |   }
  45  | 
  46  |   const refreshedDoctors = await get('/doctors');
  47  |   const doctorByCode = new Map(refreshedDoctors.map((d: any) => [d.doctorIdCode, d]));
  48  | 
  49  |   const locations = await get('/locations');
  50  |   const locationSeeds = [
  51  |     { code: 'LOC-AUTO-001', name: 'Cardiology Unit', floor: '3rd Floor - 301', type: 'Specialty Center', facility: 'ConnectCare Hospital', facilityLocation: 'Austin, TX', unitsCount: 12, beds: 40, status: 'Active', capacity: '40 Beds', occupied: '30 Beds', occupancyRate: '75%', attentionPriority: 'High' },
  52  |     { code: 'LOC-AUTO-002', name: 'Med-Surg Unit 2', floor: '2nd Floor - 205', type: 'Wing', facility: 'ConnectCare Hospital', facilityLocation: 'Austin, TX', unitsCount: 18, beds: 45, status: 'Active', capacity: '45 Beds', occupied: '36 Beds', occupancyRate: '80%', attentionPriority: 'Medium' },
  53  |     { code: 'LOC-AUTO-003', name: 'Emergency Department', floor: 'Ground Floor - ER1', type: 'Emergency', facility: 'ConnectCare Hospital', facilityLocation: 'Austin, TX', unitsCount: 10, beds: 25, status: 'Active', capacity: '25 Beds', occupied: '21 Beds', occupancyRate: '84%', attentionPriority: 'Critical' },
  54  |     { code: 'LOC-AUTO-004', name: 'Orthopedics Unit', floor: '4th Floor - 402', type: 'Wing', facility: 'ConnectCare Hospital', facilityLocation: 'Austin, TX', unitsCount: 15, beds: 35, status: 'Active', capacity: '35 Beds', occupied: '28 Beds', occupancyRate: '80%', attentionPriority: 'Low' },
  55  |   ];
  56  |   for (const seed of locationSeeds) {
  57  |     if (!locations.some((l: any) => l.code === seed.code)) await post('/locations', seed);
  58  |   }
  59  | 
  60  |   const nurses = await get('/nurses');
  61  |   const nurseSeeds = [
  62  |     { nurseIdCode: 'NRS-AUTO-001', name: 'Nurse Sarah Wilson', department: 'Cardiology', subUnit: 'Cardiology Unit', location: 'Cardiology Unit', shift: 'Day Shift', assignedUnit: 'Cardiology Unit', phone: '(512) 555-2001', email: 'sarah.nurse@connectcare.test', status: 'Active', experience: '8 Years' },
  63  |     { nurseIdCode: 'NRS-AUTO-002', name: 'Nurse Priya Patel', department: 'Emergency Care', subUnit: 'Emergency Department', location: 'Emergency Department', shift: 'Night Shift', assignedUnit: 'Emergency Department', phone: '(512) 555-2002', email: 'priya.nurse@connectcare.test', status: 'Active', experience: '6 Years' },
  64  |     { nurseIdCode: 'NRS-AUTO-003', name: 'Nurse Emma Johnson', department: 'Medical-Surgical', subUnit: 'Med-Surg Unit 2', location: 'Med-Surg Unit 2', shift: 'Day Shift', assignedUnit: 'Med-Surg Unit 2', phone: '(512) 555-2003', email: 'emma.nurse@connectcare.test', status: 'Active', experience: '7 Years' },
  65  |     { nurseIdCode: 'NRS-AUTO-004', name: 'Nurse Linda Davis', department: 'Orthopedics', subUnit: 'Orthopedics Unit', location: 'Orthopedics Unit', shift: 'Evening Shift', assignedUnit: 'Orthopedics Unit', phone: '(512) 555-2004', email: 'linda.nurse@connectcare.test', status: 'Active', experience: '5 Years' },
  66  |   ];
  67  |   for (const seed of nurseSeeds) {
  68  |     if (!nurses.some((n: any) => n.nurseIdCode === seed.nurseIdCode)) await post('/nurses', seed);
  69  |   }
  70  | 
  71  |   const patients = await get('/patients');
  72  |   const patientSeeds = [
  73  |     { patientIdCode: 'P-AUTO-001', mrn: 'MRN-AUTO-001', name: 'Robert Johnson', dob: '1956-10-12', ageGender: '69 / Male', phone: '(512) 555-3001', email: 'robert.johnson@connectcare.test', address: '452 Elm Street, Austin, TX', careUnit: 'Cardiology Unit', floorRoom: '3rd Floor - 301', primaryDoctorId: doctorByCode.get('DOC-AUTO-001')?.id, primaryDoctorName: 'Dr. Michael Brown', primaryDoctorSpecialty: 'Cardiology', status: 'InCare', riskLevel: 'High', lastVisit: 'Current', admissionDate: '2026-08-01', careDays: 18, dischargePlan: 'Under Review', bloodPressure: '130/85 mmHg', heartRate: '78 bpm', bloodSugar: '115 mg/dL', temperature: '98.4 °F', spO2: '97 %' },
  74  |     { patientIdCode: 'P-AUTO-002', mrn: 'MRN-AUTO-002', name: 'Patricia Smith', dob: '1948-03-23', ageGender: '78 / Female', phone: '(512) 555-3002', email: 'patricia.smith@connectcare.test', address: '1234 Oakwood Lane, Austin, TX', careUnit: 'Med-Surg Unit 2', floorRoom: '2nd Floor - 205', primaryDoctorId: doctorByCode.get('DOC-AUTO-002')?.id, primaryDoctorName: 'Dr. Sarah Wilson', primaryDoctorSpecialty: 'Emergency Medicine', status: 'Admitted', riskLevel: 'High', lastVisit: 'Current', admissionDate: '2026-08-10', careDays: 9, dischargePlan: 'Not Scheduled', bloodPressure: '120/80 mmHg', heartRate: '72 bpm', bloodSugar: '110 mg/dL', temperature: '98.6 °F', spO2: '98 %' },
  75  |     { patientIdCode: 'P-AUTO-003', mrn: 'MRN-AUTO-003', name: 'Michael Davis', dob: '1963-07-08', ageGender: '63 / Male', phone: '(512) 555-3003', email: 'michael.davis@connectcare.test', address: '889 Pine Avenue, Austin, TX', careUnit: 'Orthopedics Unit', floorRoom: '4th Floor - 402', primaryDoctorId: doctorByCode.get('DOC-AUTO-003')?.id, primaryDoctorName: 'Dr. James Lee', primaryDoctorSpecialty: 'Orthopedics', status: 'Discharged', riskLevel: 'Medium', lastVisit: '2026-08-15', admissionDate: '2026-08-05', careDays: 10, dischargePlan: 'Completed', bloodPressure: '124/82 mmHg', heartRate: '75 bpm', bloodSugar: '105 mg/dL', temperature: '98.8 °F', spO2: '99 %' },
  76  |     { patientIdCode: 'P-AUTO-004', mrn: 'MRN-AUTO-004', name: 'Linda Martinez', dob: '1955-02-17', ageGender: '71 / Female', phone: '(512) 555-3004', email: 'linda.martinez@connectcare.test', address: '742 Evergreen Terrace, Austin, TX', careUnit: 'Diabetes Care', floorRoom: '1st Floor - 104', primaryDoctorId: doctorByCode.get('DOC-AUTO-004')?.id, primaryDoctorName: 'Dr. Emily Clark', primaryDoctorSpecialty: 'Endocrinology', status: 'InCare', riskLevel: 'Medium', lastVisit: 'Current', admissionDate: '2026-08-12', careDays: 7, dischargePlan: 'Expected this week', bloodPressure: '122/78 mmHg', heartRate: '70 bpm', bloodSugar: '140 mg/dL', temperature: '98.5 °F', spO2: '98 %' },
  77  |   ];
  78  |   for (const seed of patientSeeds) {
  79  |     if (!patients.some((p: any) => p.patientIdCode === seed.patientIdCode)) await post('/patients', seed);
  80  |   }
  81  | 
  82  |   const refreshedPatients = await get('/patients');
  83  |   const patientByCode = new Map(refreshedPatients.map((p: any) => [p.patientIdCode, p]));
  84  | 
  85  |   const alerts = await get('/alerts');
  86  |   const alertSeeds = [
  87  |     { alertIdCode: 'ALT-AUTO-001', title: 'High Heart Rate', description: 'Heart rate exceeded configured threshold.', patientId: patientByCode.get('P-AUTO-001')?.id, patientName: 'Robert Johnson', patientIdCode: 'P-AUTO-001', type: 'Vital Signs', severity: 'High', roomLocation: 'Cardiology Unit / Room 301', reportedBy: 'Nurse Sarah Wilson', reportedByRole: 'Nurse', triggerCondition: 'Heart rate above threshold', status: 'Open', isAcknowledged: false },
  88  |     { alertIdCode: 'ALT-AUTO-002', title: 'Fall Risk Identified', description: 'Fall risk assessment requires review.', patientId: patientByCode.get('P-AUTO-002')?.id, patientName: 'Patricia Smith', patientIdCode: 'P-AUTO-002', type: 'Patient Safety', severity: 'Critical', roomLocation: 'Med-Surg Unit 2 / Room 205', reportedBy: 'Nurse Emma Johnson', reportedByRole: 'Nurse', triggerCondition: 'Fall risk score high', status: 'In Progress', isAcknowledged: false },
  89  |     { alertIdCode: 'ALT-AUTO-003', title: 'Medication Review', description: 'Medication administration requires confirmation.', patientId: patientByCode.get('P-AUTO-004')?.id, patientName: 'Linda Martinez', patientIdCode: 'P-AUTO-004', type: 'Medication', severity: 'Medium', roomLocation: 'Diabetes Care / Room 104', reportedBy: 'Dr. Emily Clark', reportedByRole: 'Doctor', triggerCondition: 'Medication schedule review', status: 'Open', isAcknowledged: false },
  90  |   ];
  91  |   for (const seed of alertSeeds) {
  92  |     if (!alerts.some((a: any) => a.alertIdCode === seed.alertIdCode)) await post('/alerts', seed);
  93  |   }
  94  | 
  95  |   const tasks = await get('/tasks');
  96  |   const taskSeeds = [
  97  |     { taskIdCode: 'TSK-AUTO-001', title: 'Review Admission Form', description: 'Verify admission details.', patientId: patientByCode.get('P-AUTO-002')?.id, patientName: 'Patricia Smith', patientIdCode: 'P-AUTO-002', taskType: 'Documentation', priority: 'High', assignedCaregiver: 'Nurse Emma Johnson', assigneeRole: 'Nursing', dueTime: 'Today', isOverdue: false, status: 'Pending', statusStr: 'Open' },
  98  |     { taskIdCode: 'TSK-AUTO-002', title: 'Complete Vital Rounds', description: 'Record scheduled vital signs.', patientId: patientByCode.get('P-AUTO-001')?.id, patientName: 'Robert Johnson', patientIdCode: 'P-AUTO-001', taskType: 'Clinical Care', priority: 'Medium', assignedCaregiver: 'Nurse Sarah Wilson', assigneeRole: 'Nursing', dueTime: 'Today', isOverdue: false, status: 'InProgress', statusStr: 'In Progress' },
  99  |     { taskIdCode: 'TSK-AUTO-003', title: 'Finalize Discharge Summary', description: 'Complete discharge documentation.', patientId: patientByCode.get('P-AUTO-003')?.id, patientName: 'Michael Davis', patientIdCode: 'P-AUTO-003', taskType: 'Documentation', priority: 'Low', assignedCaregiver: 'Dr. James Lee', assigneeRole: 'Doctor', dueTime: 'This Week', isOverdue: false, status: 'Completed', statusStr: 'Completed' },
  100 |   ];
  101 |   for (const seed of taskSeeds) {
  102 |     if (!tasks.some((t: any) => t.taskIdCode === seed.taskIdCode)) await post('/tasks', seed);
  103 |   }
  104 | 
  105 |   const medications = await get('/medications');
  106 |   const medicationSeeds = [
  107 |     { medicationIdCode: 'MED-AUTO-001', name: 'Lisinopril 10 mg', form: 'Tablet', patientId: patientByCode.get('P-AUTO-001')?.id, patientName: 'Robert Johnson', patientIdCode: 'P-AUTO-001', dosage: '10 mg', route: 'Oral', frequency: 'Once daily', nextDoseTime: 'Today 08:00 AM', status: 'Active', prescribedBy: 'Dr. Michael Brown', category: 'Cardiovascular', adherencePercentage: '96%' },
  108 |     { medicationIdCode: 'MED-AUTO-002', name: 'Metformin 500 mg', form: 'Tablet', patientId: patientByCode.get('P-AUTO-004')?.id, patientName: 'Linda Martinez', patientIdCode: 'P-AUTO-004', dosage: '500 mg', route: 'Oral', frequency: 'Twice daily', nextDoseTime: 'Today 08:00 PM', status: 'Active', prescribedBy: 'Dr. Emily Clark', category: 'Diabetes', adherencePercentage: '91%' },
  109 |     { medicationIdCode: 'MED-AUTO-003', name: 'Atorvastatin 20 mg', form: 'Tablet', patientId: patientByCode.get('P-AUTO-002')?.id, patientName: 'Patricia Smith', patientIdCode: 'P-AUTO-002', dosage: '20 mg', route: 'Oral', frequency: 'Once daily', nextDoseTime: 'Today 09:00 PM', status: 'Active', prescribedBy: 'Dr. Sarah Wilson', category: 'Cardiovascular', adherencePercentage: '94%' },
  110 |   ];
  111 |   for (const seed of medicationSeeds) {
  112 |     if (!medications.some((m: any) => m.medicationIdCode === seed.medicationIdCode)) await post('/medications', seed);
  113 |   }
  114 | 
  115 |   await api.dispose();
  116 | });
  117 | 
```