# Design: Industrial User Management

## Architecture Overview

The system will transition to a **Push-Pull Provisioning** model. Admins "push" new user records into the system, and users "pull" their final credentials by completing a mandatory setup phase.

### 1. Data Schema (Prisma)
Update `users` model:
- `is_admin: Boolean (default: false)`
- `must_change_password: Boolean (default: true)`

### 2. Backend Logic
- **`bootstrap-admin.js`**: CLI script.
    - Checks if an admin exists.
    - If not, creates `admin` with a randomly generated 12-char alphanumeric password.
    - Output: `INITIAL_ADMIN_KEY: <password>`
- **`AuthMiddleware`**: Extend to check for `is_admin` for specific routes.
- **Login Flow**:
    - If `must_change_password` is true, return a JWT with limited scope (`scope: 'SETUP_ONLY'`).
- **User Management API**:
    - `GET /api/admin/users`: List all operators (Admin only).
    - `POST /api/admin/users`: Create operator with temp password (Admin only).
    - `PATCH /api/auth/setup-account`: Update own password/username/email (Requires `SETUP_ONLY` or valid token).

### 3. Frontend Layout
- **`AdminGuard`**: Prevents non-admins from hitting `/admin`.
- **`SetupGuard`**: Detects `must_change_password` flag and redirects to `/setup-account`, blocking all other routes until complete.
- **Admin Area (`/admin`)**:
    - Sidebar link (visible only to admins).
    - Table of users with "Add Operator" modal.
- **Account Setup (`/setup-account`)**:
    - Simple form for `Username`, `Email`, `New Password`.
    - Only accessible if user state is `must_change_password`.

## User Interface Visualization

### Admin Operator Table
```
+-------------------------------------------------------------+
| OPERATOR REGISTRY                               [+ ADD NEW] |
+-------------------------------------------------------------+
| USERNAME    | EMAIL              | ROLE    | STATUS         |
+-------------+--------------------+---------+----------------+
| admin_j     | joerg@system.int   | ADMIN   | ACTIVE         |
| operator_1  | op1@system.int     | USER    | PENDING_SETUP  |
+-------------+--------------------+---------+----------------+
```
