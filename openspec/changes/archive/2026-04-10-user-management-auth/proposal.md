## Why

The current Exploratory Testing Dashboard lacks user management, meaning all sessions are public and unattributed. To meet industrial standards for accountability and security, the system must allow testers to authenticate, manage their profiles, and have their testing activities (sessions and logs) correctly attributed to them. This change introduces a robust user management layer based on the patterns found in the MeasureLink multi-user platform.

## What Changes

- **User Authentication**: Implement registration, login, and secure session management (using JWT or session cookies).
- **User Management**: Add administrative and user-level profile management.
- **Data Attribution**: Link testing sessions and execution logs to the authenticated user who created them.
- **Protected UI**: Introduce a login screen and ensure dashboard access is restricted to authenticated users.
- **Backend Security**: Secure all API endpoints to require valid authentication.

## Capabilities

### New Capabilities
- `user-authentication`: Handles identity verification, token issuance, and credential storage.
- `user-management`: Manages user profiles, roles (if applicable), and account lifecycle.

### Modified Capabilities
- `session-management`: Update session requirements to include mandatory user attribution (author tracking).
- `reporting-dashboard`: Update visibility requirements to support user-specific views or filtered manifests.

## Impact

- **Database**: New `User` table and foreign key relationships in `Session` and `Log` tables.
- **Backend API**: New `/api/auth` and `/api/users` routes; middleware updates for all existing routes.
- **Frontend**: New login/register components; auth guard for routing; HTTP interceptor for auth headers.
- **Dependencies**: Addition of Prisma ORM (to match reference pattern) and authentication libraries (e.g., bcrypt, jsonwebtoken).
