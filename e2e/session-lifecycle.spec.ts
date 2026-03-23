import { test, expect } from '@playwright/test';

test.describe('Exploratory Testing Session Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sessions list page
    await page.goto('http://localhost:4200/');
  });

  test('should complete a full session lifecycle', async ({ page }) => {
    // 1. Create a new session
    await page.click('button:has-text("New Session")');
    await page.fill('input[label="Title"]', 'E2E Test Session');
    await page.fill('textarea[label="Charter (What to test, Scope & Approach)"]', 'Test the exploratory testing dashboard itself.');
    await page.fill('textarea[label="Mission (Specific Goal/Target)"]', 'Verify that the session lifecycle works as expected.');
    await page.fill('input[label="Timebox (Minutes)"]', '30');
    await page.click('button:has-text("Create")');

    // Verify session appears in list
    await expect(page.locator('app-card')).toContainText('E2E Test Session');
    await page.click('button:has-text("View Details")');

    // 2. Start the session
    await expect(page.locator('h2')).toContainText('E2E Test Session');
    await page.click('button:has-text("Start Session")');
    await page.fill('input[label="Machine Name"]', 'E2E-Runner-01');
    await page.click('button:has-text("Start Now")');

    // Verify 'in-progress' status and timer
    await expect(page.locator('dd')).toContainText('in-progress');
    await expect(page.locator('.animate-pulse')).toBeVisible();

    // 3. Log an observation
    await page.fill('textarea[placeholder="What are you seeing?"]', 'Logged a note via E2E test.');
    await page.click('button:has-text("Post Log")');
    await expect(page.locator('ul[role="list"]')).toContainText('Logged a note via E2E test.');

    // 4. Move to Debriefing
    await page.click('button:has-text("End Testing")');
    await expect(page.locator('dd')).toContainText('debriefing');

    // Verify Debriefing Mode toggle is available
    const debriefToggle = page.locator('button:has-text("Debriefing Mode")');
    await expect(debriefToggle).toBeVisible();
    await debriefToggle.click();
    
    // Verify side-by-side layout (e.g. by checking column count if possible, or just that it didn't crash)
    await expect(page.locator('.grid-cols-1.lg\\:grid-cols-2')).toBeVisible();

    // 5. Add Debrief Summary
    await page.fill('textarea[placeholder*="Provide a summary"]', 'The E2E test was successful.');
    await page.click('button:has-text("Save Summary")');

    // 6. Complete the session
    await page.click('button:has-text("Finish Session")');
    await expect(page.locator('dd')).toContainText('completed');

    // 7. Verify Read-Only state
    await expect(page.locator('text=Read-Only')).toBeVisible();
    await expect(page.locator('textarea[placeholder="What are you seeing?"]')).not.toBeVisible();
    await expect(page.locator('button:has-text("Upload Artifacts")')).not.toBeVisible();
  });

  test('should not allow starting a session without a machine name', async ({ page }) => {
    // Navigate to a planned session (assuming one exists or creating one)
    await page.click('button:has-text("New Session")');
    await page.fill('input[label="Title"]', 'Validation Test');
    await page.fill('textarea[label*="Charter"]', 'Test');
    await page.fill('textarea[label*="Mission"]', 'Test');
    await page.click('button:has-text("Create")');
    
    await page.click('button:has-text("View Details")');
    await page.click('button:has-text("Start Session")');
    
    // Attempt to start without machine name
    const startButton = page.locator('button:has-text("Start Now")');
    await expect(startButton).toBeDisabled();
  });
});
