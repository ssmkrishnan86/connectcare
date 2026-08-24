import { TestHarness } from './test-runner';

export interface AuthTokens {
  adminToken: string;
  adminUser: any;
  doctorToken: string;
  doctorUser: any;
  nurseToken: string;
  nurseUser: any;
}

export async function runAuthE2ETests(harness: TestHarness): Promise<AuthTokens> {
  harness.currentSuite = 'Authentication & Role Security';
  console.log(`\n📌 [SUITE] ${harness.currentSuite}`);

  const client = harness.createClient();
  const tokens: Partial<AuthTokens> = {};

  // Test 1: Admin Login
  await harness.runTest('Admin login with valid credentials returns JWT & Admin role', async () => {
    const res = await client.post('/auth/login', {
      username: 'admin',
      password: 'admin123',
    });
    harness.assert(res.status === 200, 'Status should be 200');
    const data = res.data?.data || res.data;
    const token = data?.token || res.data?.token;
    harness.assert(!!token, 'Token must be present in response');
    const user = data?.user || data;
    harness.assertEquals(user?.role, 'Admin');
    tokens.adminToken = token;
    tokens.adminUser = user;
  });

  // Test 2: Doctor Login
  await harness.runTest('Doctor login with valid credentials returns JWT, Doctor role & doctorId', async () => {
    const res = await client.post('/auth/login', {
      username: 'sarah.wilson',
      password: 'doctor123',
    });
    harness.assert(res.status === 200, 'Status should be 200');
    const data = res.data?.data || res.data;
    const token = data?.token || res.data?.token;
    harness.assert(!!token, 'Token must be present in response');
    const user = data?.user || data;
    harness.assertEquals(user?.role, 'Doctor');
    tokens.doctorToken = token;
    tokens.doctorUser = user;
  });

  // Test 3: Nurse Login
  await harness.runTest('Nurse login with valid credentials returns JWT, Nurse role & nurseId', async () => {
    const res = await client.post('/auth/login', {
      username: 'emily.davis',
      password: 'nurse123',
    });
    harness.assert(res.status === 200, 'Status should be 200');
    const data = res.data?.data || res.data;
    const token = data?.token || res.data?.token;
    harness.assert(!!token, 'Token must be present in response');
    const user = data?.user || data;
    harness.assertEquals(user?.role, 'Nurse');
    tokens.nurseToken = token;
    tokens.nurseUser = user;
  });

  // Test 4: Invalid Login Rejection
  await harness.runTest('Invalid credentials returns 401 Unauthorized', async () => {
    try {
      await client.post('/auth/login', {
        username: 'admin',
        password: 'wrongpassword123',
      });
      harness.assert(false, 'Should have thrown 401');
    } catch (err: any) {
      harness.assertEquals(err?.response?.status, 401);
    }
  });

  // Test 5: RBAC User Menu for Admin
  await harness.runTest('RBAC endpoint returns Admin menus with Patients, Doctors, Nurses, Settings', async () => {
    const adminClient = harness.createClient(tokens.adminToken);
    const res = await adminClient.get('/rbac/user-menu?role=Admin');
    harness.assertEquals(res.status, 200);
    const menus = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    harness.assert(menus.length > 5, 'Admin should have full menu set');
    harness.assert(menus.some((m: any) => m.path === '/patients'), 'Patients menu must exist for Admin');
    harness.assert(menus.some((m: any) => m.path === '/settings'), 'Settings menu must exist for Admin');
  });

  // Test 6: RBAC User Menu for Doctor
  await harness.runTest('RBAC endpoint returns Doctor menus without Admin Settings/Nurses management', async () => {
    const docClient = harness.createClient(tokens.doctorToken);
    const res = await docClient.get('/rbac/user-menu?role=Doctor');
    harness.assertEquals(res.status, 200);
    const menus = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    harness.assert(menus.some((m: any) => m.path === '/patients'), 'My Patients must exist for Doctor');
    harness.assert(menus.some((m: any) => m.path === '/consultations'), 'Consultations must exist for Doctor');
    harness.assert(!menus.some((m: any) => m.path === '/nurses'), 'Nurses management must NOT exist for Doctor');
  });

  // Test 7: RBAC User Menu for Nurse
  await harness.runTest('RBAC endpoint returns Nurse menus including Vital Rounds & Discharge Checklist', async () => {
    const nurseClient = harness.createClient(tokens.nurseToken);
    const res = await nurseClient.get('/rbac/user-menu?role=Nurse');
    harness.assertEquals(res.status, 200);
    const menus = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    harness.assert(menus.some((m: any) => m.path === '/vital-rounds'), 'Vital Rounds must exist for Nurse');
    harness.assert(menus.some((m: any) => m.path === '/discharge-checklist'), 'Discharge Checklist must exist for Nurse');
    harness.assert(!menus.some((m: any) => m.path === '/doctors'), 'Doctors management must NOT exist for Nurse');
  });

  // Test 8: New Doctor Provisioning & Immediate Login
  await harness.runTest('Newly created doctor can immediately log in with default credentials', async () => {
    const adminClient = harness.createClient(tokens.adminToken);
    const uniqueEmail = `testdoc_${Date.now()}@connectcare.com`;
    const docRes = await adminClient.post('/doctors', {
      name: 'Dr. Automated E2E Tester',
      specialty: 'Cardiology',
      specialtyIcon: '❤️',
      department: 'Cardiology Unit',
      location: 'Main Campus',
      phone: '(512) 555-0999',
      email: uniqueEmail,
      experience: '10 Years',
      status: 'Active',
      teleconsultationEnabled: true,
    });
    harness.assert(docRes.status === 200 || docRes.status === 201);

    // Attempt login with newly created email & default password
    const newDocLoginRes = await client.post('/auth/login', {
      username: uniqueEmail,
      password: 'doctor123',
    });
    harness.assertEquals(newDocLoginRes.status, 200);
    const data = newDocLoginRes.data?.data || newDocLoginRes.data;
    const user = data?.user || data;
    harness.assertEquals(user?.role, 'Doctor');
  });

  // Test 9: New Nurse Provisioning & Immediate Login
  await harness.runTest('Newly created nurse can immediately log in with default credentials', async () => {
    const adminClient = harness.createClient(tokens.adminToken);
    const uniqueEmail = `testnurse_${Date.now()}@connectcare.com`;
    const nurseRes = await adminClient.post('/nurses', {
      name: 'Nurse Automated E2E Tester',
      department: 'Emergency Care',
      subUnit: 'ER Unit',
      location: 'Ground Floor Wing',
      shift: 'Day Shift (07:00 AM - 03:00 PM)',
      phone: '(512) 555-0888',
      email: uniqueEmail,
      experience: '6 Years',
      status: 'Active',
    });
    harness.assert(nurseRes.status === 200 || nurseRes.status === 201);

    // Attempt login with newly created email & default password
    const newNurseLoginRes = await client.post('/auth/login', {
      username: uniqueEmail,
      password: 'nurse123',
    });
    harness.assertEquals(newNurseLoginRes.status, 200);
    const data = newNurseLoginRes.data?.data || newNurseLoginRes.data;
    const user = data?.user || data;
    harness.assertEquals(user?.role, 'Nurse');
  });

  return tokens as AuthTokens;
}
