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

This starts:
- `db` (PostgreSQL, database `exploratory_testing`)
- `backend` (Express API on `http://localhost:3000`)
- `frontend` (Angular app on `http://localhost:4200`)

The backend automatically:
1. Runs Prisma migrations
2. Bootstraps an initial admin user if none exists

To get the initial admin password, check backend logs:

```bash
docker compose logs backend
```

Look for:
- `USERNAME: admin`
- `INITIAL PASSWORD: <generated-password>`

### Reset admin password in Docker (local/dev)

```bash
docker compose exec backend node <<'NODE'
const db = require('./db');
const { hashPassword } = require('./services/auth.service');

(async () => {
  const username = 'admin';
  const email = 'admin@system.internal';
  const password = 'AdminTemp123!'; // change before running
  const password_hash = await hashPassword(password);

  const existing = await db.query('SELECT id FROM users WHERE is_admin = true ORDER BY id ASC LIMIT 1');
  if (!existing.rows.length) throw new Error('No admin user found. Restart backend to run bootstrap.');

  await db.query(
    'UPDATE users SET username = $1, email = $2, password_hash = $3, must_change_password = true WHERE id = $4',
    [username, email, password_hash, existing.rows[0].id]
  );

  console.log('Admin password reset complete.');
  console.log(`username: ${username}`);
  console.log(`password: ${password}`);
  await db.pool.end();
})();
NODE
```

> The next login will require `/setup-account` (`must_change_password = true`).

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

   If no admin exists, this prints credentials like:
   - `USERNAME: admin`
   - `INITIAL PASSWORD: <generated-password>`

   Save this password. On first login, you will be forced to set a new password.

6. **Start the Server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`.

### Resetting the initial admin password (local/dev)

If you lose the bootstrap password in local development, you can reset an existing admin user:

```bash
node <<'NODE'
const db = require('./db');
const { hashPassword } = require('./services/auth.service');

(async () => {
  const username = 'admin';
  const email = 'admin@system.internal';
  const password = 'AdminTemp123!'; // change this before running
  const password_hash = await hashPassword(password);

  const existing = await db.query('SELECT id FROM users WHERE is_admin = true ORDER BY id ASC LIMIT 1');
  if (!existing.rows.length) throw new Error('No admin user found. Run node scripts/bootstrap-admin.js first.');

  await db.query(
    'UPDATE users SET username = $1, email = $2, password_hash = $3, must_change_password = true WHERE id = $4',
    [username, email, password_hash, existing.rows[0].id]
  );

  console.log('Admin password reset complete. Login with:');
  console.log(`username: ${username}`);
  console.log(`password: ${password}`);
  await db.pool.end();
})();
NODE
```

> This forces the admin through `/setup-account` on next login (`must_change_password = true`).

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

- **CORS Errors**: Ensure the backend `PORT` matches the `apiUrl` in `frontend/src/app/services/api.ts`.
- **Database Connection**: Verify your `DATABASE_URL` and ensure PostgreSQL is accepting local connections.
- **Invalid admin credentials**: Re-run `node scripts/bootstrap-admin.js` (if no admin exists) or use the reset snippet above for local/dev.
