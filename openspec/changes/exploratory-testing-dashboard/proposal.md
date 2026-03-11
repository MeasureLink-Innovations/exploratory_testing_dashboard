## Why

Testers currently lack a dedicated tool for exploratory testing that follows a structured process (like the Xray guide) while automatically capturing and centralizing data and machine artifacts. A unified dashboard will streamline the exploratory testing process, ensuring that all findings, sessions, and machine data are stored consistently in a database for later review and reporting.

## What Changes

- Introduction of a web-based dashboard for testers to perform exploratory testing sessions.
- Implementation of a backend system for managing test sessions, logs, and findings.
- Database integration to store session data, tester notes, and machine-generated artifacts.
- API for capturing and uploading artifacts from the machine under test.

## Capabilities

### New Capabilities
- `session-management`: Define testing missions and charters, and track session lifecycle (planned, in-progress, completed).
- `execution-logging`: Real-time logging of tester notes, findings, and issues discovered during testing.
- `artifact-storage`: Automated and manual capture of machine-generated artifacts (logs, files, screenshots) into the central database.
- `reporting-dashboard`: A central interface to visualize session progress, findings, and aggregated data.

### Modified Capabilities

## Impact

- **New Database Schema**: Requires tables for sessions, logs, and artifacts.
- **Frontend**: A new Angular SPA for the dashboard.
- **Backend**: New API endpoints for session management and artifact ingestion.
- **Machine Integration**: A mechanism (API/Client) for the machine under test to push artifacts.
