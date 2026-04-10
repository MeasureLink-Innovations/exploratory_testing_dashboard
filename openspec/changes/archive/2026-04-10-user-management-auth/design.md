## Context

The "Exploratory Testing Dashboard" currently uses a simple Express backend with direct `pg` driver access to PostgreSQL. To implement user management, we are introducing Prisma ORM, aligning with the MeasureLink multi-user platform patterns. This provides a type-safe schema and migration path for the new identity layer.

## Goals / Non-Goals

**Goals:**
- Implement a Prisma-based data layer for users.
- Add JWT-based authentication (Register/Login).
- Secure existing API routes using middleware.
- Link testing sessions and logs to users.
- Provide a login interface in Angular.

**Non-Goals:**
- Multi-tenant organization support (single workspace for all users).
- Complex Role-Based Access Control (RBAC) (initially all authenticated users have full access).
- Social login (Google/GitHub).

## Decisions

- **ORM**: Use Prisma. *Rationale*: Requested by user to match multi-user platform pattern; simplifies schema management.
- **Identity Provider**: Custom implementation with JWT and bcrypt. *Rationale*: Minimal external dependencies; complete control over data sovereignty.
- **Token Storage**: `localStorage` on frontend. *Rationale*: Simple integration for SPA; mitigated risk via short-lived tokens and secure API practices.
- **Schema Changes**: 
    - `User`: `id`, `email`, `username`, `passwordHash`, `createdAt`.
    - `Session`: Add `userId` foreign key.
    - `Log`: Add `userId` foreign key.

## Risks / Trade-offs

- **[Risk] Migration complexity** → Mitigation: Use Prisma's introspection to baseline the current database before adding the `User` model.
- **[Trade-off] JWT vs. Sessions** → JWT is stateless and scales better horizontally but requires careful handling of token revocation (mitigated by short TTL).
- **[Trade-off] Manual pg vs. Prisma** → The app will have two ways of accessing the DB during transition. Mitigation: Migrate existing routes to Prisma sequentially.
