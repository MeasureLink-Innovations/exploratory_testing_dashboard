## 1. Backend Enhancements

- [x] 1.1 Update `backend/routes/sessions.js` to support `software_version` in allowed sorting columns
- [x] 1.2 Update default sorting logic in `backend/routes/sessions.js` to use `software_version DESC, created_at DESC`

## 2. Frontend - Metadata Reuse

- [x] 2.1 Add `getSession(id)` method to `ApiService` if not already present
- [x] 2.2 Update `SessionListComponent` to include a search/dropdown for historical sessions in the "Create Session" modal
- [x] 2.3 Implement logic to fetch and pre-fill title, mission, and charter when a template session is selected
- [x] 2.4 Add a "Clear Template" option to the modal to reset the form

## 3. Frontend - Dashboard Refinement

- [x] 3.1 Update the default query parameters for the session list to sort by `software_version`
- [x] 3.2 Add a visual "Latest Version" badge to sessions that match the highest version in the current list
- [x] 3.3 Add a placeholder hint to the version input field to encourage consistent naming (e.g., "v1.0.0")

## 4. Verification

- [x] 4.1 Verify that creating a session from a template correctly populates all fields
- [x] 4.2 Verify that the session list is sorted by version by default
- [x] 4.3 Verify that multiple sessions with the same version are sorted by creation date
