# Exploratory Testing Dashboard

A web application for running structured exploratory testing sessions with evidence capture.

It follows an Xray-inspired flow (**Mission → Charter → Session → Logs → Debrief**) and keeps session artifacts (screenshots/logs/measurements) tied to findings for auditability.

## What this project provides

- **Session lifecycle management**: planned, in-progress, debriefing, completed
- **Real-time logging**: notes, findings, issues with author attribution
- **Evidence management**: upload files individually or via zip extraction
- **Artifact-to-log linkage**: connect files to specific observations
- **Search and filtering**: find sessions by title, machine, and version
- **Machine integration API**: push logs and artifacts from external systems

## Documentation map

- **Quick setup**: this README + [QUICKSTART.md](./QUICKSTART.md)
- **System architecture + use cases**: [docs/architecture.md](./docs/architecture.md)
- **Machine push endpoints**: [docs/API.md](./docs/API.md)
- **Product context**: [PRD.md](./PRD.md)

## Screenshots

### Session archive
![Session archive showing searchable and filterable test sessions](docs/assets/screenshots/session-archive.png)

### Session detail timeline
![Session detail page with mission context, live timeline, and authored logs](docs/assets/screenshots/session-detail-timeline.png)

### Artifact toolbelt
![Artifact panel used to upload, filter, preview, and link evidence to logs](docs/assets/screenshots/artifact-toolbelt.png)

## Prerequisites

- **Node.js**: v18+
- **npm**: recent version compatible with Node 18+
- **PostgreSQL**: local instance (manual setup path)
- **Docker + Docker Compose** (optional but recommended for first run)
- **Python 3 + requests** (optional, for `test_push.py` integration script)

## Installation and setup

### Option A — Docker Compose (recommended)

From project root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

To inspect generated bootstrap admin credentials:

```bash
docker compose logs backend
```

### Option B — Manual local setup

#### 1) Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/exploratory_testing
JWT_SECRET=replace-with-a-local-secret
```

Run migrations and start API:

```bash
npm run migrate
npm run dev
```

Optional one-time admin bootstrap:

```bash
node scripts/bootstrap-admin.js
```

#### 2) Frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Day-to-day development workflow

From repository root unless noted.

| Goal | Command |
|---|---|
| Run Playwright tests | `npm test` |
| Run backend (dev) | `cd backend && npm run dev` |
| Run backend (prod-like) | `cd backend && npm start` |
| Run backend migrations | `cd backend && npm run migrate` |
| Run frontend | `cd frontend && npm start` |
| Build frontend | `cd frontend && npm run build` |
| Watch frontend build | `cd frontend && npm run watch` |
| Start full stack in containers | `docker compose up --build` |

### Troubleshooting

- **Frontend can’t reach API**: verify backend is running on `:3000` and `frontend/src/app/services/api.ts` uses the expected base URL.
- **Database errors during backend startup**: verify `DATABASE_URL` and ensure `exploratory_testing` DB exists.
- **Login issues for first admin**: run `node scripts/bootstrap-admin.js` (manual) or inspect backend container logs (Docker).
- **No test scripts for backend package**: this is expected currently (`backend/package.json` has placeholder test script).

## Core use cases

Detailed flow mapping lives in [docs/architecture.md](./docs/architecture.md#use-cases).

- Create and execute a time-boxed exploratory session
- Debrief with linked evidence and summary
- Push machine-generated artifacts/logs into active sessions
- Review attribution for session and log authors in dashboard views

## Contributing

1. Create a branch from `main`.
2. Keep changes scoped and include rationale in PR description.
3. If you change user-visible behavior, update docs and screenshots in the same PR.
4. Validate commands in README/architecture docs before requesting review.

Recommended PR checklist:

- [ ] Commands in docs were executed or validated against scripts/tooling
- [ ] Related use-case section is updated
- [ ] Screenshot references are valid and include alt text
- [ ] No broken local markdown links
