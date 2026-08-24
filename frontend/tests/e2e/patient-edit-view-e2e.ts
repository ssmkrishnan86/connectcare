import { TestHarness } from './test-runner';

export async function runPatientEditViewSuite(runner: TestHarness): Promise<void> {
  runner.currentSuite = 'Patient View & Edit Comprehensive Suite';
  console.log(`\n======================================================`);
  console.log(`🧪 RUNNING SUITE: ${runner.currentSuite}`);
  console.log(`======================================================`);

  let adminClient = runner.createClient();
  let createdPatientId = '';
  let createdPatientCode = '';

  // Step 1: Admin Authentication
  await runner.runTest('Admin Authentication for Patient Management', async () => {
    const res = await adminClient.post('/auth/login', {
      username: 'admin',
      password: 'admin123',
    });
    const token = res.data?.data?.token || res.data?.token;
    runner.assertDefined(token, 'Admin Auth Token');
    adminClient = runner.createClient(token);
  });


  // Step 2: Create Test Patient for View/Edit testing
  await runner.runTest('Create Baseline Patient with Demographics & Care Team', async () => {
    const rand = Math.floor(10000 + Math.random() * 90000);
    const payload = {
      firstName: 'Jonathan',
      lastName: `Swift_${rand}`,
      name: `Jonathan Swift_${rand}`,
      dob: '1985-06-15',
      gender: 'Male',
      ageGender: '41 / Male',
      phone: '(512) 555-0199',
      email: `jonathan_${rand}@connectcare.com`,
      address: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
      emergencyContactName: 'Mary Swift',
      emergencyContactRelationship: 'Spouse',
      emergencyContactPhone: '(512) 555-0188',
      emergencyContactIsPrimary: true,
      careUnit: 'Cardiology Unit',
      floorRoom: '3rd Floor - 308',
      status: 'InCare',
      riskLevel: 'Medium',
      primaryDoctorName: 'Dr. Sarah Wilson',
      assignedNurseName: 'Nurse Emily Clark',
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      bloodSugar: '100 mg/dL',
      temperature: '98.6 °F',
      spO2: '98 %',
      medicalConditions: 'Hypertension, Mild Asthma',
      allergies: 'Penicillin, Latex',
      currentMedications: 'Lisinopril 10mg Once Daily',
      pastMedicalHistory: 'Appendectomy in 2015',
      insuranceProvider: 'Blue Cross Blue Shield',
      insurancePolicyNumber: `BCBS-${rand}`,
      insuranceGroupNumber: 'GRP-9988',
      insuranceValidUntil: '2028-12-31'
    };

    const res = await adminClient.post('/patients', payload);
    runner.assert(res.status === 200 || res.status === 201, 'Patient created');
    const data = res.data?.data || res.data;
    createdPatientId = data.id;
    createdPatientCode = data.patientIdCode;
    runner.assertDefined(createdPatientId, 'Created Patient ID');
  });

  // Step 3: View Patient - Profile & Demographics Retrieval
  await runner.runTest('View Patient - Retrieve Full Profile & Demographics', async () => {
    const res = await adminClient.get(`/patients/${createdPatientId}`);
    runner.assertEquals(res.status, 200, 'Status must be 200');
    const p = res.data?.data || res.data;
    runner.assert(p.firstName === 'Jonathan', 'First name must match');
    runner.assert(p.careUnit === 'Cardiology Unit', 'Care unit must match');
    runner.assert(p.phone === '(512) 555-0199', 'Phone number must match');
  });

  // Step 4: Health Records - Add Clinical Encounter & Retrieve List
  await runner.runTest('Health Records - Add Clinical Encounter & Fetch Encounter Logs', async () => {
    const encounterPayload = {
      encounterType: 'Cardiology Follow-up',
      reasonDiagnosis: 'Routine post-medication assessment. Blood pressure well controlled.',
      providerName: 'Dr. Sarah Wilson',
      dateText: '08/24/2026'
    };

    const createRes = await adminClient.post(`/patients/${createdPatientId}/clinical-encounters`, encounterPayload);
    runner.assert(createRes.status === 200 || createRes.status === 201, 'Clinical encounter added');

    const getRes = await adminClient.get(`/patients/${createdPatientId}/clinical-encounters`);
    runner.assertEquals(getRes.status, 200, 'Status must be 200');
    const encounters = getRes.data?.data || (Array.isArray(getRes.data) ? getRes.data : []);
    runner.assert(encounters.length > 0, 'Encounters list must contain the new encounter');
    runner.assert(encounters.some((e: any) => e.encounterType === 'Cardiology Follow-up'), 'Encounter type recorded correctly');
  });

  // Step 5: Medications - Update & Add Prescriptions
  await runner.runTest('Medications - Add Prescription & Update Active Medications', async () => {
    const updatedMeds = 'Lisinopril 10mg Once Daily, Metformin 500mg Twice Daily, Atorvastatin 20mg Bedtime';
    const updateRes = await adminClient.put(`/patients/${createdPatientId}`, {
      currentMedications: updatedMeds
    });
    runner.assertEquals(updateRes.status, 200, 'Medication update succeeded');

    const getRes = await adminClient.get(`/patients/${createdPatientId}`);
    const p = getRes.data?.data || getRes.data;
    runner.assert(p.currentMedications.includes('Metformin 500mg'), 'Prescriptions updated');
    runner.assert(p.currentMedications.includes('Atorvastatin 20mg'), 'Prescriptions updated');
  });

  // Step 6: Care Plan - Update Clinical Goals & Interventions
  await runner.runTest('Care Plan - Update Care Goals & Assigned Team', async () => {
    const res = await adminClient.put(`/patients/${createdPatientId}`, {
      careUnit: 'Intensive Cardiac Care',
      floorRoom: '4th Floor - ICU 402',
      primaryDoctorName: 'Dr. Sarah Wilson',
      assignedNurseName: 'Nurse Emily Clark',
      additionalNotes: 'Strict low-sodium cardiac diet. Daily telemetry monitoring required.'
    });
    runner.assertEquals(res.status, 200, 'Care Plan update succeeded');

    const getRes = await adminClient.get(`/patients/${createdPatientId}`);
    const p = getRes.data?.data || getRes.data;
    runner.assert(p.careUnit === 'Intensive Cardiac Care', 'Care unit updated');
    runner.assert(p.additionalNotes.includes('Strict low-sodium'), 'Care plan notes updated');
  });

  // Step 7: Vitals & Trends - Real-time Telemetry Updates
  await runner.runTest('Vitals & Trends - Update Telemetry Parameters (BP, HR, Temp, SpO2, Blood Sugar)', async () => {
    const vitalsPayload = {
      bloodPressure: '125/82 mmHg',
      heartRate: '74 bpm',
      bloodSugar: '105 mg/dL',
      temperature: '98.7 °F',
      spo2: '99 %'
    };

    const vitalsRes = await adminClient.post(`/patients/${createdPatientId}/vitals`, vitalsPayload);
    runner.assertEquals(vitalsRes.status, 200, 'Vitals update API succeeded');

    const getRes = await adminClient.get(`/patients/${createdPatientId}`);
    const p = getRes.data?.data || getRes.data;
    runner.assertEquals(p.bloodPressure, '125/82 mmHg', 'Blood pressure must be 125/82 mmHg');
    runner.assertEquals(p.heartRate, '74 bpm', 'Heart rate must be 74 bpm');
    runner.assertEquals(p.bloodSugar, '105 mg/dL', 'Blood sugar must be 105 mg/dL');
    runner.assertEquals(p.temperature, '98.7 °F', 'Temperature must be 98.7 °F');
    runner.assertEquals(p.spO2, '99 %', 'SpO2 must be 99 %');
  });

  // Step 8: Appointments - Schedule Consultation & Retrieve List
  await runner.runTest('Appointments - Schedule Consultation & Retrieve Appointments List', async () => {
    const apptPayload = {
      consultationType: 'Cardiology Review & Echo Scan',
      physicianName: 'Dr. Sarah Wilson',
      dateTimeText: 'Aug 29, 2026 10:30 AM',
      status: 'Scheduled'
    };

    const apptRes = await adminClient.post(`/patients/${createdPatientId}/appointments`, apptPayload);
    runner.assert(apptRes.status === 200 || apptRes.status === 201, 'Appointment scheduled');

    const getRes = await adminClient.get(`/patients/${createdPatientId}/appointments`);
    runner.assertEquals(getRes.status, 200, 'Status must be 200');
    const appts = getRes.data?.data || (Array.isArray(getRes.data) ? getRes.data : []);
    runner.assert(appts.length > 0, 'Appointments list must contain the scheduled appointment');
    runner.assert(appts.some((a: any) => a.consultationType === 'Cardiology Review & Echo Scan'), 'Appointment type matches');
  });

  // Step 9: Tasks & Notes - Create Care Task & Clinical Progress Note
  await runner.runTest('Tasks & Notes - Create Care Task & Clinical Note', async () => {
    const taskRes = await adminClient.post('/tasks', {
      patientId: createdPatientId,
      patientIdCode: createdPatientCode,
      patientName: 'Jonathan Swift',
      title: 'Administer Evening Lisinopril Dose',
      assignedCaregiver: 'Nurse Emily Clark',
      dueTimeText: '06:00 PM',
      statusStr: 'Pending',
      status: 0
    });
    runner.assert(taskRes.status === 200 || taskRes.status === 201, 'Care task created');

    const noteRes = await adminClient.post('/nurse-documentation', {
      patientId: createdPatientId,
      patientIdCode: createdPatientCode,
      patientName: 'Jonathan Swift',
      documentName: 'Shift Progress Note',
      notesContent: 'Patient resting comfortably. Vitals stable throughout morning round.',
      status: 'Completed'
    });
    runner.assert(noteRes.status === 200 || noteRes.status === 201, 'Clinical note created');
  });

  // Step 10: History - Retrieve Audit & Event Timeline
  await runner.runTest('History - Retrieve Patient Event Timeline & Audit Logs', async () => {
    const historyRes = await adminClient.get(`/patients/${createdPatientId}/history`);
    runner.assertEquals(historyRes.status, 200, 'History API succeeded');
    const events = historyRes.data?.data || (Array.isArray(historyRes.data) ? historyRes.data : []);
    runner.assert(events.length > 0, 'History events list must contain registration/vitals entries');
  });

  // Step 11: Cleanup Test Patient
  await runner.runTest('Cleanup Test Patient', async () => {
    const delRes = await adminClient.delete(`/patients/${createdPatientId}`);
    runner.assertEquals(delRes.status, 200, 'Patient deleted successfully');
  });
}
