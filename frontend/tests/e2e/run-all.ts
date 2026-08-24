import { TestHarness } from './test-runner';
import { runAuthE2ETests } from './auth-e2e';
import { runAdminE2ETests } from './admin-e2e';
import { runDoctorE2ETests } from './doctor-e2e';
import { runNurseE2ETests } from './nurse-e2e';
import { runPatientEditViewSuite } from './patient-edit-view-e2e';

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 CONNECTCARE MASTER END-TO-END (E2E) TEST SUITE');
  console.log('='.repeat(70));
  console.log('Target Backend API: http://localhost:5231/api');
  console.log('Target Frontend   : http://localhost:5173');
  console.log(`Started at        : ${new Date().toISOString()}`);

  const harness = new TestHarness();

  try {
    // Phase 1: Authentication & RBAC Tests
    const tokens = await runAuthE2ETests(harness);

    // Phase 2: Admin Portal Tests
    await runAdminE2ETests(harness, tokens);

    // Phase 3: Patient View & Edit Comprehensive Suite
    await runPatientEditViewSuite(harness);

    // Phase 4: Doctor Portal Tests
    await runDoctorE2ETests(harness, tokens);

    // Phase 5: Nurse Portal Tests
    await runNurseE2ETests(harness, tokens);


  } catch (error: any) {
    console.error('\n🚨 FATAL ERROR ENCOUNTERED DURING SUITE EXECUTION:', error);
  } finally {
    const summary = harness.printSummary();
    if (summary.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

main();
