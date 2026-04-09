# Proposal: Admin-Driven User Management

## Why
The current auth model allows public self-registration, which is unsuitable for an industrial exploratory testing dashboard where access must be strictly controlled and attributed to specific operators. We need a centralized management system where an administrator controls who has access to the platform.

## What Changes
- **Disable Public Registration**: Remove the `/register` route and endpoint.
- **Admin Role**: Introduce an `is_admin` flag to users.
- **Operator Provisioning**: Admins can create new users with an initial password.
- **Forced Setup**: New users (and the bootstrap admin) must update their credentials (password, and optionally username/email for the admin) upon their first login.
- **Bootstrap Protocol**: A CLI script to initialize the first admin user with a generated secure key.
- **Admin Dashboard**: A dedicated interface for user management (list, create, deactivate).

## Risks / Trade-offs
- **[Risk] Lockout**: If the bootstrap admin isn't properly initialized, the system becomes inaccessible. *Mitigation*: The bootstrap script will be idempotent and print credentials clearly.
- **[Trade-off] UX Friction**: Forced password changes add a step to onboarding but ensure security compliance.
