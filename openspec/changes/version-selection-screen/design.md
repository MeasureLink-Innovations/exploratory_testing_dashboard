## Context

The dashboard currently treats `software_version` as free text in session flows and derives filter options from historical session data. This causes inconsistent naming (`1.2`, `v1.2.0`, `1.2.0-beta`) and makes filtering and reporting less reliable in regulated industrial/lab environments.

The requested change introduces a controlled version catalog:
- A dedicated screen to manage selectable test object versions
- Session create/edit flows that select from managed versions
- Validation messaging when entered version format is invalid

Constraints:
- Existing session records must remain readable/filterable
- Current Angular + Express + PostgreSQL stack should be reused
- Keep interaction calm and low-friction, consistent with current UI

## Goals / Non-Goals

**Goals:**
- Provide a dedicated UI for managing selectable versions.
- Persist selectable versions in backend storage and expose CRUD-style API for list/create/delete.
- Enforce a canonical version format when adding managed versions.
- Replace session free-text version entry with selection from managed versions.
- Keep version filter and dropdown options aligned with managed versions.

**Non-Goals:**
- Automatic semantic version sorting/parsing beyond normalized lexical ordering.
- Bulk import/export of versions.
- Historical migration that rewrites old session version strings.
- Role-model redesign (reuse current authenticated/admin patterns where needed).

## Decisions

1. **Introduce a dedicated version catalog table**
   - Decision: Add a `test_object_versions` table (`id`, `version`, `created_at`, `created_by`).
   - Rationale: Decouples selectable values from session history and allows explicit governance.
   - Alternative considered: Continue deriving from sessions + local UI allowlist. Rejected because it cannot prevent drift and does not provide centralized management.

2. **Server-side format validation with shared regex**
   - Decision: Validate version strings in backend `POST /api/versions` using a strict pattern (e.g. `^v?\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$`) and return descriptive 400 errors.
   - Rationale: Prevents malformed data regardless of client; keeps API trustworthy.
   - Alternative considered: Client-only validation. Rejected because API clients/scripts could bypass rules.

3. **Dedicated Version Management screen in frontend**
   - Decision: Add `/versions` screen with list + add/remove controls and inline validation/error state.
   - Rationale: Matches user request to both select available versions and control selectable options.
   - Alternative considered: Add version management controls inside session form only. Rejected due to discoverability and increased form complexity.

4. **Session forms use managed selection control**
   - Decision: Replace free-text version input in session create/edit with a select/autocomplete bound to managed versions endpoint.
   - Rationale: Eliminates ad hoc inputs and aligns creation with governed catalog.
   - Alternative considered: Hybrid free-text + suggestions. Rejected because it still permits invalid/unapproved versions.

5. **Version filter source switched to managed list**
   - Decision: Version filter options should come from managed version catalog endpoint; fallback for unknown historical values may appear as non-selectable tags in record view.
   - Rationale: Ensures consistent selectable versions while preserving visibility into legacy data.
   - Alternative considered: Merge managed + historical values in filter. Rejected because it reintroduces ungoverned options.

## Risks / Trade-offs

- **[Risk] Legacy sessions contain versions not in managed list** → Mitigation: preserve display of legacy values in details, but require managed value for new/edited sessions.
- **[Risk] Overly strict regex blocks valid internal versioning schemes** → Mitigation: make pattern configurable in one backend constant and include clear error text.
- **[Trade-off] Slightly more admin overhead** → Mitigation: provide fast add/remove workflow and defaults seeded from existing version data if desired.
- **[Risk] Breaking existing automation that posts free-text versions** → Mitigation: return explicit validation errors and update API docs/quickstart.
