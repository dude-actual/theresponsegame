# Current state — 2.0.0 evaluation

## What this release is
A complete **fictional, single-device requirement-to-retest rehearsal**, entered at `#/pilot`. It is not an authenticated customer platform. It is separate from the two legacy demonstration workspaces and their optional loopback SQLite server.

The working chain creates a campaign and eligible participant assignment, launches it from the participant inbox, captures produced work, records an evaluator's criterion decisions and finding, assigns an improvement with an owner/due date/separate verifier, records owner evidence, creates a linked transfer retest, and records a verification only after the retest is reviewed. Exports contain every source/configuration/rubric snapshot, event and relationship.

Four initial experiences plus two transfer conditions are authored. The 96 legacy entries remain six shared-pattern starter configurations, not 96 independently authored experiences. All content still needs practitioner review.

## Storage and boundaries
The pilot uses same-device IndexedDB transactions with an event store and an aggregate projection. Permission controls are **rehearsal personas**, not authentication. A person with device/developer-tool access can tamper with storage. No sensitive data is appropriate here. If IndexedDB is unavailable, the screen explicitly identifies volatile storage. Corrupt history is preserved for recovery; no silent replacement is allowed.

The old demonstration is retained for comparison. Its verification shortcut is disabled, new runs freeze content at launch, CSV imports require fictional contact addresses, and terminal records cannot be replaced in its SQLite server.

## Control records
`BACKLOG.json` is the single defect/risk/development register. `ASSUMPTIONS_AND_DECISIONS.md` is the decision log. `RELEASE_EVIDENCE.md` is the evidence index. Earlier v1 QA records are historical; do not substitute them for current results. The v1 Word/workbook artifacts remain unchanged as inspected inputs, not parallel live backlogs.
