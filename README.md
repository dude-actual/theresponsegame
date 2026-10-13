# The Response Game — controlled fictional pilot

A complete requirement-to-retest rehearsal: **plan requirement → objective → assignment → work → evidence → evaluator finding → corrective action → transfer retest → verification**.

Open the public evaluation at **theresponsegame.com**, then **Run the complete pilot**. This is fictional, single-device browser practice, not an authenticated multi-tenant service. Do not enter confidential plans, real rosters or operational information. No real calls, texts or emails are sent.

## Local execution

```sh
python backend/server.py --port 8765 --db /tmp/trg-fictional.sqlite3
```

Open `http://127.0.0.1:8765/#/pilot`. The pilot uses browser IndexedDB; the loopback SQLite database remains a separate legacy demonstration. Without IndexedDB, volatile mode is explicitly identified. Browser data is not secure organizational tenancy.

## Contents

- `pilot/pack.js`: four authored initial tasks and two transfer conditions, all practitioner-review-required.
- `pilot/domain.js`: versioned command/state/evidence chain, idempotency, revision and rehearsal-role rules.
- `pilot/store.js`: transactional IndexedDB state/events, replay validation and recovery preservation.
- `pilot/ui.js`, `pilot/pilot.css`: connected administrator/participant/evaluator/program-owner journeys.
- `release.json`, `health.json`: Pages build-rendered metadata, not a live service-health claim.
- `docs/CURRENT_STATE.md`: current scope and operating boundary.
- `docs/PILOT_PLAN.md`: administrator/participant/evaluator/owner/verifier guides and go/no-go gates.
- `docs/BACKLOG.json`: the only canonical defect/risk/backlog register.
- `docs/RELEASE_EVIDENCE.md`: verification index and independent acceptance limits.

The 96 legacy starter configurations remain available for reference. They use six shared capability patterns and must not be sold as 96 independently validated exercises. The old action-verification shortcut is disabled.

## Verification

`python scripts/verify.py` runs syntax, legacy engine, pilot domain/regression, SQLite/HTTP/history, mutation, performance and repetition checks. `python scripts/check_source.py` runs a limited source scan. See `docs/TEST_STRATEGY.md` for hosted-browser commands and environment limits. CI retains exact-source reports, screenshots and trace exports. No technical result is a professional readiness certification.

## Release and recovery

The existing branch-based GitHub Pages build processes two small release templates so the public site reports its actual commit and build time. Application assets remain static. Development/test directories are excluded from the site, not deleted from Git. The pre-pilot baseline is `ca51c7379e4d09a6a8d6af6fdd338e753879ae2e`; the pre-rebuild archive branch is retained. Revert the release PR to roll back; never clear browser storage as part of a rollback.
