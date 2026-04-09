# Tasks: Admin-Driven User Management

## 1. Data Layer and Migration
- [x] 1.1 Add `is_admin` and `must_change_password` to Prisma schema
- [x] 1.2 Run database migration to apply changes
- [x] 1.3 Create `scripts/bootstrap-admin.js` to initialize the system

## 2. Backend Authentication Refinement
- [x] 2.1 Update `POST /api/auth/login` to check `must_change_password` and return appropriate flags
- [x] 2.2 Remove public `POST /api/auth/register` endpoint
- [x] 2.3 Implement `isAdmin` middleware
- [x] 2.4 Create Admin User Management routes (`GET /api/admin/users`, `POST /api/admin/users`)
- [x] 2.5 Create `PATCH /api/auth/setup-account` endpoint for first-time setup

## 3. Frontend Authentication Layer
- [x] 3.1 Update `AuthService` signals to include `isAdmin` and `mustChangePassword`
- [x] 3.2 Create `AdminGuard` to protect admin routes
- [x] 3.3 Create `SetupGuard` to force redirection to `/setup-account`
- [x] 3.4 Update global header to show "Admin" link for administrators

## 4. UI Implementation
- [x] 4.1 Create `AccountSetupComponent` for first-time user credential updates
- [x] 4.2 Create `AdminDashboardComponent` with operator registry table
- [x] 4.3 Create "Add Operator" modal for admins
- [x] 4.4 Delete `RegisterComponent` and associated routes

## 5. Verification
- [x] 5.1 Run bootstrap script and verify printed credentials
- [x] 5.2 Verify login with bootstrap credentials leads to setup page
- [x] 5.3 Verify setup completion allows access to dashboard
- [x] 5.4 Verify admin can create a new user and that user is forced to change password
