## Why

As the number of exploratory testing sessions grows, the dashboard becomes cluttered with historical data from older software versions. Testers need a way to focus their workspace on a specific version while still having access to untagged sessions.

## What Changes

- **Version Persistence**: Save the user's selected version filter in `localStorage` to persist across sessions and refreshes.
- **Version Picker**: Add a dropdown to the session archive that lists all unique software versions currently in the system.
- **Version-Scoped Filtering**: Implement server-side filtering to show only sessions matching the selected version OR sessions with no version specified.
- **Format Enforcement**: Enforce a standardized version format (SemVer-lite) during session creation and metadata updates.

## Capabilities

### New Capabilities
- `version-discovery`: A new capability to retrieve a unique list of all software versions present in the database.

### Modified Capabilities
- `session-management`: Update session creation and update logic to validate the version format.
- `reporting-dashboard`: Update the dashboard to include the persistent version picker and scoped list filtering.

## Impact

- **Frontend**: `SessionListComponent` will integrate the new picker. `ApiService` will include a new discovery method and updated `getSessions` params.
- **Backend**: New route `GET /api/sessions/versions`. Updated `GET /api/sessions` logic to handle `versionFilter` query parameter.
- **Data**: No schema changes required, but a validation regex will be applied to the `software_version` column via API logic.
