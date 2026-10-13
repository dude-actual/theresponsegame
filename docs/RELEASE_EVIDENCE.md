# Release evidence — canonical index

This file indexes reproducible evidence; it is not an independent acceptance certificate. Refer to the exact run/commit in machine-readable results, not a historical total.

## Baseline
Baseline commit: `ca51c7379e4d09a6a8d6af6fdd338e753879ae2e`. `qa/pilot/baseline/tests.json` captures exact commands/environment/durations and reproduces the 5,776 legacy engine assertions, five SQLite tests and eight HTTP tests. The 1,440 combinations are rule-coverage combinations, not authored experiences. Local native browser navigation failed with `ERR_BLOCKED_BY_ADMINISTRATOR`; rendered injection regression passed 40 checks. Those scopes are separate.

## Candidate evidence
Run `python scripts/verify.py` and `python scripts/check_source.py`. The command report and per-command logs retain pass/fail results and timings. Current Node suites include 36 pilot state tests and six regression tests; legacy SQLite/HTTP suites remain separate from four terminal-history/restore tests. Do not add unit-test counts and assertion totals into a single misleading measure.

`qa/pilot/mutation.json` records eight targeted mutations. The initial same-capability transfer-link survivor is retained in `mutation-before-strengthening.json`; a dedicated test corrected the gap. Performance and content-repetition reports are also generated from actual source. Lexical repetition flags still require human adjudication.

`qa/pilot/<browser>-browser.json` records the browser, exact CI commit, environment, passed/failed/skipped/quarantined counts, individual checks and duration. Native hosted results must be used for IndexedDB/reload/concurrency claims. Locally injected results cannot establish those properties. Browser screenshots and the complete fictional trace are retained alongside results. The CI job uploads source and QA artifacts even on failure.

## Visual and independent review boundary
Agent-directed rendered journey and visual inspection cover preparation, task, verification and trace screens at the captured widths. This is not a recorded human usability study, an independent professional scenario review or assistive-technology acceptance. Automated axe coverage is limited to the identified core surface. Real participant learning, reviewer agreement and delayed retention remain unmeasured.

## Deployment verification
Public `release.json` identifies the exact Pages build commit/time and runtime hashes. `DEPLOYMENT_TRUTH.md` explains the mechanism. A source push alone is not deployment evidence. Verify the latest Pages run, fresh public metadata and pilot route after merge. The authoritative final publication SHA is the one returned by the deployed manifest, not this file's last edit.

Recovery: pre-pilot baseline remains available in Git history and the archived pre-rebuild branch. Revert the feature PR without deleting browser storage. Export pilot records first; v1 cannot display the new database but must not erase it.

## Unaccepted gates
Independent practitioner approval, authenticated tenancy/authorization, protected cloud storage, live delivery, comprehensive security assessment, whole-product accessibility acceptance, actual participant usability and learning transfer are not established by these tests. Open work and authority gates are maintained only in `BACKLOG.json`.

## Corrections exposed by hosted verification
Initial import run 38452295462 was rejected because an Actions content token cannot change workflow files. The source import was limited to non-workflow files; workflow changes used the connected repository action and the temporary importer was removed. No permission was expanded.

PR run 38452844102 passed source/engine/database checks but its exact-build assertion caught the Pages action defaulting to the pull-request merge SHA rather than the checked-out source SHA. The action now receives an explicit `build_revision` input matching the checkout. The assertion remains intact; failed artifacts are retained. The generated source archive is excluded from publication. Subsequent exact-source runs, not this correction note, establish whether the fix passed.


## Independent review correction candidate (2026-10-13)
Base: `0126360bc53c1afe613caa17e4801dc438baa78e`. This is a focused reliability/clarity correction, not content approval or production readiness.

- `tests/pilot/test_browser.py` now covers explicit citation selection, multi-reference and rationale-only amendments, earlier source/work context, readable selection labels, all-met review confirmation, action persona continuity, and legacy/pilot boundaries.
- `tests/pilot/test_content_audit.py` reproduces the previous missing-field/false-similarity failure and verifies extraction of real authored text.
- `tests/pilot/test_store.cjs` uses deterministic transaction snapshots to reproduce the load-versus-write race. Its five tests are a fake-IDB reliability seam, not native-browser persistence evidence.
- Domain tests block unresolved original appeals, preserve later-appeal history, and replay the genuine pre-fix synthetic fixture in `tests/pilot/fixtures/legacy-original-appeal.json`. The fixture was produced by the base commit; it is not real participant data.
- The parent review's unmodified public-origin export (three sessions, one verification) was also replayed successfully against the candidate. It remains separate from committed synthetic tests.
- All aggregate commands and the limited source scan passed locally. Chromium process launch was blocked by the execution environment's socket permission restriction, including the approved retry. No local browser pass is claimed. Use the draft PR's exact-commit hosted browser artifacts for native persistence, UI, accessibility and reflow results; any parent-rendered checks have their own scope.

`qa/pilot/review-before/` retains failing-before regression output. Generated current command/browser reports are CI artifacts, not a fabricated independent acceptance certificate.

### Compatibility and rollback
New verification events record the reducer's `original-appeal-v1` policy. Old accepted histories replay without being rewritten; new commands cannot opt into the old policy. Original or retest appeals after verification expose reassessment while the historical verification count remains a count of records.

A pre-correction runtime cannot interpret the new policy-tagged verification events. Export the complete trace/recovery record before reverting code, preserve browser storage, and restore the corrected runtime if the older runtime reports recovery required. Do not clear storage to make a downgrade appear successful. Original-review amendment reassessment remains open in TRG-027.
