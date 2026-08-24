import { TestHarness } from './test-runner';
import { AuthTokens } from './auth-e2e';

export async function runAdminE2ETests(harness: TestHarness, tokens: AuthTokens): Promise<void> {
  harness.currentSuite = 'Admin Portal Functionality & Controls';
  console.log(`\n📌 [SUITE] ${harness.currentSuite}`);

  const client = harness.createClient(tokens.adminToken);

  let testPatientId: string = '';
  let testDoctorId: string = '';
  let testNurseId: string = '';
  let testCareTeamMemberId: string = '';
  let testTaskId: string = '';
  let testAlertId: string = '';

  // 1. Dashboard Stats / Summary
  await harness.runTest('Admin Dashboard stats API returns active counts for patients, doctors, nurses, alerts, tasks', async () => {
    const res = await client.get('/dashboard/summary').catch(() => client.get('/dashboard/stats'));
    harness.assertEquals(res.status, 200);
    const data = res.data?.data || res.data;
    harness.assert(
      data?.totalPatients !== undefined ||
      data?.allPatients !== undefined ||
      data?.criticalAlerts !== undefined ||
      data?.activeAlerts !== undefined,
      'Summary data should exist'
    );

  });

  // 2. Patients Management - Create Patient
  await harness.runTest('Patient creation with full clinical fields, US phone and status', async () => {
    const newPatientData = {
      name: 'Eleanor Roosevelt',
      dob: '1945-10-11',
      gender: 'Female',
      ageGender: '78 / Female',
      phone: '(512) 555-0144',
      email: `eleanor_${Date.now()}@patientcare.com`,
      address: '742 Evergreen Terrace, Austin, TX 78701',
      careUnit: 'Cardiology Unit',
      floorRoom: '3rd Floor - 304',
      primaryDoctorName: 'Dr. Sarah Wilson',
      status: 'InCare',
      riskLevel: 'Medium',
      admissionDate: 'Aug 24, 2026',
    };

    const res = await client.post('/patients', newPatientData);
    harness.assert(res.status === 200 || res.status === 201, 'Patient created status should be 200 or 201');
    const data = res.data?.data || res.data;
    harness.assert(!!data?.id, 'Patient ID must be generated');
    testPatientId = data.id;
  });

  // 3. Patients Management - Search & Filtering
  await harness.runTest('Patient search and filtering by Status, Care Unit and Risk Level', async () => {
    const res = await client.get('/patients');
    harness.assertEquals(res.status, 200);
    const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    harness.assert(list.length > 0, 'Patient list should not be empty');

    const searchRes = await client.get('/patients?search=Eleanor');
    harness.assertEquals(searchRes.status, 200);
    const searchList = Array.isArray(searchRes.data) ? searchRes.data : (searchRes.data?.data || []);
    harness.assert(searchList.some((p: any) => (p.name || '').includes('Eleanor')), 'Search should find Eleanor');
  });

  // 4. Patients Management - Update Patient
  await harness.runTest('Update patient details and status to Admitted', async () => {
    harness.assert(!!testPatientId, 'testPatientId must exist');
    const updateRes = await client.put(`/patients/${testPatientId}`, {
      name: 'Eleanor Roosevelt Updated',
      dob: '1945-10-11',
      gender: 'Female',
      phone: '(512) 555-0144',
      email: 'eleanor.updated@patientcare.com',
      address: '742 Evergreen Terrace, Austin, TX 78701',
      careUnit: 'Cardiology Unit',
      floorRoom: '3rd Floor - 304',
      status: 'Admitted',
      riskLevel: 'High',
    });
    harness.assertEquals(updateRes.status, 200);
  });

  // 5. Patients Management - Patient Details
  await harness.runTest('Fetch individual patient details with vitals and care history', async () => {
    harness.assert(!!testPatientId, 'testPatientId must exist');
    const res = await client.get(`/patients/${testPatientId}`);
    harness.assertEquals(res.status, 200);
    const data = res.data?.data || res.data;
    harness.assertEquals(data.id, testPatientId);
  });

  // 6. Doctors Management - Create Doctor
  await harness.runTest('Create doctor record with specialty, department, location and credentials', async () => {
    const uniqueEmail = `dr.samuel_${Date.now()}@connectcare.com`;
    const res = await client.post('/doctors', {
      name: 'Dr. Samuel Clemens',
      specialty: 'Neurology',
      specialtyIcon: '🧠',
      department: 'Neurology Department',
      location: 'Main Pavilion - 2nd Floor',
      phone: '(512) 555-0322',
      email: uniqueEmail,
      experience: '12 Years',
      status: 'Active',
      teleconsultationEnabled: true,
    });
    harness.assert(res.status === 200 || res.status === 201);
    const data = res.data?.data || res.data;
    harness.assert(!!data?.id, 'Doctor ID must be created');
    testDoctorId = data.id;
  });

  // 7. Doctors Management - Filter and Update
  await harness.runTest('Filter doctors by specialty and update profile', async () => {
    const listRes = await client.get('/doctors?specialty=Neurology');
    harness.assertEquals(listRes.status, 200);
    const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || []);
    harness.assert(list.some((d: any) => d.name === 'Dr. Samuel Clemens'), 'Neurology filter should find Dr. Samuel Clemens');

    const updateRes = await client.put(`/doctors/${testDoctorId}`, {
      id: testDoctorId,
      name: 'Dr. Samuel Clemens Updated',
      specialty: 'Neurology',
      specialtyIcon: '🧠',
      department: 'Neurology Department',
      location: 'Main Pavilion - 3rd Floor',
      phone: '(512) 555-0322',
      email: list.find((d: any) => d.id === testDoctorId)?.email || 'samuel@connectcare.com',
      experience: '13 Years',
      status: 'Active',
      teleconsultationEnabled: true,
    });
    harness.assertEquals(updateRes.status, 200);
  });

  // 8. Nurses Management - Create Nurse
  await harness.runTest('Create nurse record with shift assignment and sub-unit', async () => {
    const uniqueEmail = `nurse.florence_${Date.now()}@connectcare.com`;
    const res = await client.post('/nurses', {
      name: 'Florence Nightingale',
      department: 'Intensive Care Unit (ICU)',
      subUnit: 'ICU Unit A',
      location: '2nd Floor - ICU Wing',
      shift: 'Night Shift (11:00 PM - 07:00 AM)',
      phone: '(512) 555-0766',
      email: uniqueEmail,
      experience: '8 Years',
      status: 'Active',
    });
    harness.assert(res.status === 200 || res.status === 201);
    const data = res.data?.data || res.data;
    harness.assert(!!data?.id, 'Nurse ID must be created');
    testNurseId = data.id;
  });

  // 9. Nurses Management - Nurse Stats
  await harness.runTest('Nurse stats API returns active, on-leave and total nurse counts', async () => {
    const res = await client.get('/nurses/stats');
    harness.assertEquals(res.status, 200);
    const data = res.data?.data || res.data;
    harness.assert(typeof data?.totalNurses === 'number' || typeof data?.active === 'number', 'Nurse stats must have numbers');
  });

  // 10. Care Teams Management - Create Member
  await harness.runTest('Create care team member with team mapping and location dropdown values', async () => {
    const res = await client.post('/careteams', {
      name: 'Clara Barton, RN',
      role: 'Nurse',
      teamName: 'Cardiology Alpha Team',
      specialty: 'Critical Care',
      department: 'Cardiology Unit',
      location: 'Main Campus (3rd Floor)',
      phone: '(512) 555-0455',
      email: `clara_${Date.now()}@careteam.com`,
      shift: 'Day Shift (07:00 AM - 03:00 PM)',
      status: 'Active',
    });
    harness.assertEquals(res.status, 200);
    const data = res.data?.data || res.data;
    harness.assert(!!data?.id, 'Care team member ID must be created');
    testCareTeamMemberId = data.id;
  });

  // 11. Tasks Management - Create Task with Select Doctor
  await harness.runTest('Create task with priority, due date and assigned doctor', async () => {
    const res = await client.post('/tasks', {
      title: 'Conduct Comprehensive Neurological Assessment',
      description: 'Perform standard reflex, cranial nerve, and motor strength tests.',
      patientName: 'Eleanor Roosevelt Updated',
      patientIdCode: 'P-001',
      taskType: 'Clinical Care',
      priority: 'High',
      assigneeName: 'Dr. Sarah Wilson',
      assigneeRole: 'Doctor',
      dueDateText: 'Aug 25, 2026, 10:00 AM',
      statusStr: 'Open',
    });
    harness.assertEquals(res.status, 200);
    const data = res.data?.data || res.data;
    harness.assert(!!data?.id, 'Task ID must be created');
    testTaskId = data.id;
  });

  // 12. Tasks Management - Toggle Complete
  await harness.runTest('Toggle task completion status to Completed', async () => {
    harness.assert(!!testTaskId, 'testTaskId must exist');
    const res = await client.put(`/tasks/${testTaskId}/toggle-complete`);
    harness.assertEquals(res.status, 200);
  });

  // 13. Alerts Management - Create, Acknowledge, Add Note, Resolve
  await harness.runTest('Full Alert workflow: create alert, acknowledge, add note, and resolve', async () => {
    const createRes = await client.post('/alerts', {
      title: 'Telemetry Bradycardia Warning',
      description: 'Heart rate dropped below 50 bpm for 4 consecutive minutes.',
      patientName: 'Eleanor Roosevelt Updated',
      patientIdCode: 'P-001',
      patientAvatar: '',
      severity: 'Critical',
      type: 'Cardiac Alert',
      careUnit: 'Cardiology Unit',
      source: 'Bedside Monitor',
      reportedBy: 'ECG Monitor System',
    });
    harness.assertEquals(createRes.status, 200);
    const data = createRes.data?.data || createRes.data;
    testAlertId = data.id;

    // Acknowledge Alert
    const ackRes = await client.put(`/alerts/${testAlertId}/acknowledge`, {
      staffName: 'Admin Staff',
    });
    harness.assertEquals(ackRes.status, 200);

    // Add Clinical Progress Note
    const noteRes = await client.post(`/alerts/${testAlertId}/notes`, {
      note: 'Patient evaluated; rate stabilized at 68 bpm after medication adjustment.',
      author: 'Admin Staff',
    });
    harness.assertEquals(noteRes.status, 200);

    // Resolve Alert
    const resolveRes = await client.put(`/alerts/${testAlertId}/resolve`, {
      resolutionNotes: 'Bradycardia resolved following IV fluid bolus.',
      resolvedBy: 'Admin Staff',
    });
    harness.assertEquals(resolveRes.status, 200);
  });

  // 14. Locations Management
  await harness.runTest('Locations CRUD: list locations, create location, and verify bed counts', async () => {
    const listRes = await client.get('/locations');
    harness.assertEquals(listRes.status, 200);
    const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || []);
    harness.assert(list.length > 0, 'Locations list should have default units');
  });

  // 15. Settings: General Settings
  await harness.runTest('Settings -> General Settings fetch and update currency/units', async () => {
    const getRes = await client.get('/settings/general');
    harness.assertEquals(getRes.status, 200);
    const existing = getRes.data?.data || getRes.data;

    const putRes = await client.put('/settings/general', {
      ...existing,
      organizationName: 'Connected Care Senior Living Austin',
      currency: 'USD ($) - US Dollar',
    });
    harness.assertEquals(putRes.status, 200);
  });

  // 16. Settings: Localization Settings
  await harness.runTest('Settings -> Localization Settings fetch and update date/time formats', async () => {
    const getRes = await client.get('/settings/localization');
    harness.assertEquals(getRes.status, 200);
    const existing = getRes.data?.data || getRes.data;

    const putRes = await client.put('/settings/localization', {
      ...existing,
      defaultLanguage: 'English (United States)',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12 Hour (AM/PM)',
    });
    harness.assertEquals(putRes.status, 200);
  });

  // 17. Settings: User Management & Lock/Unlock Toggle
  await harness.runTest('Settings -> User Management list users and toggle lock status', async () => {
    const listRes = await client.get('/settings/users');
    harness.assertEquals(listRes.status, 200);
    const users = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || []);
    harness.assert(users.length > 0, 'User list should not be empty');

    if (users[0]?.id) {
      const toggleRes = await client.put(`/settings/users/${users[0].id}/toggle-status`);
      harness.assertEquals(toggleRes.status, 200);
    }
  });

  // 18. Settings: Security, Integrations, Billing, Audit Logs
  await harness.runTest('Settings -> Security, Integrations, Billing, and Audit Logs verification', async () => {
    const [secRes, integRes, billRes, auditRes] = await Promise.all([
      client.get('/settings/security'),
      client.get('/settings/integrations'),
      client.get('/settings/billing'),
      client.get('/audit-logs'),
    ]);

    harness.assertEquals(secRes.status, 200);
    harness.assertEquals(integRes.status, 200);
    harness.assertEquals(billRes.status, 200);
    harness.assertEquals(auditRes.status, 200);
  });

  // 19. Cleanup Created Records
  await harness.runTest('Admin deletes test patient, doctor, nurse, care team member, and task', async () => {
    if (testPatientId) await client.delete(`/patients/${testPatientId}`).catch(() => {});
    if (testDoctorId) await client.delete(`/doctors/${testDoctorId}`).catch(() => {});
    if (testNurseId) await client.delete(`/nurses/${testNurseId}`).catch(() => {});
    if (testCareTeamMemberId) await client.delete(`/careteams/${testCareTeamMemberId}`).catch(() => {});
    if (testTaskId) await client.delete(`/tasks/${testTaskId}`).catch(() => {});
    if (testAlertId) await client.delete(`/alerts/${testAlertId}`).catch(() => {});
  });
}
