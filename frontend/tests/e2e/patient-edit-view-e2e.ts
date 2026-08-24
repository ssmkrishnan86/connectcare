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

  // Step 6: Care Plan - Retrieve Baseline & Update Individualized Care Plan
  await runner.runTest('Care Plan - Retrieve Baseline & Custom Goals/Interventions', async () => {
    // 6a: Fetch Care Plan endpoint
    const planRes = await adminClient.get(`/patients/${createdPatientId}/care-plan`);
    runner.assertEquals(planRes.status, 200, 'Care Plan retrieval status 200');
    const planData = planRes.data?.data || planRes.data;
    runner.assertDefined(planData.planTitle, 'Care Plan title must be defined');
    runner.assert(Array.isArray(planData.goals) && planData.goals.length > 0, 'Goals list must be populated');

    // 6b: Update Care Plan with custom goals, interventions & review schedule
    const customGoals = [
      'Maintain systolic blood pressure < 125 mmHg',
      'Target resting heart rate 65-75 bpm',
      'Adhere to strict cardiac low-sodium nutrition protocol',
      'Complete 25-minute daily assisted treadmill mobility'
    ];
    const updatePlanPayload = {
      planTitle: 'Individualized Post-Infarction Cardiac Rehabilitation Plan',
      primaryCondition: 'Hypertensive Heart Disease',
      status: 'Active',
      progressPercentage: 82,
      startDate: '08/24/2026',
      reviewDate: '09/07/2026',
      goals: customGoals,
      interventions: 'Continuous telemetry ECG monitoring, low-sodium cardiac diet, physical therapy 2x daily.',
      attendingDoctorName: 'Dr. Sarah Wilson',
      assignedNurseName: 'Nurse Emily Clark'
    };

    const updatePlanRes = await adminClient.post(`/patients/${createdPatientId}/care-plan`, updatePlanPayload);
    runner.assertEquals(updatePlanRes.status, 200, 'Care plan update status 200');

    // 6c: Verify updated care plan retrieval
    const verifyPlanRes = await adminClient.get(`/patients/${createdPatientId}/care-plan`);
    const verifiedPlan = verifyPlanRes.data?.data || verifyPlanRes.data;
    runner.assertEquals(verifiedPlan.planTitle, 'Individualized Post-Infarction Cardiac Rehabilitation Plan', 'Plan title updated');
    runner.assertEquals(verifiedPlan.progressPercentage, 82, 'Progress percentage updated');
    runner.assert(verifiedPlan.goals.length === 4, 'Custom goals count is 4');
  });

  // Step 7: Vitals & Trends - Periodic Multi-Record Capture & Graph Trend Analytics
  await runner.runTest('Vitals & Trends - Record Periodic Telemetry Rounds & Verify Graph Analytics', async () => {
    // 7a: Record 5 sequential periodic rounds throughout the day
    const periodicRounds = [
      {
        timeText: '04:00 AM',
        dateText: 'Aug 24, 2026',
        bloodPressure: '122/80 mmHg',
        heartRate: '72 bpm',
        bloodSugar: '102 mg/dL',
        temperature: '98.6 °F',
        spO2: '98 %',
        respiratoryRate: '18 /min',
        recordedBy: 'Nurse Emily Clark'
      },
      {
        timeText: '08:00 AM',
        dateText: 'Aug 24, 2026',
        bloodPressure: '126/82 mmHg',
        heartRate: '76 bpm',
        bloodSugar: '114 mg/dL',
        temperature: '98.7 °F',
        spO2: '99 %',
        respiratoryRate: '18 /min',
        recordedBy: 'Nurse Emily Clark'
      },
      {
        timeText: '12:00 PM',
        dateText: 'Aug 24, 2026',
        bloodPressure: '130/84 mmHg',
        heartRate: '82 bpm',
        bloodSugar: '120 mg/dL',
        temperature: '98.8 °F',
        spO2: '98 %',
        respiratoryRate: '20 /min',
        recordedBy: 'Nurse Staff'
      },
      {
        timeText: '04:00 PM',
        dateText: 'Aug 24, 2026',
        bloodPressure: '124/80 mmHg',
        heartRate: '74 bpm',
        bloodSugar: '106 mg/dL',
        temperature: '98.6 °F',
        spO2: '99 %',
        respiratoryRate: '18 /min',
        recordedBy: 'Nurse Emily Clark'
      },
      {
        timeText: '08:00 PM',
        dateText: 'Aug 24, 2026',
        bloodPressure: '120/78 mmHg',
        heartRate: '70 bpm',
        bloodSugar: '98 mg/dL',
        temperature: '98.6 °F',
        spO2: '99 %',
        respiratoryRate: '16 /min',
        recordedBy: 'Nurse Staff'
      }
    ];

    for (const round of periodicRounds) {
      const res = await adminClient.post(`/patients/${createdPatientId}/vitals`, round);
      runner.assertEquals(res.status, 200, `Round at ${round.timeText} recorded successfully`);
    }

    // 7b: Fetch patient vitals endpoint and verify graph trend dataset
    const vitalsRes = await adminClient.get(`/patients/${createdPatientId}/vitals`);
    runner.assertEquals(vitalsRes.status, 200, 'Vitals telemetry endpoint status 200');
    const vitalsData = vitalsRes.data?.data || vitalsRes.data;

    // Verify current patient vitals reflects latest evening round
    runner.assertEquals(vitalsData.bloodPressure, '120/78 mmHg', 'Current BP reflects latest round (120/78 mmHg)');
    runner.assertEquals(vitalsData.heartRate, '70 bpm', 'Current HR reflects latest round (70 bpm)');
    runner.assertEquals(vitalsData.spO2, '99 %', 'Current SpO2 reflects latest round (99 %)');

    // Verify history logs contain all 5 recorded rounds with parsed numeric chart values
    runner.assert(Array.isArray(vitalsData.history) && vitalsData.history.length >= 5, 'Telemetry history has >= 5 periodic rounds recorded');
    
    const sampleEntry = vitalsData.history.find((r: any) => r.timeText === '12:00 PM');
    runner.assertDefined(sampleEntry, 'Midday 12:00 PM telemetry record exists');
    runner.assertEquals(sampleEntry.systolic, 130, 'Parsed systolic numeric value for graphing is 130');
    runner.assertEquals(sampleEntry.diastolic, 84, 'Parsed diastolic numeric value for graphing is 84');
    runner.assertEquals(sampleEntry.heartRateVal, 82, 'Parsed heart rate numeric value for graphing is 82');

    // Verify calculated aggregate trends summary for graphing
    runner.assertDefined(vitalsData.trends, 'Telemetry trends summary object is provided');
    runner.assert(vitalsData.trends.avgSystolic >= 120 && vitalsData.trends.avgSystolic <= 130, 'Average systolic is in valid range');
    runner.assert(vitalsData.trends.avgHeartRate >= 65 && vitalsData.trends.avgHeartRate <= 85, 'Average heart rate is in valid range');
    runner.assertEquals(vitalsData.trends.hemodynamicStatus, 'Stable Telemetry', 'Hemodynamic stability rating is Stable Telemetry');
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
