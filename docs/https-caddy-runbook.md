# HTTPS with Caddy

This runbook describes the supported HTTPS edge for the dashboard. Caddy terminates TLS, redirects HTTP to HTTPS, and proxies requests to the Angular frontend and Express API. The backend and frontend ports are bound to loopback for direct local development; public clients should reach the application through Caddy.

## Public deployment

Requirements:

- A DNS hostname pointed at the Docker host
- Inbound TCP ports 80 and 443 (and optionally UDP 443 for HTTP/3) available to Caddy
- A unique, durable Docker volume for Caddy's `/data` and `/config`

Set the hostname in the shell or a root `.env` file:

```bash
export ETD_DOMAIN=dashboard.example.com
```

Start the application and Caddy:

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml up --build -d
```

Caddy obtains and renews a publicly trusted certificate automatically. No certificate files or renewal cron job are needed. The domain must resolve to this host before Caddy can complete ACME validation.

Validate the redirect and application:

```bash
BASE_HOST="$ETD_DOMAIN" HTTPS_URL="https://$ETD_DOMAIN" ./scripts/smoke-https.sh
```

If you configured a non-default HSTS policy, pass the same value as `EXPECTED_HSTS_HEADER`:

```bash
EXPECTED_HSTS_HEADER='max-age=31536000; includeSubDomains' \
  BASE_HOST="$ETD_DOMAIN" HTTPS_URL="https://$ETD_DOMAIN" ./scripts/smoke-https.sh
```

## Local HTTPS development

The default hostname is `localhost`, for which Caddy uses its own local certificate authority:

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml up --build -d
./scripts/smoke-https.sh
```

The browser will initially report the locally generated certificate as untrusted. To trust it on the host, export Caddy's public root certificate:

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml cp \
  caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-local-root.crt
```

Install `caddy-local-root.crt` into the operating system's trusted certificate store, then remove the exported copy when finished. The root certificate is public, but do not export or share the CA private key stored in Caddy's data volume.

For an alternate local hostname, set `ETD_DOMAIN` and map that name to `127.0.0.1` in the local hosts file. Caddy's local CA will issue the certificate for that name.

## HSTS rollout

Caddy sends a conservative HSTS policy by default:

```text
max-age=300
```

After verifying HTTPS in the target environment, increase the value by setting `HSTS_HEADER` when starting Compose:

```bash
HSTS_HEADER='max-age=31536000; includeSubDomains' \
  docker compose -f docker-compose.yml -f docker-compose.caddy.yml up -d
```

Only add `includeSubDomains` or `preload` after confirming every affected hostname is HTTPS-ready. To roll back, set `HSTS_HEADER=max-age=300` and recreate the edge service.

## Admin account setup and recovery

Database migrations run when the backend starts; the backend does not create an admin account automatically. After the first start, explicitly create the initial admin and capture its generated temporary password from the command output:

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml exec backend \
  node scripts/bootstrap-admin.js
```

For manual backend development, run `node scripts/bootstrap-admin.js` from `backend/` after setting up the database. The command is idempotent and prints a password only when it creates an account. Capture it from a trusted terminal and deliver it using an approved secure channel; do not redirect it into shared logs. The initial login requires the admin to finish account setup and choose a new password.

To reset the password for the first admin account:

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml exec backend \
  node scripts/reset-admin-password.js
```

Optionally pass an admin username to reset a specific account. Deliver the generated temporary password securely; the next login will again require account setup.

## Backend proxy settings

- `TRUST_PROXY=1` is enabled by the Caddy Compose override so Express recognizes the HTTPS forwarded by Caddy.
- `HSTS_ENABLED=false` leaves the HSTS policy under Caddy's control.
- `HSTS_HEADER` controls the edge policy and defaults to `max-age=300`.

## Troubleshooting

- **Certificate cannot be issued:** confirm `ETD_DOMAIN` resolves to the host and inbound TCP 80/443 are reachable.
- **Local browser certificate warning:** install Caddy's local CA root certificate as described above. Do not disable TLS verification as a permanent workaround.
- **Redirect loop or insecure API requests:** access the app through Caddy and verify the backend has `TRUST_PROXY=1`. The Angular app uses same-origin `/api` requests behind Caddy.
- **Caddy cannot read its state:** preserve the `caddy_data` volume across container recreation; it contains managed certificates and, for local use, the local CA.
- **Smoke check uses a non-default hostname:** set both `BASE_HOST` and `HTTPS_URL` to that hostname before invoking the script.
