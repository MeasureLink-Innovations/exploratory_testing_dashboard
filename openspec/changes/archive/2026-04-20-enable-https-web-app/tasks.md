## 1. Edge TLS and Redirect Baseline

- [x] 1.1 Define and implement Nginx edge TLS termination for production traffic.
- [x] 1.2 Configure HTTP→HTTPS redirects in Nginx using HTTP 308.
- [x] 1.3 Verify Nginx redirect targets preserve host, path, and query across representative routes.

## 2. Backend Proxy Awareness and Safety

- [x] 2.1 Configure backend trusted-proxy behavior for forwarded protocol/host headers.
- [x] 2.2 Ensure backend URL/redirect logic remains correct behind edge termination.
- [x] 2.3 Add safeguards/tests to detect and prevent redirect loops in proxied deployments.

## 3. HSTS Rollout

- [x] 3.1 Add configurable HSTS response header support.
- [x] 3.2 Roll out initial conservative HSTS max-age after HTTPS validation.
- [x] 3.3 Define criteria and plan for increasing max-age and optional preload readiness.

## 4. Operational Hardening

- [x] 4.1 Establish Nginx certificate lifecycle strategy (issuance/renewal ownership at edge).
- [x] 4.2 Add certificate expiry monitoring and alert thresholds.
- [x] 4.3 Add HTTPS/redirect smoke checks to deployment verification.

## 5. Developer Ergonomics for HTTPS

- [x] 5.1 Document mkcert (or equivalent) local certificate setup for trusted local HTTPS.
- [x] 5.2 Add a local smoke-test workflow for HTTPS health and HTTP→HTTPS redirect validation.
- [x] 5.3 Document fallback local behavior and troubleshooting for certificate issues.

## 6. Documentation and Release Communication

- [x] 6.1 Update runbooks with edge TLS ownership, redirect policy, and rollback strategy.
- [x] 6.2 Update environment configuration docs for proxy trust and HSTS settings.
- [x] 6.3 Add release notes describing HTTPS-only external access and redirect/HSTS behavior.
