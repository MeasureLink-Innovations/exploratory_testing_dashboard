## Context

The current repository documentation communicates intent but is not precise enough for fast onboarding or confident implementation. Contributors must infer setup details, architecture boundaries, and primary user flows from code and scattered notes. The change introduces a documentation-focused structure that makes key workflows explicit using use-case narratives and visual references (screenshots).

Constraints:
- Keep documentation aligned with actual project behavior and commands.
- Avoid introducing process overhead that prevents updates.
- Ensure screenshots remain maintainable (stable paths, naming, and refresh guidance).

Stakeholders:
- New contributors onboarding to the project
- Maintainers reviewing pull requests
- Product/QA collaborators validating expected workflows

## Goals / Non-Goals

**Goals:**
- Provide a precise README with complete setup and daily development workflow.
- Add architecture documentation that explains module responsibilities and data flow.
- Add use-case sections that map user goals to concrete dashboard flows.
- Add screenshot-backed guidance for key interfaces and paths.
- Establish a repeatable documentation update workflow.

**Non-Goals:**
- Redesigning product UI or changing runtime dashboard behavior.
- Introducing automated screenshot generation in this change.
- Replacing all existing docs pages outside README and architecture scope.

## Decisions

1. **Split documentation by intent (README for onboarding, architecture doc for system understanding).**
   - Rationale: Keeps quick-start tasks short while preserving deeper technical detail in a dedicated location.
   - Alternative considered: Keep all details in README. Rejected because it grows noisy and hard to maintain.

2. **Add explicit use-case sections in both README (high-level) and architecture doc (detailed flow mapping).**
   - Rationale: Use cases bridge user intent and technical implementation, reducing ambiguity for future changes.
   - Alternative considered: Only add feature lists. Rejected because feature lists do not describe outcomes and flow expectations.

3. **Store screenshots in a dedicated docs asset path with deterministic filenames.**
   - Rationale: Stable references prevent broken images and simplify updates during feature evolution.
   - Alternative considered: Inline externally hosted images. Rejected due to link rot and review friction.

4. **Define a documentation quality checklist (accuracy, command validation, alt text, link integrity).**
   - Rationale: Prevents docs drift and ensures screenshots and use cases stay actionable.
   - Alternative considered: Informal reviews only. Rejected as inconsistent and hard to enforce.

## Risks / Trade-offs

- **[Risk] Documentation drift after future UI/flow changes** → Mitigation: Add explicit “update docs/screenshots” task in relevant feature PR checklists.
- **[Risk] Screenshot maintenance burden** → Mitigation: Limit screenshots to high-value flows and standardize capture guidelines.
- **[Risk] Increased review time due to richer docs** → Mitigation: Use a concise template and checklist to keep changes focused.
- **[Trade-off] More structured docs means more upfront authoring effort** → Benefit: Faster onboarding and fewer clarifying conversations later.

## Migration Plan

1. Draft README sections using the new structure and verify each command against the current project scripts.
2. Create/update `docs/architecture.md` with context, component boundaries, and flow diagrams/narratives.
3. Capture and add screenshots for defined key flows under a stable docs asset directory.
4. Add use-case sections and cross-link them between README and architecture docs.
5. Validate links/images and run a documentation review pass before merge.
6. Rollback strategy: if scope becomes too large, ship without optional screenshots first, then add screenshots in a follow-up change while preserving structure.

## Open Questions

- Should architecture diagrams be maintained as Mermaid source in-repo or image exports only?
- What is the minimum set of mandatory screenshots for release readiness?
- Should we enforce docs checks in CI (link checking/image existence) in a follow-up change?
