# Release Notes

## Unreleased

### Security

- Added Caddy edge HTTPS deployment support with automatic public certificate issuance/renewal and HTTP→HTTPS redirects.
- Added backend proxy-awareness controls (`TRUST_PROXY`) for correct behavior behind edge termination.
- Added configurable HSTS support and phased rollout guidance at the Caddy edge.
- Changed initial admin creation to an explicit CLI operation and added generated temporary-password resets that require account setup on next login.

### Operations

- Added HTTPS smoke checks via `scripts/smoke-https.sh`.
- Added `docs/https-caddy-runbook.md` with public/local TLS setup, HSTS rollout, and admin password operations.

### Developer Experience

- Added local HTTPS guidance using Caddy's local certificate authority.
