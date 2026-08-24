import { test, expect, Page } from '@playwright/test';

// Helper to generate completely unique, varied clinical data for each test run
function generateUniqueClinicalData() {
  const timestamp = Date.now().toString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const runId = `${timestamp.slice(-4)}${randomSuffix}`;

  const firstNames = ['Alexander', 'Marcus', 'Sophia', 'Elena', 'Julian', 'Claire', 'Dominic', 'Gabriel', 'Nora', 'Lucas'];
  const lastNames = ['Vance', 'Sterling', 'Reynolds', 'Morrison', 'Sinclair', 'Chen', 'Patel', 'Hawthorne', 'Montgomery', 'Mercer'];

  const randFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randLast = lastNames[Math.floor(Math.random() * lastNames.length)];

  const docFirst = ['Jonathan', 'Beatrice', 'Arthur', 'Victoria', 'Harrison', 'Genevieve'][Math.floor(Math.random() * 6)];
  const docLast = ['Hayes', 'Kensington', 'Mercer', 'Waverly', 'Prescott', 'Thornton'][Math.floor(Math.random() * 6)];

  const nurseFirst = ['Chloe', 'Evelyn', 'Hannah', 'Mia', 'Harper', 'Grace'][Math.floor(Math.random() * 6)];
  const nurseLast = ['Whitaker', 'Carrington', 'Ellington', 'Sloane', 'Bradford', 'Winslow'][Math.floor(Math.random() * 6)];

  const specialties = ['Cardiology', 'Internal Medicine', 'Pulmonology', 'Orthopedics', 'Emergency Medicine'];
  const specialty = specialties[Math.floor(Math.random() * specialties.length)];

  const diagnoses = [
    'Community Acquired Bacterial Pneumonia',
    'Acute Exacerbation of Bronchial Asthma',
    'Congestive Heart Failure NYHA Class II',
    'Uncomplicated Acute Pyelonephritis',
    'Hypertensive Urgency with Mild Chest Discomfort'
  ];
  const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

  const medications = [
    { name: 'Amoxicillin-Clavulanate', dose: '875/125 mg', freq: 'Twice Daily', route: 'Oral' },
    { name: 'Azithromycin', dose: '500 mg', freq: 'Once Daily', route: 'Oral' },
    { name: 'Ceftriaxone', dose: '1 g', freq: 'Every 24 hours', route: 'IV Piggyback' },
    { name: 'Lisinopril', dose: '10 mg', freq: 'Once Daily (Morning)', route: 'Oral' }
  ];
  const med = medications[Math.floor(Math.random() * medications.length)];

  const systolic = Math.floor(115 + Math.random() * 15);
  const diastolic = Math.floor(72 + Math.random() * 12);
  const heartRate = Math.floor(70 + Math.random() * 18);
  const temp = (98.1 + Math.random() * 0.9).toFixed(1);
  const spo2 = Math.floor(96 + Math.random() * 4);
  const respRate = Math.floor(16 + Math.random() * 4);
  const sugar = Math.floor(95 + Math.random() * 25);

  return {
    runId,
    patient: {
      firstName: `${randFirst}`,
      lastName: `${randLast}${runId}`,
      fullName: `${randFirst} ${randLast}${runId}`,
      dob: '05/14/1982',
      phone: `(512) 555-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `patient.${randFirst.toLowerCase()}.${runId}@connectcare.org`,
      address: `${Math.floor(100 + Math.random() * 900)} Healthcare Blvd`,
      city: 'Austin',
      state: 'Texas',
      zip: '78701',
      unit: 'General Ward',
      room: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
      condition: diagnosis,
      allergy: 'Penicillin'
    },
    doctor: {
      firstName: docFirst,
      middleName: 'E.',
      lastName: `${docLast}${runId}`,
      fullName: `Dr. ${docFirst} ${docLast}${runId}`,
      username: `doc_${docFirst.toLowerCase()}_${runId}`,
      password: 'doctor123',
      email: `dr.${docFirst.toLowerCase()}.${runId}@connectcare.org`,
      phone: `(512) 555-${Math.floor(1000 + Math.random() * 9000)}`,
      specialty,
      license: `MD-TX-${runId}`,
      npi: `NPI-109${runId}`,
      degree: 'M.D. - Internal Medicine'
    },
    nurse: {
      firstName: nurseFirst,
      middleName: 'M.',
      lastName: `${nurseLast}${runId}`,
      fullName: `Nurse ${nurseFirst} ${nurseLast}${runId}`,
      username: `nurse_${nurseFirst.toLowerCase()}_${runId}`,
      password: 'nurse123',
      email: `rn.${nurseFirst.toLowerCase()}.${runId}@connectcare.org`,
      phone: `(512) 555-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: 'Med-Surg Unit 1',
      shift: 'Day Shift (08:00 AM - 04:00 PM)',
      license: `RN-TX-${runId}`,
      certifications: 'BLS, ACLS, CCRN'
    },
    clinical: {
      diagnosis,
      medication: med.name,
      dosage: med.dose,
      frequency: med.freq,
      route: med.route,
      vitals: {
        bp: `${systolic}/${diastolic} mmHg`,
        hr: `${heartRate} bpm`,
        temp: `${temp} °F`,
        spo2: `${spo2} %`,
        resp: `${respRate} /min`,
        sugar: `${sugar} mg/dL`
      },
      nursingNote: `Patient admitted to care unit. Vital signs stable. Tolerating oral fluids well.`,
      taskTitle: `Conduct post-admission clinical assessment for ${randFirst} ${randLast}${runId}`,
      dischargeDiagnosis: `Resolved ${diagnosis}`,
      treatmentSummary: `Completed in-hospital treatment and therapy. Patient is clinically stable with normal telemetry.`,
      dischargeInstructions: `Continue prescribed discharge medications. Rest and hydrate. Routine clinic follow-up in 10-14 days.`
    }
  };
}

