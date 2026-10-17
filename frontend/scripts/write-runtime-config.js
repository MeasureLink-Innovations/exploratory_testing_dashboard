const fs = require('fs');
const path = require('path');

const supportedPalettes = new Set(['paper', 'warm-parchment', 'slate']);
const palette = process.env.ETD_THEME || 'paper';

if (!supportedPalettes.has(palette)) {
  console.error(`Unsupported ETD_THEME "${palette}". Choose one of: ${[...supportedPalettes].join(', ')}.`);
  process.exit(1);
}

const configPath = path.join(__dirname, '..', 'public', 'runtime-config.override.json');
fs.writeFileSync(configPath, `${JSON.stringify({ palette })}\n`, { mode: 0o644 });
