## Context

The current stack serves backend traffic over plain HTTP on internal networking, with no production-grade HTTPS enforcement strategy defined at the edge. This creates security risk for external traffic and ambiguity around where redirect and TLS responsibilities belong. We want a state-of-the-art approach that is secure in production while remaining practical for local development.

## Goals / Non-Goals

**Goals:**
- Enforce HTTPS for all externally reachable application traffic.
- Use permanent, method-preserving redirects for HTTP→HTTPS transitions.
- Minimize operational fragility by centralizing TLS responsibilities at the edge in production.
- Ensure backend behavior remains correct behind proxies (`X-Forwarded-*`, trusted proxy config).
- Improve developer ergonomics for local HTTPS testing.
- Add operational controls for certificate lifecycle risk.

**Non-Goals:**
- Reworking authentication/session architecture.
- Introducing mTLS or client certificate authentication.
- Implementing a custom certificate authority service.
- Replatforming the entire deployment stack.

## Decisions

1. **Production TLS is edge-terminated with Nginx (recommended default)**
   - TLS termination and HTTP→HTTPS redirects are performed by Nginx at the edge.
   - Backend service continues on private-network HTTP behind Nginx.
   - **Why:** Better certificate lifecycle handling, reduced app complexity, easier observability, and proven operational patterns.
   - **Alternative considered:** App-terminated TLS by default. Rejected for production because it increases app/runtime complexity and certificate handling burden.

2. **Redirect policy uses HTTP 308 Permanent Redirect**
   - HTTP requests are redirected to equivalent HTTPS URLs with method/body semantics preserved.
   - **Why:** Safer for APIs and non-GET calls than legacy 301 behavior.
   - **Alternative considered:** 301. Rejected as default due to inconsistent method handling in some clients and intermediaries.

3. **Proxy-aware backend configuration is mandatory**
   - Backend must trust configured proxy hops and honor forwarded protocol/host headers.
   - **Why:** Prevents redirect loops and malformed canonical URL generation behind edge layers.
   - **Alternative considered:** Ignore forwarded headers. Rejected because it breaks correctness in proxied deployments.

4. **HSTS rollout is phased**
   - Enable HSTS after HTTPS routing is verified across domains/subdomains.
   - Initial rollout: conservative `max-age`; then increase toward long-lived values and optional preload readiness.
   - **Why:** Prevents lock-in to broken HTTPS configurations while still moving toward strict transport guarantees.
   - **Alternative considered:** Immediate long-lived preload HSTS. Rejected due to high rollback friction if misconfigured.

5. **Developer HTTPS ergonomics via local trusted certificates**
   - Provide documented mkcert-based local TLS setup and smoke-check workflow.
   - **Why:** Reduces friction and encourages secure-path testing during development.
   - **Alternative considered:** HTTP-only local development. Rejected as default because it hides transport-layer issues until late stages.

## Risks / Trade-offs

- **[Risk] Certificate expiry at edge causes outage** → **Mitigation:** automated renewal + expiry alerts (e.g., 30/14/7-day thresholds).
- **[Risk] Redirect loops from bad proxy trust settings** → **Mitigation:** explicit trusted-proxy config and integration tests.
- **[Risk] HSTS applied too early can trap users on broken HTTPS** → **Mitigation:** phased rollout and verification gates before long max-age/preload.
- **[Trade-off] Extra infrastructure ownership at edge** → **Mitigation:** standardize proxy config templates and runbook checks.
- **[Trade-off] Local HTTPS setup overhead** → **Mitigation:** single-command setup docs and reusable local cert tooling.

## Migration Plan

1. Configure Nginx at the edge for TLS termination and 308 HTTP→HTTPS redirects.
2. Add/verify backend trusted-proxy settings and secure URL generation behavior.
3. Deploy and validate HTTPS reachability + redirect correctness with smoke tests.
4. Enable initial HSTS policy after successful verification.
5. Add certificate expiry monitoring and alerting.
6. Increase HSTS max-age once stable; evaluate preload criteria.
7. Rollback: disable redirect/HSTS at edge and revert proxy-aware backend settings if critical issues arise.

## Open Questions

- Nginx is selected as the canonical edge component for production TLS and redirects.
- Should preload-grade HSTS (`includeSubDomains; preload`) be a phase-2 objective or separate change?
