## 1. Backend: Version Discovery and Filtering

- [x] 1.1 Add `GET /api/sessions/versions` endpoint to return a unique list of sorted versions.
- [x] 1.2 Update `GET /api/sessions` to accept a `versionFilter` query parameter.
- [x] 1.3 Implement SQL logic to filter by `versionFilter` OR `software_version IS NULL`.

## 2. Backend: Validation

- [x] 2.1 Add version format validation regex (`^v?\d+\.\d+\.\d+$`) to session creation and update routes.
- [x] 2.2 Return a 400 error if the provided version string is invalid.

## 3. Frontend: API and State

- [x] 3.1 Update `ApiService` to include the `getVersions()` method.
- [x] 3.2 Update `ApiService.getSessions()` to support the `versionFilter` parameter.
- [x] 3.3 Create a version state service or update `SessionListComponent` to manage the selected version in `localStorage`.

## 4. Frontend: UI Components

- [x] 4.1 Implement the version picker dropdown in the `SessionListComponent` header.
- [x] 4.2 Update the session list to refresh when the picker value changes.
- [x] 4.3 Add a validation hint/error to the version input field in the creation/edit modal.

## 5. Verification

- [x] 5.1 Verify that the picker correctly filters sessions by version.
- [x] 5.2 Verify that untagged sessions are always visible regardless of the version filter.
- [x] 5.3 Verify that invalid version strings are rejected by the backend.
- [x] 5.4 Verify that the selected version persists after a page refresh.
