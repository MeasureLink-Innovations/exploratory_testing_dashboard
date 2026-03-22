# Exploratory Testing Dashboard

A centralized system for managing exploratory testing sessions, following the Xray guide process (**Mission**, **Charter**, **Session**, **Logs**, **Debrief**). This tool allows testers to structure their manual testing, capture real-time notes, and centralize machine-generated artifacts (logs, screenshots) directly in a PostgreSQL database.

## Key Features

- **Structured Session Management**: Define missions and charters for every test.
- **Enhanced Lifecycle**: 
  - `Planned`: Prepare your test.
  - `In-Progress`: Real-time logging of notes, findings, and issues.
  - `Debriefing`: Review the session, upload logs/screenshots, and link them to specific findings.
  - `Completed`: Finalized record of the testing effort.
- **Artifact Center**: 
  - Support for individual file uploads or **Bulk Zip extraction**.
  - Automatic categorization of artifacts (Screenshots, Logs, Measurements).
  - **Artifact-to-Log Linkage**: Attach specific screenshots or logs to your findings to provide clear evidence.
- **Machine Search**: Quickly find previous test sessions by searching for specific `Machine Name` or `Title`.
- **In-Database Storage**: All binary artifacts are stored as `BYTEA` in PostgreSQL for a completely self-contained data record.

## Tech Stack

- **Frontend**: Angular 18+, Tailwind CSS, Lucide-style icons.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL (Relational data + Binary Large Objects).
- **Processing**: `adm-zip` for server-side Zip extraction.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance

### Installation

1. **Clone the repository**
2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Configure .env with DATABASE_URL=postgres://user:pass@localhost:5432/exploratory_testing
   npm run migrate
   npm start
   ```
3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## Exploratory Workflow

1. **Define**: Create a new session with a title, mission, and charter.
2. **Execute**: Start the session (enter the Machine Name being tested). Log your observations in real-time.
3. **Capture**: Upload log files or screenshots. If you have a bundle, upload a `.zip` and the system will extract individual files for you.
4. **Debrief**: Move to the `Debriefing` phase. Click the **Attach** icon on your log entries to link the relevant uploaded artifacts to your findings.
5. **Finalize**: Move the session to `Completed` once the debrief is finished.

## Machine Integration

Machines under test can push artifacts directly to a session via the REST API:
`POST /api/artifacts` (Multipart Form Data with `session_id`, `type`, and `files`).

---
*Created for structured, evidence-based manual exploratory testing.*
