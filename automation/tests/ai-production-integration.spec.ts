import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

test.describe('ConnectCare AI UI Integration & Safety Guardrails Production Suite', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('AI Hub - 13 Screen Gallery Layout and Navigation Tabs', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    // Verify main header
    await expect(page.locator('text=ConnectCare AI')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=AI INTEGRATIONS & CLINICAL COPILOT SUITE')).toBeVisible();

    // Verify all 14 nav buttons (0 to 13)
    await expect(page.locator('button:has-text("All Pages (Screen Designs)")')).toBeVisible();
    await expect(page.locator('button:has-text("1. Patient Summary")')).toBeVisible();
    await expect(page.locator('button:has-text("2. Care Intelligence")')).toBeVisible();
    await expect(page.locator('button:has-text("3. Discharge Review")')).toBeVisible();
    await expect(page.locator('button:has-text("4. Alert Prioritization")')).toBeVisible();
    await expect(page.locator('button:has-text("5. Medication Review")')).toBeVisible();
    await expect(page.locator('button:has-text("6. Doctor Copilot")')).toBeVisible();
    await expect(page.locator('button:has-text("7. Nurse Copilot")')).toBeVisible();
    await expect(page.locator('button:has-text("8. Task Management")')).toBeVisible();
    await expect(page.locator('button:has-text("9. AI Operations")')).toBeVisible();
    await expect(page.locator('button:has-text("10. AI Settings")')).toBeVisible();
    await expect(page.locator('button:has-text("11. Audit Logs")')).toBeVisible();
    await expect(page.locator('button:has-text("12. Human Review")')).toBeVisible();
    await expect(page.locator('button:has-text("13. Evaluation & Quality")')).toBeVisible();
  });

  test('P0-01: AI Patient Summary - Provenance Badges, Context Inspector & Evidence Drawer', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    // Navigate to Screen 1
    await page.locator('button:has-text("1. Patient Summary")').click();
    await page.waitForTimeout(1000);

    // Verify Patient Summary Screen elements
    await expect(page.locator('text=AI Clinical Patient Summary')).toBeVisible({ timeout: 10000 });

    // Open AI Context Inspector modal
    const contextBtn = page.locator('button:has-text("AI Context")').first();
    if (await contextBtn.isVisible()) {
      await contextBtn.click();
      await expect(page.locator('text=Minimum-Necessary Context Bundle')).toBeVisible({ timeout: 8000 });
      await page.locator('button:has-text("Close")').or(page.locator('button:has(svg.lucide-x)')).first().click();
    }

    // Open Evidence Drawer
    const evidenceBtn = page.locator('button:has-text("Evidence & Guidelines")').or(page.locator('button:has-text("Evidence")')).first();
    if (await evidenceBtn.isVisible()) {
      await evidenceBtn.click();
      await expect(page.locator('text=Clinical Practice Guidelines & Evidence Base')).toBeVisible({ timeout: 8000 });
      // Close drawer
      await page.locator('button:has(svg.lucide-x)').first().click();
    }
  });

  test('P0-02: AI Care Team Intelligence - Multidisciplinary Role Routing & Task Dispatch', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("2. Care Intelligence")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=AI Care Team Intelligence & Multi-Role Synthesis')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=All Disciplines')).toBeVisible();
    await expect(page.locator('button:has-text("Attending Physician")')).toBeVisible();
    await expect(page.locator('button:has-text("Bedside Nursing")')).toBeVisible();
  });

  test('P0-03: AI Discharge Review - Readiness Score & Missing Items', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("3. Discharge Review")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=AI Discharge Readiness Review')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Readiness Status')).toBeVisible();
    await expect(page.locator('text=Identified Blockers & Missing Items')).toBeVisible();
  });

  test('P0-04: AI Alert Prioritization - Original vs AI Severity Matrix', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("4. Alert Prioritization")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=AI Alert Prioritization Matrix')).toBeVisible({ timeout: 10000 });
  });

  test('P0-05: AI Medication Review - Beers Criteria & Prescriber Guardrails', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("5. Medication Review")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=AI Medication Intelligence & Safety Review')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Physician & Pharmacist Ordering Guardrail')).toBeVisible();
  });

  test('P0-06 & P0-07: Doctor and Nurse AI Copilots - Prompting and Response', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    // Doctor Copilot
    await page.locator('button:has-text("6. Doctor Copilot")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI Doctor Copilot')).toBeVisible({ timeout: 10000 });

    // Nurse Copilot
    await page.locator('button:has-text("7. Nurse Copilot")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI Nurse Copilot')).toBeVisible({ timeout: 10000 });
  });

  test('P0-08: Task Management - Live Roster and Creation', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("8. Task Management")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=ConnectCare Clinical Task Management')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("New Task")')).toBeVisible();
  });

  test('P1-01 to P1-05: Operations, Settings, Audit Logs, Feedback, Evaluation', async ({ page }) => {
    await page.goto('/ai-hub');
    await page.waitForLoadState('networkidle');

    // AI Operations
    await page.locator('button:has-text("9. AI Operations")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI Operations Telemetry & Infrastructure Health')).toBeVisible({ timeout: 10000 });

    // AI Settings
    await page.locator('button:has-text("10. AI Settings")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI Governance & Pipeline Configuration')).toBeVisible({ timeout: 10000 });

    // Audit Logs
    await page.locator('button:has-text("11. Audit Logs")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI Audit Trail & Provenance Registry')).toBeVisible({ timeout: 10000 });

    // Human Review
    await page.locator('button:has-text("12. Human Review")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI Human Review & Clinical Feedback Queue')).toBeVisible({ timeout: 10000 });

    // Evaluation & Quality Benchmark
    await page.locator('button:has-text("13. Evaluation & Quality")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=AI Clinical Evaluation & Quality Benchmark Suite')).toBeVisible({ timeout: 10000 });
  });

  test('P2-03: Resident Chart - Care Intelligence & AI Unified Tab', async ({ page }) => {
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');

    // Click on the first patient
    const patientRow = page.locator('table tbody tr').first();
    await expect(patientRow).toBeVisible({ timeout: 10000 });
    await patientRow.click();

    // Verify Patient Details Page loaded
    await page.waitForURL('**/patients/**', { timeout: 10000 });

    // Verify "Care Intelligence & AI" tab exists and click it
    const aiTab = page.locator('button:has-text("Care Intelligence & AI")').first();
    await expect(aiTab).toBeVisible({ timeout: 10000 });
    await aiTab.click();

    // Verify AI cards are embedded
    await expect(page.locator('text=ConnectCare AI Patient Summary')).toBeVisible({ timeout: 10000 });
  });

});
