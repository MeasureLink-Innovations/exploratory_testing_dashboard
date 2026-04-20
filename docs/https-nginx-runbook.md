# HTTPS with Nginx Runbook

This runbook defines how the dashboard is exposed securely over HTTPS using **Nginx as the edge proxy**.

## Ownership and boundaries

- **Nginx (edge)**
  - Terminates TLS
  - Redirects HTTP to HTTPS with **308**
  - Adds HSTS and baseline security headers
- **Backend (Express)**
  - Runs on private HTTP network
  - Trusts forwarded headers from Nginx (`TRUST_PROXY`)
  - Optionally emits HSTS if enabled (kept off when edge handles HSTS)

## Files in this repository

- `docker-compose.nginx.yml` - Compose override adding Nginx edge service
- `deploy/nginx/templates/default.conf.template` - Nginx config template
- `scripts/smoke-https.sh` - HTTPS and redirect smoke checks
- `scripts/check-cert-expiry.sh` - certificate expiry monitor script

## Rollout steps

1. Provide certificate material:
   - `certs/fullchain.pem`
   - `certs/privkey.pem`
2. Start stack with edge:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.nginx.yml up --build
   ```
3. Validate config and redirect behavior:
   ```bash
   ./scripts/smoke-https.sh
   ```
4. Start conservative HSTS:
   - Default `HSTS_HEADER=max-age=300`
5. After stable verification, increase HSTS:
   - Example: `HSTS_HEADER="max-age=31536000; includeSubDomains"`
6. Optional phase-2 preload readiness (only when sure all subdomains are HTTPS-ready):
   - `HSTS_HEADER="max-age=31536000; includeSubDomains; preload"`

## Rollback strategy

1. Set `HSTS_HEADER=max-age=300` (or temporarily disable HSTS at edge if emergency).
2. Revert Nginx template changes and redeploy.
3. If proxy-aware issues appear, set backend `TRUST_PROXY=false` and redeploy.
4. Re-run smoke checks before reopening traffic.

## Environment configuration reference

### Nginx

- `HSTS_HEADER` (compose env)
  - Controls emitted `Strict-Transport-Security` header
  - Suggested progression:
    1. `max-age=300`
    2. `max-age=86400`
    3. `max-age=31536000; includeSubDomains`
    4. (optional) `max-age=31536000; includeSubDomains; preload`

### Backend

- `TRUST_PROXY`
  - `1` when behind one Nginx hop
  - `false` when not behind a proxy
- `HSTS_ENABLED`
  - Keep `false` when Nginx handles HSTS
  - Can be enabled for direct HTTPS deployments
- `HSTS_MAX_AGE` (default `300`)
- `HSTS_INCLUDE_SUBDOMAINS` (`true|false`)
- `HSTS_PRELOAD` (`true|false`)

## Certificate lifecycle and alert thresholds

Run periodic checks (cron/systemd/CI):

```bash
./scripts/check-cert-expiry.sh certs/fullchain.pem
```

Default alert thresholds:
- Warning: <= 30 days
- High: <= 14 days
- Critical: <= 7 days

Example cron (daily at 06:00):

```cron
0 6 * * * cd /path/to/repo && ./scripts/check-cert-expiry.sh certs/fullchain.pem
```

Integrate non-zero exit codes with your alerting system (Slack/email/PagerDuty).

## Local development with mkcert

1. Install mkcert and trust local CA:
   ```bash
   mkcert -install
   ```
2. Create local certificates in repo `certs/`:
   ```bash
   mkdir -p certs
   mkcert -cert-file certs/fullchain.pem -key-file certs/privkey.pem localhost 127.0.0.1 ::1
   ```
3. Start stack with Nginx override:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.nginx.yml up --build
   ```
4. Run smoke checks:
   ```bash
   ./scripts/smoke-https.sh
   ```

## Troubleshooting

- **Redirect loop observed**
  - Verify backend has `TRUST_PROXY=1`
  - Ensure Nginx sets `X-Forwarded-Proto https`
- **TLS startup failure in Nginx**
  - Confirm cert files are mounted and readable
  - Validate cert/key pair with `openssl x509 -in certs/fullchain.pem -noout -text`
- **Browser HTTPS warning locally**
  - Re-run `mkcert -install`
  - Regenerate certs including `localhost` and loopback IPs
