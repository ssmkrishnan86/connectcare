import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Output directory for the final video recordings
const VIDEOS_OUT_DIR = path.resolve(__dirname, '../../videos');

// Helper: Ensure video directory exists
function ensureVideoDir() {
  if (!fs.existsSync(VIDEOS_OUT_DIR)) {
    fs.mkdirSync(VIDEOS_OUT_DIR, { recursive: true });
  }
}

// Helper: Clean logout & login
async function loginAs(page: Page, username: string, password: string) {
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
  await page.waitForTimeout(400);
  await page.locator('input[type="password"]').fill(password);
  await page.waitForTimeout(400);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

// Helper: Smooth page scroll
async function smoothScroll(page: Page, y: number, waitMs = 1200) {
  await page.evaluate((targetY) => {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, y);
  await page.waitForTimeout(waitMs);
}

test.describe('ConnectCare Demo Video Recordings', () => {

  test.beforeAll(() => {
    ensureVideoDir();
  });

  // =========================================================================
  // VIDEO 1: CONNECTCARE CORE PLATFORM (Flows 01 to 10)
  // =========================================================================
  test('Video 01 - ConnectCare Core Healthcare Platform Walkthrough', async ({ page }, testInfo) => {
    test.setTimeout(300000); // 5 minutes

    console.log('🎥 Recording Video 1: ConnectCare Core Healthcare Platform...');

    // -----------------------------------------------------------------------
    // Flow 01: Secure Login & Role-Based Access
    // -----------------------------------------------------------------------
    console.log('  -> Flow 01: Role-Based Authentication & Navigation');
    // Admin login
    await loginAs(page, 'admin', 'admin123');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 400);
    await smoothScroll(page, 0);

    // Doctor login
    await loginAs(page, 'doctor', 'doctor123');
    await page.waitForTimeout(2000);

    // Nurse login
    await loginAs(page, 'nurse', 'nurse123');
    await page.waitForTimeout(2000);

    // Switch back to Admin for administrative setup
    await loginAs(page, 'admin', 'admin123');

    // -----------------------------------------------------------------------
    // Flow 02: Hospital & Organization Setup
    // -----------------------------------------------------------------------
    console.log('  -> Flow 02: Organization & Locations Setup');
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 500);
    await smoothScroll(page, 0);

    // Locations / Units
    await page.goto('/locations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await smoothScroll(page, 400);
    await smoothScroll(page, 0);

    // -----------------------------------------------------------------------
    // Flow 03: Doctor Management
    // -----------------------------------------------------------------------
    console.log('  -> Flow 03: Doctor Management & Profiles');
    await page.goto('/doctors');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Search doctor
    const docSearch = page.locator('input[placeholder*="Search" i]').first();
    if (await docSearch.isVisible()) {
      await docSearch.fill('Jenkins');
      await page.waitForTimeout(1500);
      await docSearch.clear();
      await page.waitForTimeout(1000);
    }

    // View Doctor Details if any doctor card/row exists
    const viewDocBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewDocBtn.isVisible()) {
      await viewDocBtn.click();
      await page.waitForTimeout(2500);
      await page.goto('/doctors');
      await page.waitForLoadState('networkidle');
    }

    // -----------------------------------------------------------------------
    // Flow 04: Nurse & Care Team Management
    // -----------------------------------------------------------------------
    console.log('  -> Flow 04: Nurse & Care Team Management');
    await page.goto('/nurses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await smoothScroll(page, 300);

    await page.goto('/care-teams');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    // -----------------------------------------------------------------------
    // Flow 05: Patient Registration & Directory
    // -----------------------------------------------------------------------
    console.log('  -> Flow 05: Patient Registration & Profile');
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    // Open first patient details
    const patientRow = page.locator('tbody tr, div[class*="rounded"][class*="border"]').filter({ hasText: /Patient|Vance|Test|Regu/i }).first();
    if (await patientRow.isVisible()) {
      await patientRow.click();
    } else {
      const viewPatientBtn = page.locator('a[href*="/patients/"], button:has-text("View")').first();
      if (await viewPatientBtn.isVisible()) await viewPatientBtn.click();
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // -----------------------------------------------------------------------
    // Flow 06: Patient Clinical Record & Vitals
    // -----------------------------------------------------------------------
    console.log('  -> Flow 06: Patient Clinical Record & Vitals');
    // Click Vitals tab if visible
    const vitalsTab = page.locator('button:has-text("Vitals"), a:has-text("Vitals"), [role="tab"]:has-text("Vitals")').first();
    if (await vitalsTab.isVisible()) {
      await vitalsTab.click();
      await page.waitForTimeout(2000);
      await smoothScroll(page, 400);
      await smoothScroll(page, 0);
    }

    // -----------------------------------------------------------------------
    // Flow 07: Medication Management
    // -----------------------------------------------------------------------
    console.log('  -> Flow 07: Medication Management');
    await page.goto('/medications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await smoothScroll(page, 400);
    await smoothScroll(page, 0);

    // -----------------------------------------------------------------------
    // Flow 08: Alerts & Clinical Monitoring
    // -----------------------------------------------------------------------
    console.log('  -> Flow 08: Clinical Alerts & Escalation');
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await smoothScroll(page, 300);

    // -----------------------------------------------------------------------
    // Flow 09: Care Plan Management
    // -----------------------------------------------------------------------
    console.log('  -> Flow 09: Care Plan Management');
    await page.goto('/care-plans');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await smoothScroll(page, 300);

    // -----------------------------------------------------------------------
    // Flow 10: Task Management
    // -----------------------------------------------------------------------
    console.log('  -> Flow 10: Task Management');
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await smoothScroll(page, 300);

    // Final dashboard recap
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✓ Video 1 Recording Complete.');
  });

  // =========================================================================
  // VIDEO 2: CONNECTCARE CLINICAL AI & GOVERNANCE SUITE (Flows 11 to 24)
  // =========================================================================
  test('Video 02 - ConnectCare Clinical AI Platform & Copilot Suite', async ({ page }, testInfo) => {
    test.setTimeout(300000); // 5 minutes

    console.log('🎥 Recording Video 2: ConnectCare Clinical AI Suite...');
    await loginAs(page, 'admin', 'admin123');

    // Navigate to AI Integrations Hub Gallery
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    // -----------------------------------------------------------------------
    // Flow 11: AI Patient Summary
    // -----------------------------------------------------------------------
    console.log('  -> Flow 11: AI Patient Summary & Evidence Drawer');
    const screen1Btn = page.locator('button:has-text("1. Patient Summary")').first();
    if (await screen1Btn.isVisible()) {
      await screen1Btn.click();
      await page.waitForTimeout(2000);
      await smoothScroll(page, 400);

      // Open Context modal
      const ctxBtn = page.locator('button:has-text("AI Context"), button:has-text("Context")').first();
      if (await ctxBtn.isVisible()) {
        await ctxBtn.click();
        await page.waitForTimeout(2500);
        // Close modal
        await page.locator('button:has-text("Close"), button:has(svg.lucide-x)').first().click();
        await page.waitForTimeout(1000);
      }
      await smoothScroll(page, 0);
    }

    // -----------------------------------------------------------------------
    // Flow 12: AI Care Team Intelligence -> Task Dispatch
    // -----------------------------------------------------------------------
    console.log('  -> Flow 12: AI Care Team Intelligence & Task Dispatch');
    const screen2Btn = page.locator('button:has-text("2. Care Intelligence")').first();
    if (await screen2Btn.isVisible()) {
      await screen2Btn.click();
      await page.waitForTimeout(2500);
      await smoothScroll(page, 400);
      await smoothScroll(page, 0);
    }

    // -----------------------------------------------------------------------
    // Flow 13: AI Alert Prioritization
    // -----------------------------------------------------------------------
    console.log('  -> Flow 13: AI Alert Prioritization');
    const screen4Btn = page.locator('button:has-text("4. Alert Prioritization")').first();
    if (await screen4Btn.isVisible()) {
      await screen4Btn.click();
      await page.waitForTimeout(2500);
      await smoothScroll(page, 400);
      await smoothScroll(page, 0);
    }

    // -----------------------------------------------------------------------
    // Flow 14: AI Medication Safety Review
    // -----------------------------------------------------------------------
    console.log('  -> Flow 14: AI Medication Safety Review');
    const screen5Btn = page.locator('button:has-text("5. Medication Review")').first();
    if (await screen5Btn.isVisible()) {
      await screen5Btn.click();
      await page.waitForTimeout(2500);
      await smoothScroll(page, 400);
      await smoothScroll(page, 0);
    }

    // -----------------------------------------------------------------------
    // Flow 15: AI Discharge Readiness Review
    // -----------------------------------------------------------------------
    console.log('  -> Flow 15: AI Discharge Readiness Review');
    const screen3Btn = page.locator('button:has-text("3. Discharge Review")').first();
    if (await screen3Btn.isVisible()) {
      await screen3Btn.click();
      await page.waitForTimeout(2500);
      await smoothScroll(page, 400);
      await smoothScroll(page, 0);
    }

    // -----------------------------------------------------------------------
    // Flow 16 & 17: Doctor & Nurse AI Copilots
    // -----------------------------------------------------------------------
    console.log('  -> Flow 16 & 17: Doctor and Nurse AI Copilots');
    const docCopilotBtn = page.locator('button:has-text("6. Doctor Copilot")').first();
    if (await docCopilotBtn.isVisible()) {
      await docCopilotBtn.click();
      await page.waitForTimeout(2500);
      await smoothScroll(page, 300);
      await smoothScroll(page, 0);
    }

    const nurseCopilotBtn = page.locator('button:has-text("7. Nurse Copilot")').first();
    if (await nurseCopilotBtn.isVisible()) {
      await nurseCopilotBtn.click();
      await page.waitForTimeout(2500);
      await smoothScroll(page, 300);
      await smoothScroll(page, 0);
    }

    // -----------------------------------------------------------------------
    // Flow 18 & 19: Task Management & Human Review Feedback
    // -----------------------------------------------------------------------
    console.log('  -> Flow 18 & 19: AI Task Manager & Human Review');
    const taskMgrBtn = page.locator('button:has-text("8. Task Management")').first();
    if (await taskMgrBtn.isVisible()) {
      await taskMgrBtn.click();
      await page.waitForTimeout(2000);
    }

    const humanRevBtn = page.locator('button:has-text("12. Human Review")').first();
    if (await humanRevBtn.isVisible()) {
      await humanRevBtn.click();
      await page.waitForTimeout(2500);
    }

    // -----------------------------------------------------------------------
    // Flow 21, 22, 23 & 24: AI Operations, Audit, Settings & Evaluation
    // -----------------------------------------------------------------------
    console.log('  -> Flow 21-24: AI Operations Center, Governance & Evaluation');
    const aiOpsBtn = page.locator('button:has-text("9. AI Operations")').first();
    if (await aiOpsBtn.isVisible()) {
      await aiOpsBtn.click();
      await page.waitForTimeout(2500);
    }

    const aiSettingsBtn = page.locator('button:has-text("10. AI Settings")').first();
    if (await aiSettingsBtn.isVisible()) {
      await aiSettingsBtn.click();
      await page.waitForTimeout(2500);
    }

    const auditBtn = page.locator('button:has-text("11. Audit Logs")').first();
    if (await auditBtn.isVisible()) {
      await auditBtn.click();
      await page.waitForTimeout(2500);
    }

    const evalBtn = page.locator('button:has-text("13. Evaluation & Quality")').first();
    if (await evalBtn.isVisible()) {
      await evalBtn.click();
      await page.waitForTimeout(3000);
      await smoothScroll(page, 400);
      await smoothScroll(page, 0);
    }

    console.log('✓ Video 2 Recording Complete.');
  });

  // =========================================================================
  // VIDEO 3: FLAGSHIP PATIENT JOURNEY (Flow 25)
  // =========================================================================
  test('Video 03 - Complete End-to-End Patient Journey Story', async ({ page }, testInfo) => {
    test.setTimeout(300000); // 5 minutes

    console.log('🎥 Recording Video 3: Complete End-to-End Patient Journey...');

    // 1. Admission & Dashboard Baseline
    await loginAs(page, 'admin', 'admin123');
    await page.waitForTimeout(2000);

    // 2. Open Patient Roster
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select Patient (Eleanor Vance / First Patient)
    const patientLink = page.locator('tbody tr, div[class*="rounded"][class*="border"]').filter({ hasText: /Patient|Vance|Test|Regu/i }).first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
    } else {
      const fallbackBtn = page.locator('a[href*="/patients/"]').first();
      if (await fallbackBtn.isVisible()) await fallbackBtn.click();
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 3. Clinical Overview & Vitals Trend
    const vitalsTab = page.locator('button:has-text("Vitals"), a:has-text("Vitals")').first();
    if (await vitalsTab.isVisible()) {
      await vitalsTab.click();
      await page.waitForTimeout(2500);
      await smoothScroll(page, 300);
    }

    // 4. Medications
    const medsTab = page.locator('button:has-text("Medications"), a:has-text("Medications")').first();
    if (await medsTab.isVisible()) {
      await medsTab.click();
      await page.waitForTimeout(2500);
    }

    // 5. Clinical Alert Triage
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await smoothScroll(page, 300);

    // 6. AI Care Intelligence & Priority Dispatch
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const careIntelBtn = page.locator('button:has-text("2. Care Intelligence")').first();
    if (await careIntelBtn.isVisible()) {
      await careIntelBtn.click();
      await page.waitForTimeout(3000);
      await smoothScroll(page, 400);
    }

    // 7. Nurse Execution & Shift Handover
    await loginAs(page, 'nurse', 'nurse123');
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    await page.goto('/shift-handover');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    // 8. Discharge Readiness Review
    await loginAs(page, 'doctor', 'doctor123');
    await page.goto('/discharge-checklist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 9. AI Governance & Final Discharge Overview
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000);

    console.log('✓ Video 3 Recording Complete.');
  });

});
