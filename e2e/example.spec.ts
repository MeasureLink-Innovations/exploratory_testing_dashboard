import { test, expect } from '@playwright/test';

test('has title - should fail', async ({ page }) => {
  await page.goto('/'); // Navigate to baseURL defined in playwright.config.ts
  await expect(page).toHaveTitle(/NonExistentTitle/); // This should fail
});
