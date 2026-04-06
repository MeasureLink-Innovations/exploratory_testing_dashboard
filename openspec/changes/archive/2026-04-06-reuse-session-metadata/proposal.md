## Why

Testers often perform similar exploratory sessions across different software versions. Currently, they must manually re-enter the mission and charter for each new version, which is repetitive and error-prone. Additionally, the session list lacks effective sorting by software version, making it difficult to identify results for the latest deployment.

## What Changes

- **Metadata Reuse**: Add the ability to create a new session by copying the mission and charter from a previous session.
- **Version-Based Sorting**: Implement sorting in the session list based on software version.
- **Current Version Priority**: Update the dashboard to prioritize/pin sessions associated with the most recent software version.

## Capabilities

### New Capabilities
<!-- None needed as we are extending existing ones -->

### Modified Capabilities
- `session-management`: Add requirements for reusing/cloning metadata from historical sessions.
- `reporting-dashboard`: Add requirements for sorting sessions by version and prioritizing the current version in the overview.

## Impact

- **Frontend**: Session creation UI will need an option to select a "template" session. The session list component will need updated sorting logic and visual indicators for the current version.
- **Backend**: The session list API will need to support version-based sorting. A new endpoint or parameter for session creation from an existing ID may be required.
