## Context

Currently, exploratory testing is often unstructured or documented in disconnected tools (Excel, Notepad, etc.). This design provides a centralized system to manage exploratory testing sessions and automatically capture data and artifacts from the machine being tested, following the Xray guide process (Mission, Charter, Session, Logs, Debrief).

## Goals / Non-Goals

**Goals:**
- Provide a web interface for managing test sessions (planned, in-progress, completed).
- Enable real-time logging of notes and findings.
- Capture and store artifacts (logs, screenshots) from the machine under test directly into the database.
- Centralize all testing session data for reporting and debriefing.

**Non-Goals:**
- Automated test execution (this is for manual exploratory testing).
- Real-time video streaming of the test session.
- Advanced user management and permissions (single-user focus for MVP).

## Decisions

### Backend: Node.js with Express
- **Rationale**: Fast to develop, excellent support for REST APIs and file uploads.

### Frontend: React with Tailwind CSS
- **Rationale**: Modern UI library for a responsive dashboard. Tailwind for rapid styling.

### Database: PostgreSQL
- **Rationale**: Reliable relational database.
- **Schema**:
  - `sessions`: id, title, mission, charter, status, start_time, end_time.
  - `logs`: id, session_id, timestamp, content, category (note, finding, issue).
  - `artifacts`: id, session_id, name, type, data (BYTEA), created_at.

### Artifact Storage: In-Database (BYTEA)
- **Rationale**: The user specifically requested all data and artifacts be stored in the database. PostgreSQL's `BYTEA` column will be used for binary data.
- **Alternative**: S3 or local file system (rejected per user requirement).

### Communication: REST API
- **Rationale**: Simple and effective for frontend-backend communication and machine-to-backend artifact pushing.

## Risks / Trade-offs

- **[Risk] Database Bloat**: Storing large binary artifacts in PostgreSQL can lead to large database sizes and slower backups.
  - **Mitigation**: Implement artifact size limits and compression.
- **[Risk] Performance**: Large binary reads can impact database performance.
  - **Mitigation**: Fetch artifact metadata separately from the binary content.
- **[Risk] Machine-to-Backend Connectivity**: The machine under test must have network access to the dashboard backend.
  - **Mitigation**: Ensure the API is accessible and properly documented for machine integration.
