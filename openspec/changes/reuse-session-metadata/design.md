## Context

Currently, testers manually enter metadata for every session. The session dashboard sorts primarily by creation date, which hides the relationship between software versions and testing goals.

## Goals / Non-Goals

**Goals:**
- Enable pre-filling new session metadata from historical sessions.
- Default the dashboard view to prioritize the most recent software versions.
- Maintain existing search and pagination capabilities.

**Non-Goals:**
- Automated session cloning (all reuses require explicit user confirmation/save).
- Version management system (we rely on string-based versioning already in the schema).

## Decisions

### 1. Client-Side Metadata Population
**Decision**: Use frontend-only logic to fetch historical session data and populate the "Create Session" form.
**Rationale**: Avoids redundant backend endpoints. The existing `GET /sessions/:id` provides all necessary metadata (title, mission, charter).
**Alternatives**: A backend `/sessions/:id/duplicate` endpoint was considered but rejected to keep the API surface lean.

### 2. Version-First Default Sorting
**Decision**: Update the backend `GET /sessions` default sort to `software_version DESC, created_at DESC`.
**Rationale**: Ensures sessions with the "highest" (latest) version string appear first. Using `created_at` as a secondary sort handles multiple sessions within the same version.
**Alternatives**: Hardcoding a "Current Version" via configuration was considered but adds operational overhead. Dynamic discovery via sorting is more flexible.

### 3. "Template" Selection UI
**Decision**: Add a "Reuse from..." dropdown in the session creation modal that searches existing sessions by title.
**Rationale**: Provides a familiar search-based workflow for finding templates.

## Risks / Trade-offs

- **[Risk]**: Inconsistent version naming (e.g., `v1.0` vs `1.0`) will break lexicographical sorting. → **Mitigation**: Add a placeholder/hint in the UI to encourage consistent version string formats.
- **[Risk]**: Reusing metadata might lead to outdated charters being blindly copied. → **Mitigation**: Ensure all pre-filled fields remain editable before the session is saved.
