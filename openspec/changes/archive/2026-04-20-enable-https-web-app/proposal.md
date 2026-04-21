## Why

The web application currently allows insecure HTTP transport, which exposes session and API traffic to interception and tampering. We need an HTTPS-by-default posture now to meet modern security expectations and reduce operational risk during production rollout.

## What Changes

- Enforce HTTPS for all external traffic with HTTP→HTTPS redirects.
- Standardize redirect behavior to method-preserving permanent redirects (308).
- Adopt an edge-terminated TLS strategy for production deployments using Nginx as the canonical reverse proxy (Nginx owns certificates and redirects).
- Make backend proxy-aware so it correctly interprets forwarded protocol/host values and avoids redirect loops.
- Add HSTS for strict transport guarantees after HTTPS adoption is verified.
- Provide developer-friendly local HTTPS guidance (mkcert/self-signed workflow) and smoke checks.
- Add operational safeguards for certificate expiry and TLS misconfiguration detection.

## Capabilities

### New Capabilities
- `https-transport-security`: Enforce secure transport with HTTPS-only external access, 308 redirects, proxy-aware behavior, and operational TLS hardening.

### Modified Capabilities
- None.

## Impact

- Nginx edge infrastructure configuration (TLS termination and redirect policy).
- Backend runtime/proxy trust configuration for forwarded headers and secure URL handling.
- Security header behavior (HSTS) and rollout sequencing.
- Dev environment setup/documentation for local HTTPS certificates.
- Monitoring/alerts for certificate health and HTTPS redirect behavior.
