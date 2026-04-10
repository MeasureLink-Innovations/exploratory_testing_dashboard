## Why

Session version entry is currently error-prone because versions can be typed freely. In industrial/lab workflows, inconsistent version strings reduce traceability and filtering accuracy. We need a controlled version selection flow with clear validation feedback.

## What Changes

- Add a dedicated version management screen where operators can define which test object versions are selectable.
- Replace free-text session version entry with selection from a managed version list.
- Allow authorized users to add/remove selectable versions from the managed list.
- Validate version format when creating or editing selectable versions and show a clear error message for invalid input.
- Keep existing session filtering by version compatible with the managed list approach.

## Capabilities

### New Capabilities
- `version-catalog-management`: Manage the list of selectable test object versions, including create/delete and format validation.

### Modified Capabilities
- `session-management`: Session create/edit flows must select `software_version` from a managed list instead of unrestricted free text.
- `version-discovery`: Version retrieval behavior must include managed selectable versions (not only inferred values from existing sessions).

## Impact

- Frontend: new version management page, route, navigation entry, and form validation messaging; session form input changes from free text to select.
- Backend: endpoints for managed versions and version-format validation handling.
- Database: new table/model for selectable versions or equivalent persistence.
- Existing filters/reporting that depend on version lists must read from updated source.
