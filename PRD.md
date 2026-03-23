# Product Requirements Document: Exploratory Testing Dashboard

## Problem Statement

Testers performing manual exploratory testing often struggle with a lack of structure. Missions and charters are frequently disconnected from the actual testing execution, and real-time findings (notes, bugs, observations) are often captured in external documents or not at all. Furthermore, machine-generated artifacts like logs and screenshots are often scattered and difficult to link back to the specific moment or finding they support, making the debriefing process cumbersome and reporting inconsistent.

## Solution

The **Exploratory Testing Dashboard** provides a centralized, structured system for managing the entire exploratory testing lifecycle based on the Xray guide process (**Mission, Charter, Session, Logs, Debrief**). 

The solution allows testers to:
- Define clear testing goals (Missions and Charters).
- Capture real-time observations (Notes, Findings, Issues) with a simple timeline interface.
- Centralize all binary evidence (logs, screenshots) directly in a PostgreSQL database.
- Automatically extract bulk artifact bundles (ZIP files) for quick processing.
- Explicitly link evidence to specific findings to create a high-integrity testing record.

## User Stories

1. As a tester, I want to create a new testing session with a title, mission, and charter so that I can clearly define the scope and goals of my exploratory testing.
2. As a tester, I want to see a searchable list of all sessions so that I can track overall testing progress and find historical records.
3. As a tester, I want to start a session by specifying the `Machine Name` under test so that I can track which environment is being validated.
4. As a tester, I want to log real-time observations as "Notes", "Findings", or "Issues" during an active session so that I can capture my thoughts without interrupting the flow of testing.
5. As a tester, I want to upload artifacts like log files and screenshots during a session so that I have a durable record of evidence.
6. As a tester, I want to upload a ZIP file and have the system automatically extract and categorize its contents so that I can quickly process large amounts of data from a machine under test.
7. As a tester, I want to link one or more uploaded artifacts to a specific log entry so that my findings are explicitly supported by evidence (e.g., linking a screenshot to an "Issue" log).
8. As a tester, I want to transition a session to the "Debriefing" phase so that I can review my findings and finalize evidence links after the active testing window has closed.
9. As a tester, I want to finalize a session by moving it to the "Completed" status, locking the record for future reference.
10. As a tester, I want to download or view any artifact directly from the session timeline so that I can analyze the data in detail.
11. As an automated script or external machine, I want to push artifacts directly to a session via a REST API so that I can automatically provide execution logs and measurements to the tester.

## Implementation Decisions

- **Frameworks & Stack**: 
    - Frontend: Angular 18+ (using Standalone Components and Signals).
    - Styling: Tailwind CSS for a modern, responsive UI.
    - Backend: Node.js with Express.
    - Database: PostgreSQL for both relational data and binary storage.
- **Session Lifecycle**: The system enforces a strict state machine: `planned` -> `in-progress` -> `debriefing` -> `completed`.
- **Binary Storage**: Artifacts are stored as `BYTEA` blobs in PostgreSQL. This ensures the entire testing record is self-contained and easily portable/backupable without a separate file storage service (S3, etc.).
- **Artifact Extraction**: The backend uses `adm-zip` to recursively extract ZIP files uploaded to the `/api/artifacts` endpoint, automatically identifying file types (Screenshots vs. Logs) based on extensions.
- **Relational Integrity**: A many-to-many relationship is maintained between `logs` and `artifacts` via the `log_artifacts` join table, allowing a single screenshot to support multiple findings or a single finding to reference multiple log files.

## Testing Decisions

- **Behavioral Testing**: Tests should verify that a session cannot be moved to "In-Progress" without a `Machine Name` and that logs cannot be edited once a session is "Completed".
- **Module Isolation**:
    - **Zip Extraction Service**: A deep module on the backend that handles the buffer processing and file-type identification.
    - **Session State Machine**: Logic on the backend that handles valid status transitions and automatic timestamping (`start_time`, `end_time`).
    - **API Integration**: Frontend services should be tested to ensure they handle `Multipart/Form-Data` correctly for artifact uploads.
- **Prior Art**: The repository contains Playwright (`playwright.config.ts`) and E2E examples (`e2e/example.spec.ts`), which should be expanded to cover the full user journey from session creation to completion.

## Out of Scope

- User authentication and role-based access control (RBAC).
- Direct integration with external bug trackers (e.g., Jira, GitHub Issues).
- Advanced image processing (e.g., OCR or image diffing).
- Real-time collaborative editing (multiple testers in one session simultaneously).

## Further Notes

- The system is designed to be "machine-friendly," allowing external test rigs to contribute to a session's artifact pool while a human tester provides the high-level mission and findings.
- The use of `BYTEA` for artifacts is suitable for small-to-medium deployments; for very high-scale usage, a migration to an object store like S3 might be considered in the future.
