import { test, expect } from '@playwright/test';
import { json, setAuthenticatedUser } from './helpers';

test.describe('Exploratory session e2e', () => {
  test('creates a new session from the archive page', async ({ page }) => {
    await setAuthenticatedUser(page);

    const sessions: any[] = [
      {
        id: 1,
        title: 'Existing Session',
        charter: 'Baseline charter',
        mission: '-',
        status: 'planned',
        software_version: '1.0.0',
        machine_name: '',
        duration_minutes: 60,
        creator_name: 'e2e-user',
        created_at: '2026-01-01T10:00:00.000Z',
      },
    ];

    await page.route('**/api/**', async (route) => {
      const req = route.request();
      const url = new URL(req.url());

      if (url.pathname === '/api/versions' && req.method() === 'GET') {
        return route.fulfill(json([{ id: 1, version: '1.0.0' }]));
      }

      if (url.pathname === '/api/sessions' && req.method() === 'GET') {
        return route.fulfill(
          json({
            sessions,
            pagination: { total: sessions.length, limit: 12, offset: 0 },
          })
        );
      }

      if (url.pathname === '/api/sessions' && req.method() === 'POST') {
        const body = req.postDataJSON() as any;
        sessions.unshift({
          ...body,
          id: 2,
          status: 'planned',
          creator_name: 'e2e-user',
          created_at: '2026-01-02T10:00:00.000Z',
        });
        return route.fulfill(json(sessions[0], 201));
      }

      return route.fulfill(json({ error: 'Unhandled request' }, 404));
    });

    await page.goto('/sessions');

    await expect(page.getByText('Existing Session')).toBeVisible();

    await page.getByRole('button', { name: /new manifest/i }).click();
    await page.getByLabel('Session title').fill('Created from E2E');
    await page.getByLabel('Charter').fill('Validate create session flow.');
    await page.getByLabel('Machine').fill('E2E-BOX');
    await page.getByLabel('Timebox (minutes)').fill('30');
    await page.getByRole('button', { name: /create session/i }).click();

    await expect(page.getByText('Created from E2E')).toBeVisible();
  });

  test('prevents start without machine metadata and locks logging after completion', async ({ page }) => {
    await setAuthenticatedUser(page);

    let session = {
      id: 42,
      title: 'Lifecycle Session',
      charter: 'Validate lifecycle behavior',
      mission: '-',
      status: 'planned',
      software_version: '',
      machine_name: '',
      duration_minutes: 30,
      creator_name: 'e2e-user',
      created_at: '2026-01-01T10:00:00.000Z',
      start_time: null,
      debrief_summary: '',
      logs: [] as any[],
      artifacts: [] as any[],
    };

    let nextLogId = 1;

    await page.route('**/api/**', async (route) => {
      const req = route.request();
      const url = new URL(req.url());

      if (url.pathname === '/api/versions' && req.method() === 'GET') {
        return route.fulfill(json([{ id: 1, version: '1.2.3' }]));
      }

      if (url.pathname === '/api/sessions/42' && req.method() === 'GET') {
        return route.fulfill(json(session));
      }

      if (url.pathname === '/api/sessions/42' && req.method() === 'PUT') {
        const body = req.postDataJSON() as any;
        session = {
          ...session,
          ...body,
          start_time:
            body.status === 'in-progress' && !session.start_time
              ? '2026-01-01T10:00:00.000Z'
              : session.start_time,
        };
        return route.fulfill(json(session));
      }

      if (url.pathname === '/api/logs' && req.method() === 'POST') {
        const body = req.postDataJSON() as any;
        const newLog = {
          id: nextLogId++,
          content: body.content,
          category: body.category,
          author: body.author,
          logger_name: body.author,
          timestamp: '2026-01-01T10:01:00.000Z',
          artifacts: [],
        };
        session.logs = [...session.logs, newLog];
        return route.fulfill(json(newLog, 201));
      }

      return route.fulfill(json({ error: 'Unhandled request' }, 404));
    });

    await page.goto('/sessions/42');

    await page.getByRole('button', { name: /^Start session$/i }).click();
    const confirmStart = page.getByRole('button', { name: /^Start session$/i }).last();
    await expect(confirmStart).toBeDisabled();

    await page.getByLabel('Unit Designation (Machine)').fill('E2E-RUNNER');
    await page.getByLabel('Software Version').selectOption('1.2.3');
    await expect(confirmStart).toBeEnabled();
    await confirmStart.click();

    await expect(page.getByRole('button', { name: /stop logging/i })).toBeVisible();

    await page.getByPlaceholder(/describe what you observed/i).fill('Found an issue during test run.');
    await page.getByRole('button', { name: /add log entry/i }).click();
    await expect(page.getByText('Found an issue during test run.')).toBeVisible();

    await page.getByRole('button', { name: /stop logging/i }).click();
    await page.getByRole('button', { name: /complete session/i }).click();

    await expect(page.getByPlaceholder(/logging is locked/i)).toBeDisabled();
    await expect(page.getByRole('button', { name: /add log entry/i })).toBeDisabled();
  });
});
