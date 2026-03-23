# Machine Integration API Reference

This document describes how external machines and automated scripts can push data to an active Exploratory Testing Session.

## Base URL
`http://localhost:3000/api`

---

## 1. Upload Artifacts
Upload files (logs, screenshots, measurements) to a session.

- **Endpoint:** `POST /artifacts`
- **Content-Type:** `multipart/form-data`

### Form Data Parameters:
- `session_id` (Integer, Required): The ID of the session.
- `files` (File[], Required): One or more files to upload.
- `type` (String, Optional): The type of artifact. If omitted, the system will auto-detect based on extension (`screenshot`, `log`, `measurement`).

### Response:
Returns an array of created artifact objects.
```json
[
  {
    "id": 12,
    "session_id": 5,
    "name": "crash.log",
    "type": "log",
    "created_at": "2026-03-23T19:00:00Z"
  }
]
```

---

## 2. Push Log Entry
Create a log entry (note, finding, or issue) in the session timeline.

- **Endpoint:** `POST /logs`
- **Content-Type:** `application/json`

### Request Body:
- `session_id` (Integer, Required): The ID of the session.
- `content` (String, Required): The text of the log entry.
- `category` (String, Required): One of `note`, `finding`, `issue`.
- `author` (String, Required): Use `machine` for automated logs.
- `artifact_ids` (Integer[], Optional): Array of artifact IDs to link to this log.

### Response:
Returns the created log object.
```json
{
  "id": 45,
  "session_id": 5,
  "content": "Automated crash detected in module X",
  "category": "issue",
  "author": "machine",
  "artifacts": []
}
```

---

## 3. Bulk Push (Recommended Workflow)
To push a finding with evidence:
1. **Upload Artifacts:** Send the files and capture the `id`s from the response.
2. **Push Log:** Send the log entry including the `artifact_ids` captured in step 1.

---

## Python Integration Example (SDK)
See `test_push.py` in the root directory for a functional example.
