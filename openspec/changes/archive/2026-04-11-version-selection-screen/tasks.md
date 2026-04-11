## 1. Data Model and Backend API

- [x] 1.1 Add persistence for selectable versions (new table/model with unique `version` and timestamps)
- [x] 1.2 Create migration to apply selectable version schema changes
- [x] 1.3 Implement backend version-format validator utility (shared regex + error message)
- [x] 1.4 Implement `GET /api/versions` to return managed selectable versions in descending order
- [x] 1.5 Implement `POST /api/versions` to add selectable versions with duplicate and format validation
- [x] 1.6 Implement `DELETE /api/versions/:id` (or equivalent) to remove selectable versions safely

## 2. Session Flow Integration

- [x] 2.1 Update session create/update backend validation to reject versions not in managed catalog
- [x] 2.2 Update frontend API service to fetch/select managed versions for session forms and filters
- [x] 2.3 Replace free-text software version input in session UI with selectable control bound to managed versions
- [x] 2.4 Ensure version filter in session list uses managed selectable versions source

## 3. Version Management UI

- [x] 3.1 Add frontend route/page for version management screen
- [x] 3.2 Build selectable version list UI with add/remove actions
- [x] 3.3 Add invalid-version feedback message when entered version format does not match required pattern
- [x] 3.4 Add navigation access to the version management screen for authorized users

## 4. Verification

- [x] 4.1 Verify valid version can be added and appears in session selection and filter dropdowns
- [x] 4.2 Verify invalid version format shows clear validation message and is not saved
- [x] 4.3 Verify session create/update fails when submitting version not in selectable list
- [x] 4.4 Verify existing historical sessions with legacy versions remain viewable without data loss
