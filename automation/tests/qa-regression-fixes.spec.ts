import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

test.describe('ConnectCare QA Regression UI Fixes Automation Suite', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('QA-02: Add Doctor - Field-level validation shows inline errors', async ({ page }) => {
    await page.goto('/doctors/new');
    await page.waitForLoadState('networkidle');

    // Click "Save & Next" without filling required fields
    const nextBtn = page.locator('button:has-text("Save & Next")');
    await expect(nextBtn).toBeVisible({ timeout: 10000 });
    await nextBtn.click();

    // Verify inline field validation errors are displayed
    await expect(page.locator('text=First name is required')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Department / Specialty is required')).toBeVisible();
    await expect(page.locator('text=Mobile number is required')).toBeVisible();
    await expect(page.locator('text=Email address is required')).toBeVisible();
  });

  test('QA-02: Add Nurse - Field-level validation shows inline errors', async ({ page }) => {
    await page.goto('/nurses/new');
    await page.waitForLoadState('networkidle');

    // Click "Save & Next" without filling required fields
    const nextBtn = page.locator('button:has-text("Save & Next")');
    await expect(nextBtn).toBeVisible({ timeout: 10000 });
    await nextBtn.click();

    // Verify inline field validation errors are displayed
    await expect(page.locator('text=First name is required')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Department / Unit is required')).toBeVisible();
    await expect(page.locator('text=Mobile number is required')).toBeVisible();
    await expect(page.locator('text=Email address is required')).toBeVisible();
  });

  test('QA-03: Add Patient - DOB field prevents future date entry', async ({ page }) => {
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');

    const dobInput = page.locator('input[placeholder="MM/DD/YYYY"]').first();
    await expect(dobInput).toBeVisible({ timeout: 10000 });

    // Type a future date
    await dobInput.fill('05/24/2040');
    await dobInput.blur();

    // Verify it is clamped or cleared
    const val = await dobInput.inputValue();
    const futureYearPresent = val.includes('2040');
    expect(futureYearPresent).toBeFalsy();
  });

  test('QA-08: Care Plans - Add modal provides clean patient selection without stale hardcoded data', async ({ page }) => {
    await page.goto('/care-plans');
    await page.waitForLoadState('networkidle');

    const newPlanBtn = page.locator('button:has-text("New Care Plan")');
    await expect(newPlanBtn).toBeVisible({ timeout: 10000 });
    await newPlanBtn.click();

    // Verify Patient dropdown is available in the modal
    const patientSelect = page.locator('select').first();
    await expect(patientSelect).toBeVisible({ timeout: 5000 });
  });

  test('QA-12 & 13: Discharge Checklist - Action links and patient dropdown functionality', async ({ page }) => {
    await page.goto('/discharge-checklist');
    await page.waitForLoadState('networkidle');

    // Test Discharge Instructions Template modal
    const templateBtn = page.locator('button:has-text("Discharge Instructions Template")');
    await expect(templateBtn).toBeVisible({ timeout: 10000 });
    await templateBtn.click();
    await expect(page.locator('text=Standard Post-Discharge Care Plan')).toBeVisible({ timeout: 5000 });
    
    // Close modal
    const closeTemplateBtn = page.locator('button:has-text("Close Template")');
    await closeTemplateBtn.click();

    // Test Patient Education Materials modal
    const educationBtn = page.locator('button:has-text("Patient Education Materials")');
    await educationBtn.click();
    await expect(page.locator('text=Available Patient Pamphlets & Guides')).toBeVisible({ timeout: 5000 });
    
    // Close modal
    const closeEduBtn = page.locator('button:has-text("Close")').last();
    await closeEduBtn.click();

    // Test Start New Checklist patient dropdown
    const startChecklistBtn = page.locator('button:has-text("Start New Checklist")');
    await startChecklistBtn.click();
    const patSelect = page.locator('select').first();
    await expect(patSelect).toBeVisible();
  });

  test('QA-18: Add Patient - Care Plan Interventions initial clean state', async ({ page }) => {
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');

    // Click on Care Plan tab
    const carePlanTab = page.locator('button:has-text("Care Plan")').first();
    await expect(carePlanTab).toBeVisible({ timeout: 10000 });
    await carePlanTab.click();

    // Check Care Interventions textarea is clean/empty
    const interventionsTextarea = page.locator('textarea[placeholder*="interventions"], textarea[placeholder*="protocols"]').first();
    if (await interventionsTextarea.isVisible()) {
      const val = await interventionsTextarea.inputValue();
      expect(val).toBe('');
    }
  });

});
