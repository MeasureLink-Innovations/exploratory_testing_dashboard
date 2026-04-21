# Release Notes

## Unreleased

### Security

- Added Nginx edge HTTPS deployment support with TLS termination and HTTP→HTTPS redirects using **308 Permanent Redirect**.
- Added backend proxy-awareness controls (`TRUST_PROXY`) for correct behavior behind edge termination.
- Added configurable HSTS support and phased rollout guidance.

### Operations

- Added HTTPS smoke checks via `scripts/smoke-https.sh`.
- Added certificate expiry monitoring script `scripts/check-cert-expiry.sh` with 30/14/7-day thresholds.
- Added `docs/https-nginx-runbook.md` with rollout, rollback, and environment configuration guidance.

### Developer Experience

- Added local mkcert workflow guidance for trusted HTTPS development.
