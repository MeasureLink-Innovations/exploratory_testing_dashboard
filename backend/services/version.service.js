const VERSION_REGEX = /^v?\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/;

function isValidVersionFormat(version) {
  if (typeof version !== 'string') return false;
  return VERSION_REGEX.test(version.trim());
}

function normalizeVersion(version) {
  return (version || '').trim();
}

const VERSION_FORMAT_MESSAGE = 'Invalid version format. Expected vX.Y.Z, X.Y.Z, or semantic suffix like v1.2.3-beta';

module.exports = {
  VERSION_REGEX,
  VERSION_FORMAT_MESSAGE,
  isValidVersionFormat,
  normalizeVersion,
};
