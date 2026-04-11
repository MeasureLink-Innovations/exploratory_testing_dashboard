# Architecture Overview

This document explains how the Exploratory Testing Dashboard is structured, how data flows through the system, and how core user use cases map to implementation components.

## Context

The platform supports exploratory testing sessions with structured logging and evidence collection. It serves three primary actor types:

- **Tester/Operator**: creates sessions, logs observations, uploads evidence
- **Admin**: manages users and version catalog
- **Machine/Automation Client**: pushes artifacts/logs via API

## Current documentation baseline (audit findings)

Before this change:

- README was feature-oriented but lacked precise day-to-day command coverage.
- No dedicated architecture document existed for module boundaries and flow mapping.
- Screenshot references and naming conventions were not standardized.
- Reporting dashboard attribution behavior existed in UI but was not documented as a formal use case.

## System components

## 1) Frontend (Angular)

Location: `frontend/src/app`

Primary responsibilities:
- Route guarding and navigation (`app.routes.ts`, guards)
- Session archive/list (`pages/session-list/session-list.ts`)
- Session execution/debrief workspace (`pages/session-detail/session-detail.ts`)
- Authentication and API access (`services/auth.service.ts`, `services/api.ts`)

Notable UX behavior:
- Session list shows `creator_name` for attribution.
- Session detail shows session creator and per-log author (`logger_name` / `author`).
- Artifacts can be linked to log entries and previewed inline.

## 2) Backend API (Express)

Location: `backend/`

Entry point: `backend/index.js`

Mounted route modules:
- `/api/auth` → authentication and account setup
- `/api/admin` → admin-only user/version controls
- `/api/versions` → version catalog for session metadata
- `/api/sessions` → session CRUD + lifecycle transitions
- `/api/logs` → log creation and artifact linkage
- `/api/artifacts` → upload, retrieval, and zip ingestion

Cross-cutting:
- `cors`, `morgan`, JSON body parsing, centralized error handler
- auth/admin middleware for protected endpoints

## 3) Persistence (PostgreSQL)

- Core relational entities: users, sessions, logs, artifacts, versions
- Binary artifacts are stored in database (`BYTEA`), enabling self-contained records
- Migrations handled by backend migration scripts / Prisma deploy path in Docker

## 4) Runtime topology

Containerized local stack (`docker-compose.yml`):
- `db` (PostgreSQL)
- `backend` (Express + migration/bootstrap command)
- `frontend` (Angular dev server)

## Data flow

## Session lifecycle flow

1. Frontend creates a session (`POST /api/sessions`) with title/charter/version/timebox.
2. Session transitions from `planned` to `in-progress` when metadata is confirmed.
3. Logs are written in real time (`POST /api/logs`) with explicit category and author.
4. Artifacts are uploaded (`POST /api/artifacts`) and optionally linked to logs (`POST /api/logs/:id/artifacts`).
5. Session moves through `debriefing` to `completed` with a persisted summary.

## Machine integration flow

1. Automation uploads one or many files to `/api/artifacts`.
2. Automation posts a corresponding log to `/api/logs`.
3. Artifact IDs are associated with the log entry for traceable evidence.

Reference API details: [docs/API.md](./API.md)

## Key design decisions

1. **Artifact evidence in database**
   - Keeps session history self-contained and easier to back up/export consistently.
2. **Separate route modules by capability**
   - Keeps backend maintenance manageable as features evolve.
3. **Frontend state with route-centric pages + services**
   - UI behavior remains explicit and discoverable for contributors.
4. **Explicit author attribution in dashboard views**
   - Preserves accountability across manual and machine-originated logs.

## Use cases

### Use case 1: Create and execute an exploratory session

- **User goal:** run a structured, time-boxed exploratory test.
- **Trigger:** tester clicks “New Session” and starts execution.
- **Expected outcome:** session enters `in-progress`, timeline captures note/finding/issue logs.
- **Related components:**
  - Frontend: `session-list.ts`, `session-detail.ts`
  - Backend: `/api/sessions`, `/api/logs`
  - DB: sessions + logs tables

### Use case 2: Debrief with linked evidence

- **User goal:** summarize findings and support conclusions with artifacts.
- **Trigger:** tester transitions session to `debriefing` and links uploaded evidence.
- **Expected outcome:** debrief summary persisted and logs show linked files.
- **Related components:**
  - Frontend: artifact panel + link modal in `session-detail.ts`
  - Backend: `/api/artifacts`, `/api/logs/:id/artifacts`, session update endpoint
  - DB: artifacts + log-artifact relations

### Use case 3: Push machine-generated artifacts and logs

- **User goal:** ingest automated run outputs directly into a session.
- **Trigger:** external script calls upload/log endpoints.
- **Expected outcome:** artifacts and machine-authored logs appear in timeline with traceability.
- **Related components:**
  - API: [docs/API.md](./API.md)
  - Script: `test_push.py`
  - Backend routes: `/api/artifacts`, `/api/logs`

### Use case 4: Review attribution in reporting dashboard

- **User goal:** understand who created a session and who authored each log.
- **Trigger:** contributor opens session archive or session detail view.
- **Expected outcome:**
  - session list displays creator (`creator_name`)
  - session detail header displays creator
  - each log row displays logger attribution (`logger_name` / `author`)
- **Related components:**
  - Frontend: `session-list.ts`, `session-detail.ts`
  - Backend: session/log query responses with attribution fields

## Screenshots

### Session archive (attribution visible)
![Session archive table with creator attribution and session status columns](./assets/screenshots/session-archive.png)

### Session detail timeline (log author attribution)
![Session detail timeline showing authored log entries and evidence links](./assets/screenshots/session-detail-timeline.png)

### Artifact toolbelt
![Artifact upload and preview panel used to attach evidence to findings](./assets/screenshots/artifact-toolbelt.png)

## Documentation maintenance rules

- Keep screenshot filenames stable and flow-based (see `docs/assets/screenshots/README.md`).
- When a documented UI flow changes, update screenshot + related use-case text in the same PR.
- Validate all commands in docs against actual scripts and service endpoints.
