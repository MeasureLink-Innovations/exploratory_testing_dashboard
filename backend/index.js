const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 3000;

function parseTrustProxy(value) {
  if (value === undefined || value === null || value === '') return false;

  const raw = String(value);
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  if (/^\d+$/.test(normalized)) return Number(normalized);

  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return raw;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function buildHstsHeader() {
  const maxAge = Number(process.env.HSTS_MAX_AGE || 300);
  const includeSubdomains = parseBoolean(process.env.HSTS_INCLUDE_SUBDOMAINS, false);
  const preload = parseBoolean(process.env.HSTS_PRELOAD, false);

  const directives = [`max-age=${Number.isFinite(maxAge) ? maxAge : 300}`];
  if (includeSubdomains) directives.push('includeSubDomains');
  if (preload) directives.push('preload');

  return directives.join('; ');
}

const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
const hstsEnabled = parseBoolean(process.env.HSTS_ENABLED, false);
const hstsHeaderValue = buildHstsHeader();

app.set('trust proxy', trustProxy);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  if (!hstsEnabled) return next();

  const forwardedProto = (req.headers['x-forwarded-proto'] || '')
    .toString()
    .split(',')[0]
    .trim()
    .toLowerCase();

  if (req.secure || forwardedProto === 'https') {
    res.setHeader('Strict-Transport-Security', hstsHeaderValue);
  }

  return next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin')); // Admin routes
app.use('/api/versions', require('./routes/versions'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/artifacts', require('./routes/artifacts'));

app.use('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    trustProxy,
    secure: req.secure,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port} (trust proxy: ${JSON.stringify(trustProxy)})`);
});
