# Quickstart Guide: Exploratory Testing Dashboard

This guide will help you set up and run the Exploratory Testing Dashboard locally.

## Prerequisites

- **Node.js**: v18+
- **PostgreSQL**: Running instance
- **Python 3**: (Optional) For the machine-to-backend test script

---

## One-command setup with Docker Compose (recommended)

From the project root:

```bash
docker compose up --build
```

Docker builds consume a root `.npmrc` file as a BuildKit secret. Create one with the credentials/configuration for your npm registry; for public-only dependencies, an empty file is sufficient. Keep registry tokens out of source control.

This starts:
- `db` (PostgreSQL, internal-only network)
- `backend` (Express API, internal-only network)
- `frontend` (Angular app on `http://localhost:4200`, loopback only)

To set a palette for all users, add `ETD_THEME=paper`, `ETD_THEME=warm-parchment`, or `ETD_THEME=slate` to the repository-root `.env` file. Paper is the default. Re-run the same Compose command used to start the stack, adding `-d --force-recreate frontend`, to apply a change. Light/Dark/Auto remains a per-browser preference in the header.

Only the frontend is published to loopback for local development; the backend and database are private to the Compose network.

### HTTPS edge mode (Caddy)

For HTTPS termination and automatic HTTP-to-HTTPS redirects via Caddy:

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml up --build -d
./scripts/smoke-https.sh
```

The default `ETD_DOMAIN=localhost` uses Caddy's local certificate authority. For public deployment, set `ETD_DOMAIN` to a DNS hostname pointing to the host; Caddy will obtain and renew a public certificate automatically. See `docs/https-caddy-runbook.md` for local trust, public TLS, and HSTS guidance.

For a production deployment using prebuilt images:

```bash
export ETD_DOMAIN=dashboard.example.com
export JWT_SECRET=<your-persistent-random-secret>
export ETD_THEME=slate
docker compose -f docker-compose.production.caddy.yml up -d
BASE_HOST="$ETD_DOMAIN" HTTPS_URL="https://$ETD_DOMAIN" ./scripts/smoke-https.sh
```

DNS must point to the Docker host and ports 80/443 must be reachable for public certificate issuance.

The backend runs Prisma migrations on startup. Create the initial admin explicitly so the generated temporary password is printed only by the command you run:

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml exec backend node scripts/bootstrap-admin.js
```

Capture the temporary password from a trusted terminal and deliver it securely; do not redirect it into shared logs.

### Reset admin password in Docker

Verify only frontend is reachable from host:

```bash
./scripts/verify-network-isolation.sh
```

```bash
docker compose -f docker-compose.yml -f docker-compose.caddy.yml exec backend node scripts/reset-admin-password.js
```

This generates a temporary password and forces account setup on the next login. Pass an admin username to reset a specific account.

---

## 1. Backend Setup (manual)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create or update `backend/.env` with your PostgreSQL connection string:
   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/exploratory_testing
   TRUST_PROXY=false
   HSTS_ENABLED=false
   HSTS_MAX_AGE=300
   HSTS_INCLUDE_SUBDOMAINS=false
   HSTS_PRELOAD=false
   ```

4. **Initialize Database**:
   Ensure the database `exploratory_testing` exists, then run migrations:
   ```bash
   npm run migrate
   ```

5. **Bootstrap the initial admin account (first login only)**:

   Public registration is disabled. You must create an admin user from the backend CLI:
   ```bash
   node scripts/bootstrap-admin.js
   ```

   If no admin exists, this prints its generated temporary credential:
   - `USERNAME: admin`
   - `INITIAL PASSWORD: <temporary-password>`

   Store it securely. On first login, you will be forced to set a new password. Bootstrap is no longer run automatically at backend startup.

6. **Start the Server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`.

### Resetting an admin password (local/dev)

If you lose an admin password, run the CLI script from the backend directory:

```bash
node scripts/reset-admin-password.js
```

The script prints a generated temporary password. An optional username argument selects a specific admin. The next login requires `/setup-account`.

---

## 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Angular App**:
   ```bash
   npm start
   ```
   Open `http://localhost:4200` in your browser.

---

## 3. Basic Workflow

1. **Create a Session**: Click "New Session" on the dashboard and provide a Title, Mission, and Charter.
2. **Start Testing**: Click "View Details" on your planned session and hit **Start Session**.
3. **Log Findings**: Use the real-time logging interface to capture notes, findings, and issues.
4. **Capture Artifacts**:
   - **Manual**: Click "Upload Artifact" in the dashboard.
   - **Machine**: Use the provided script from your machine under test.

---

## 4. Machine-to-Backend Artifact Pushing

To push artifacts automatically from a test machine, use the `test_push.py` script:

```bash
# Install requirements
pip install requests

# Usage
# python test_push.py <session_id> <file_path> <type: log|screenshot|measurement>
python test_push.py 1 ./logs/error.log log
```

---

## Troubleshooting

- **API connectivity in Docker**: Frontend calls `/api` and proxies internally to `backend:3000`; do not expose backend port unless needed for debugging.
- **Database Connection**: Verify your `DATABASE_URL` and ensure PostgreSQL is accepting local connections.
- **Invalid admin credentials**: Run `node scripts/reset-admin-password.js` from `backend/` or use the Docker command above.
