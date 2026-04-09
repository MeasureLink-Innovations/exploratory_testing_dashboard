## 1. Backend Setup and Prisma Integration

- [x] 1.1 Install Prisma and authentication dependencies (`prisma`, `@prisma/client`, `bcrypt`, `jsonwebtoken`) in `backend/`
- [x] 1.2 Initialize Prisma and introspect existing PostgreSQL database
- [x] 1.3 Create `backend/prisma/schema.prisma` with `User`, `Session`, and `Log` models
- [x] 1.4 Generate Prisma client and run initial migration to create `User` table and add FKs

## 2. Authentication Logic (Backend)

- [x] 2.1 Implement `AuthService` for password hashing and JWT signing
- [x] 2.2 Create `POST /api/auth/register` endpoint for user onboarding
- [x] 2.3 Create `POST /api/auth/login` endpoint for token issuance
- [x] 2.4 Implement `AuthMiddleware` to verify JWTs and inject user context into requests
- [x] 2.5 Secure all existing `/api/sessions` and `/api/logs` routes with `AuthMiddleware`

## 3. Frontend Authentication Layer (Angular)

- [x] 3.1 Create `AuthService` in frontend to manage registration, login, and token storage
- [x] 3.2 Implement `AuthGuard` to prevent unauthenticated access to the dashboard and session views
- [x] 3.3 Implement `AuthInterceptor` to automatically attach JWT to outgoing HTTP requests
- [x] 3.4 Create `LoginComponent` and `RegisterComponent` with industrial styling

## 4. UI Integration and Attribution

- [x] 4.1 Update `SessionListComponent` to show the creator of each session
- [x] 4.2 Update `SessionDetailComponent` to show authors of individual log entries
- [x] 4.3 Implement a \"Logout\" action in the global header
- [x] 4.4 Verify that sessions and logs are correctly linked to the logged-in user upon creation

## 5. Verification

- [x] 5.1 Verify that unauthorized users are redirected to the login screen
- [x] 5.2 Verify that a new user can register, login, and create a session attributed to them
- [x] 5.3 Verify that Prisma successfully manages the relationship between users and sessions

