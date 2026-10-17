import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const themePalettes = ['paper', 'warm-parchment', 'slate'] as const;

async function loadThemeConfig(): Promise<unknown> {
  const override = await fetch('/runtime-config.override.json', { cache: 'no-store' });
  if (override.status === 404) {
    console.info('No runtime theme override was generated; using the Paper default.');
    return loadDefaultThemeConfig();
  }
  if (!override.ok) {
    throw new Error(`Theme override request failed with status ${override.status}.`);
  }

  const contentType = override.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    console.info('No runtime theme override was generated; using the Paper default.');
    return loadDefaultThemeConfig();
  }
  return override.json();
}

async function loadDefaultThemeConfig(): Promise<unknown> {
  const response = await fetch('/runtime-config.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Default theme configuration request failed with status ${response.status}.`);
  }
  return response.json();
}

async function startApplication() {
  const config = await loadThemeConfig();
  if (
    typeof config !== 'object' ||
    config === null ||
    !('palette' in config) ||
    typeof config.palette !== 'string' ||
    !themePalettes.includes(config.palette as (typeof themePalettes)[number])
  ) {
    throw new Error('Theme configuration contains an unsupported palette.');
  }

  document.documentElement.dataset['theme'] = config.palette;
  await bootstrapApplication(App, appConfig);
}

startApplication().catch((error: unknown) => {
  console.error('Unable to start the dashboard because its theme configuration could not be loaded.', error);
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = 'The dashboard could not load its theme configuration. Check the frontend ETD_THEME setting and restart the client.';
  document.body.replaceChildren(message);
});