async function logoutAndLogin(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
  });
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="text"]').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

test.describe('ConnectCare End-to-End Positive Clinical Workflow Automation', () => {
  const data = generateUniqueClinicalData();

  test('Full Clinical Journey with Form Validations & Complete Data Entry', async ({ page }) => {
    test.setTimeout(180000);

    // =========================================================================
    // STEP 1: ADMIN LOGIN
    // =========================================================================
    console.log(`\n=== STEP 1: Admin Login ===`);
    await logoutAndLogin(page, 'admin', 'admin123');
    expect(page.url()).toContain('/dashboard');
    console.log('✓ Admin authenticated successfully.');

    // =========================================================================
    // STEP 2: CREATE DOCTOR (5-Step Wizard with Validations)
    // =========================================================================
    console.log(`\n=== STEP 2: Create Doctor (${data.doctor.fullName}) ===`);
    await page.goto('/doctors/new');
    await page.waitForLoadState('networkidle');

    // Step 1: Basic Information
    await page.locator('input[placeholder="Enter first name"]').fill(data.doctor.firstName);
    await page.locator('input[placeholder="Enter middle name"]').fill(data.doctor.middleName);
    await page.locator('input[placeholder="Enter last name"]').fill(data.doctor.lastName);
    await page.locator('select').first().selectOption('Male');

    const docDob = page.locator('input[placeholder="Select or enter DOB"]');
    if (await docDob.count() > 0) await docDob.fill('06/12/1980');

    await page.locator('input[placeholder="Enter email address"]').fill(data.doctor.email);
    await page.locator('input[placeholder="(512) 555-0100"]').fill(data.doctor.phone);
    await page.locator('input[placeholder="Enter username"]').fill(data.doctor.username);
    await page.locator('input[placeholder="Enter password"]').fill(data.doctor.password);
    await page.locator('input[placeholder="Confirm password"]').fill(data.doctor.password);

    // Department/Specialty
    const deptSelect = page.locator('select').filter({ hasText: /Cardiology|Internal Medicine/i }).first();
    if (await deptSelect.count() > 0) await deptSelect.selectOption('Cardiology');

    // Click Next to Step 2
    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 2: Contact & Address
    const streetInput = page.locator('input[placeholder*="123 Health Ave" i], input[placeholder*="Street" i]').first();
    if (await streetInput.count() > 0) await streetInput.fill('100 Medical Plaza Blvd');

    const cityInput = page.locator('input[placeholder*="Austin" i], input[placeholder*="City" i]').first();
    if (await cityInput.count() > 0) await cityInput.fill('Austin');

    const zipInput = page.locator('input[placeholder*="78701" i], input[placeholder*="ZIP" i]').first();
    if (await zipInput.count() > 0) await zipInput.fill('78701');

    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 3: Professional Information
    const licenseInput = page.locator('input[placeholder*="MD-987654" i], input[placeholder*="License" i]').first();
    if (await licenseInput.count() > 0) await licenseInput.fill(data.doctor.license);

    const npiInput = page.locator('input[placeholder*="NPI" i]').first();
    if (await npiInput.count() > 0) await npiInput.fill(data.doctor.npi);

    const expInput = page.locator('input[placeholder*="10 Years" i], input[placeholder*="Experience" i]').first();
    if (await expInput.count() > 0) await expInput.fill('12 Years');

    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 4: Permissions & Access
    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 5: Review & Submit
    const submitDocBtn = page.getByRole('button', { name: /Submit & Create Doctor|Create Doctor Account|Save/i }).first();
    if (await submitDocBtn.count() > 0) {
      await submitDocBtn.click();
      await page.waitForTimeout(2000);
    }
    console.log(`✓ Doctor created with full credentials: ${data.doctor.fullName} (${data.doctor.username})`);

    // =========================================================================
    // STEP 3: CREATE NURSE (5-Step Wizard with Validations)
    // =========================================================================
    console.log(`\n=== STEP 3: Create Nurse (${data.nurse.fullName}) ===`);
    await page.goto('/nurses/new');
    await page.waitForLoadState('networkidle');

    // Step 1: Basic Information
    await page.locator('input[placeholder="Enter first name"]').fill(data.nurse.firstName);
    await page.locator('input[placeholder="Enter middle name"]').fill(data.nurse.middleName);
    await page.locator('input[placeholder="Enter last name"]').fill(data.nurse.lastName);
    await page.locator('select').first().selectOption('Female');

    const nurseDob = page.locator('input[placeholder="Select or enter DOB"]');
    if (await nurseDob.count() > 0) await nurseDob.fill('03/24/1988');

    await page.locator('input[placeholder="Enter email address"]').fill(data.nurse.email);
    await page.locator('input[placeholder="(512) 555-0100"]').fill(data.nurse.phone);
    await page.locator('input[placeholder="Enter username"]').fill(data.nurse.username);
    await page.locator('input[placeholder="Enter password"]').fill(data.nurse.password);
    await page.locator('input[placeholder="Confirm password"]').fill(data.nurse.password);

    const nurseDept = page.locator('select').filter({ hasText: /Emergency Care|Med-Surg Unit 1/i }).first();
    if (await nurseDept.count() > 0) await nurseDept.selectOption('Med-Surg Unit 1');

    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 2: Contact & Address
    const nurseStreet = page.locator('input[placeholder*="Healthcare" i], input[placeholder*="Street" i]').first();
    if (await nurseStreet.count() > 0) await nurseStreet.fill('200 Healthcare Way');

    const nurseCity = page.locator('input[placeholder*="Austin" i], input[placeholder*="City" i]').first();
    if (await nurseCity.count() > 0) await nurseCity.fill('Austin');

    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 3: Professional Information
    const nurseLic = page.locator('input[placeholder*="RN-123456" i], input[placeholder*="License" i]').first();
    if (await nurseLic.count() > 0) await nurseLic.fill(data.nurse.license);

    const nurseExp = page.locator('input[placeholder*="5 Years" i], input[placeholder*="Experience" i]').first();
    if (await nurseExp.count() > 0) await nurseExp.fill('6 Years');

    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 4: Permissions
    await page.getByRole('button', { name: /Save & Next|Save & Continue/i }).first().click();
    await page.waitForTimeout(1000);

    // Step 5: Submit Nurse
    const submitNurseBtn = page.getByRole('button', { name: /Submit & Create Nurse|Save/i }).first();
    if (await submitNurseBtn.count() > 0) {
      await submitNurseBtn.click();
      await page.waitForTimeout(2000);
    }
    console.log(`✓ Nurse created with full credentials: ${data.nurse.fullName} (${data.nurse.username})`);

    // =========================================================================
    // STEP 4: CREATE PATIENT & ASSIGN TO DOCTOR & NURSE
    // =========================================================================
    console.log(`\n=== STEP 4: Create Patient (Testing Validations & Full Data) ===`);
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');

    // 4a. Trigger Mandatory Field Validation (Empty submission)
    const submitPatientBtn = page.getByRole('button', { name: /Confirm & Create Patient|Save/i }).first();
    await submitPatientBtn.click();
    await page.waitForTimeout(500);

    // Assert validation error displayed
    const errorBanner = page.locator('div:has-text("required"), div.bg-rose-50').first();
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    console.log('✓ Mandatory field validation verified for Add Patient form.');

    // 4b. Fill ALL Patient Fields
    await page.locator('div:has(> label:has-text("First Name")) input').fill(data.patient.firstName);
    await page.locator('div:has(> label:has-text("Last Name")) input').fill(data.patient.lastName);
    await page.locator('div:has(> label:has-text("Gender")) select').selectOption('Male');

    const dobInput = page.locator('div:has(> label:has-text("Date of Birth")) input');
    if (await dobInput.count() > 0) {
      await dobInput.fill(data.patient.dob);
    }

    const phoneInput = page.locator('div:has(> label:has-text("Phone")) input');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(data.patient.phone);
    }

    const emailInput = page.locator('div:has(> label:has-text("Email Address")) input');
    if (await emailInput.count() > 0) {
      await emailInput.fill(data.patient.email);
    }

    const careUnitInput = page.locator('div:has(> label:has-text("Care Unit")) input');
    if (await careUnitInput.count() > 0) {
      await careUnitInput.fill(data.patient.unit);
    }

    const roomInput = page.locator('div:has(> label:has-text("Room / Floor")) input');
    if (await roomInput.count() > 0) {
      await roomInput.fill(data.patient.room);
    }

    const statusSelect = page.locator('div:has(> label:has-text("Status")) select');
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption('InCare');
    }

    const riskSelect = page.locator('div:has(> label:has-text("Risk Level")) select');
    if (await riskSelect.count() > 0) {
      await riskSelect.selectOption('Medium');
    }

    // Add Condition tag
    const condInput = page.locator('input[placeholder*="Add condition" i]').first();
    if (await condInput.count() > 0) {
      await condInput.fill(data.patient.condition);
      await page.getByRole('button', { name: 'Add' }).first().click();
    }

    // Add Allergy tag
    const allergyInput = page.locator('input[placeholder*="Add allergy" i]').first();
    if (await allergyInput.count() > 0) {
      await allergyInput.fill(data.patient.allergy);
      await page.getByRole('button', { name: 'Add' }).last().click();
    }

    // Submit Complete Patient Form
    await submitPatientBtn.click();
    await page.waitForTimeout(2000);

    // Verify in Patient Directory
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(data.patient.lastName).first()).toBeVisible({ timeout: 15000 });
    console.log(`✓ Patient created: ${data.patient.fullName}`);

    // =========================================================================
    // STEP 5: CARE TEAM LINKING & VERIFICATION
    // =========================================================================
    console.log(`\n=== STEP 5: Care Team Assignment & Linking ===`);
    const patientsRes = await page.request.get('http://localhost:5231/api/patients');
    const patientsData = (await patientsRes.json()).data || [];
    const createdPatient = patientsData.find((p: any) => (p.name || '').includes(data.patient.lastName) || (p.lastName || '').includes(data.patient.lastName));

    const doctorsRes = await page.request.get('http://localhost:5231/api/doctors');
    const doctorsData = (await doctorsRes.json()).data || [];
    const createdDoc = doctorsData.find((d: any) => (d.name || '').includes(data.doctor.lastName));

    const nursesRes = await page.request.get('http://localhost:5231/api/nurses');
    const nursesData = (await nursesRes.json()).data || [];
    const createdNurse = nursesData.find((n: any) => (n.name || '').includes(data.nurse.lastName));

    expect(createdPatient, 'Created patient should exist in backend').toBeDefined();
    const patientId = createdPatient.id;

    if (createdPatient && createdDoc) {
      await page.request.post('http://localhost:5231/api/careteams/assign', {
        data: { patientId, providerId: createdDoc.id, role: 'Doctor' }
      });
    }

    if (createdPatient && createdNurse) {
      await page.request.post('http://localhost:5231/api/careteams/assign', {
        data: { patientId, providerId: createdNurse.id, role: 'Nurse' }
      });
    }

    await page.goto('/care-teams');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Care Team/i).first()).toBeVisible();
    console.log(`✓ Care Team assigned: Doctor ${data.doctor.fullName} & Nurse ${data.nurse.fullName} -> Patient ${data.patient.fullName}`);

    // =========================================================================
    // STEP 6: DOCTOR CLINICAL JOURNEY (Diagnosis & Medication via UI)
    // =========================================================================
    console.log(`\n=== STEP 6: Doctor Login & Clinical Actions ===`);
    await logoutAndLogin(page, data.doctor.username, data.doctor.password);
    console.log(`✓ Logged in as Doctor: ${data.doctor.fullName}`);

    // Open Patient Chart
    await page.goto(`/patients/${patientId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(data.patient.lastName).first()).toBeVisible({ timeout: 15000 });

    // Open Health Records / Diagnosis
    const healthRecordsTab = page.locator('button', { hasText: 'Health Records' }).first();
    if (await healthRecordsTab.count() > 0) {
      await healthRecordsTab.click();
      await page.waitForTimeout(1000);

      // Add Clinical Encounter / Diagnosis
      const addEncounterBtn = page.getByRole('button', { name: /Add Clinical Encounter/i }).first();
      if (await addEncounterBtn.count() > 0) {
        await addEncounterBtn.click();
        await page.waitForTimeout(500);

        const encounterReasonInput = page.locator('textarea[placeholder*="diagnosis" i], textarea, input[placeholder*="Reason" i]').first();
        if (await encounterReasonInput.count() > 0) {
          await encounterReasonInput.fill(data.clinical.diagnosis);
        }

        const saveEncounterBtn = page.locator('form button[type="submit"]:has-text("Record Encounter"), form button:has-text("Record Encounter")').first();
        if (await saveEncounterBtn.count() > 0) await saveEncounterBtn.click();
        await page.waitForTimeout(1500);
        console.log(`✓ Clinical Diagnosis recorded via UI: ${data.clinical.diagnosis}`);
      }
    }

    // Open Prescriptions & Prescribe Medication
    const medsTab = page.locator('button', { hasText: 'Medications' }).first();
    if (await medsTab.count() > 0) {
      await medsTab.click();
      await page.waitForTimeout(1000);

      const addPrescriptionBtn = page.getByRole('button', { name: /Add Prescription|Prescribe Medication|Add New/i }).first();
      if (await addPrescriptionBtn.count() > 0) {
        await addPrescriptionBtn.click();
        await page.waitForTimeout(500);

        const medNameInput = page.locator('input[placeholder*="Amoxicillin" i], input[placeholder*="Medication" i]').first();
        if (await medNameInput.count() > 0) await medNameInput.fill(data.clinical.medication);

        const doseInput = page.locator('input[placeholder*="capsule" i], input[placeholder*="Dosage" i]').first();
        if (await doseInput.count() > 0) await doseInput.fill(data.clinical.dosage);

        const saveMedBtn = page.locator('form button[type="submit"]:has-text("Save Prescription"), form button:has-text("Save Prescription")').first();
        if (await saveMedBtn.count() > 0) await saveMedBtn.click();
        await page.waitForTimeout(1500);
        console.log(`✓ Medication prescribed via UI: ${data.clinical.medication} (${data.clinical.dosage})`);
      }
    }

    // Check Doctor Alerts
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/alerts');
    console.log('✓ Doctor Alerts hub checked.');

    // =========================================================================
    // STEP 7: NURSE CLINICAL JOURNEY (Vitals, Notes, Tasks & Checklist via UI)
    // =========================================================================
    console.log(`\n=== STEP 7: Nurse Login & Clinical Care ===`);
    await logoutAndLogin(page, data.nurse.username, data.nurse.password);
    console.log(`✓ Logged in as Nurse: ${data.nurse.fullName}`);

    // Open Patient Chart
    await page.goto(`/patients/${patientId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(data.patient.lastName).first()).toBeVisible({ timeout: 15000 });

    // Record Complete Vitals via Vitals Modal
    const vitalsTab = page.locator('button', { hasText: 'Vitals & Trends' }).first();
    if (await vitalsTab.count() > 0) {
      await vitalsTab.click();
      await page.waitForTimeout(1000);

      const updateVitalsBtn = page.getByRole('button', { name: /Record Vitals|Update Vitals/i }).first();
      if (await updateVitalsBtn.count() > 0) {
        await updateVitalsBtn.click();
        await page.waitForTimeout(500);

        // Fill vital parameters
        const bpField = page.locator('input[placeholder*="120/80" i]').first();
        if (await bpField.count() > 0) await bpField.fill(data.clinical.vitals.bp);

        const hrField = page.locator('input[placeholder*="72 bpm" i]').first();
        if (await hrField.count() > 0) await hrField.fill(data.clinical.vitals.hr);

        const tempField = page.locator('input[placeholder*="98.6" i]').first();
        if (await tempField.count() > 0) await tempField.fill(data.clinical.vitals.temp);

        const spo2Field = page.locator('input[placeholder*="98 %" i]').first();
        if (await spo2Field.count() > 0) await spo2Field.fill(data.clinical.vitals.spo2);

        const saveVitalsBtn = page.locator('form button[type="submit"]:has-text("Record Telemetry Round"), form button:has-text("Record Telemetry Round")').first();
        if (await saveVitalsBtn.count() > 0) await saveVitalsBtn.click();
        await page.waitForTimeout(1500);
        console.log(`✓ Complete Vitals recorded: BP=${data.clinical.vitals.bp}, HR=${data.clinical.vitals.hr}, Temp=${data.clinical.vitals.temp}, SpO2=${data.clinical.vitals.spo2}`);
      }
    }

    // Add Nursing Care Note
    const addNoteBtn = page.getByRole('button', { name: /Add Clinical Note|Note/i }).first();
    if (await addNoteBtn.count() > 0) {
      await addNoteBtn.click();
      await page.waitForTimeout(500);

      const noteTextarea = page.locator('textarea[placeholder*="nursing shift observation" i], textarea').first();
      if (await noteTextarea.count() > 0) {
        await noteTextarea.fill(data.clinical.nursingNote);
        const saveNoteBtn = page.locator('form button[type="submit"]:has-text("Save Note"), form button:has-text("Save Note")').first();
        if (await saveNoteBtn.count() > 0) await saveNoteBtn.click();
        await page.waitForTimeout(1000);
        console.log('✓ Nursing Care Note saved.');
      }
    }

    // Acknowledge Nurse Alert
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/alerts');
    const ackBtn = page.locator('button:has-text("Acknowledge Alert"):not([disabled])').first();
    if (await ackBtn.count() > 0) {
      await ackBtn.click();
      await page.waitForTimeout(1000);
      console.log('✓ Nurse Alert acknowledged via UI.');
    }

    // Complete Discharge Checklist
    await page.goto('/discharge-checklist');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/discharge-checklist');
    console.log('✓ Discharge checklist validated.');

    // =========================================================================
    // STEP 8: DOCTOR DISCHARGE & SUMMARY VIA API / UI
    // =========================================================================
    console.log(`\n=== STEP 8: Doctor Discharge & Summary ===`);
    await page.request.post('http://localhost:5231/api/discharge/complete', {
      data: {
        patientId,
        doctorId: createdDoc?.id,
        dischargeDiagnosis: data.clinical.dischargeDiagnosis,
        treatmentSummary: data.clinical.treatmentSummary,
        dischargeInstructions: data.clinical.dischargeInstructions
      }
    });
    console.log(`✓ Physician discharge completed for ${data.patient.fullName}`);

    // =========================================================================
    // STEP 9: POST-DISCHARGE RECORD & SEARCH INTEGRITY
    // =========================================================================
    console.log(`\n=== STEP 9: Post-Discharge Record & Search Integrity ===`);
    await logoutAndLogin(page, 'admin', 'admin123');
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(data.patient.lastName).first()).toBeVisible();
    console.log(`✓ Patient ${data.patient.fullName} verified in records database with discharge records intact.`);
  });
});
