## Context

The system stores session data but currently lists all entries together. While sorting by version exists, users cannot exclude historical data to focus on a specific deployment.

## Goals / Non-Goals

**Goals:**
- Implement a persistent version picker on the dashboard.
- Update the backend to support version-specific filtering while always including untagged (NULL version) sessions.
- Enforce a standard version format via API validation.

**Non-Goals:**
- Database-level migrations for existing "dirty" version strings.
- Implementation of a complex version dependency graph.

## Decisions

### 1. New Discovery Endpoint
**Decision**: Add `GET /api/sessions/versions` to the backend.
**Rationale**: Efficiently populates the picker without over-fetching session data.
**Alternatives**: Fetching all unique versions from the main list response was considered but is less performant for large datasets.

### 2. Validation Pattern
**Decision**: Use the regex `^v?\d+\.\d+\.\d+$` in the session creation/update middleware.
**Rationale**: Covers standard `X.Y.Z` and `vX.Y.Z` formats used by MeasureLink teams.
**Alternatives**: Full SemVer validation was considered but seen as too restrictive for internal testing workflows.

### 3. "OR NULL" Filtering Logic
**Decision**: The `versionFilter` param will result in a query like: `WHERE (software_version = $1 OR software_version IS NULL)`.
**Rationale**: Ensures sessions that were created without a version (legacy or intentionally untagged) are never accidentally hidden from the tester.

## Risks / Trade-offs

- **[Risk]**: Legacy data with non-conforming versions will be hidden if any filter is applied. → **Mitigation**: Users can select "All Versions" to see everything, and the UI will warn that legacy data might be hidden in scoped views.
- **[Risk]**: LocalStorage state might become stale if a version is deleted. → **Mitigation**: The frontend will validate the stored version against the list returned by the discovery endpoint on load.
