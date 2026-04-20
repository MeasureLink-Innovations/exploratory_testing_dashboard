import { Page } from '@playwright/test';

export async function setAuthenticatedUser(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('etd_auth_token', 'e2e-token');
    localStorage.setItem(
      'etd_auth_user',
      JSON.stringify({
        id: 1,
        username: 'e2e-user',
        email: 'e2e@example.com',
        is_admin: true,
        must_change_password: false,
      })
    );
  });
}

export function json(body: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  };
}
