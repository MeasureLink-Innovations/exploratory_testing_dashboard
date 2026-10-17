import { test, expect } from '@playwright/test';

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/sessions');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /system login/i })).toBeVisible();
});
