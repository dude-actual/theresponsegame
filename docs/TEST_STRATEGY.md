# Test strategy

## Reproduction
From repository root:

```sh
python scripts/verify.py
python scripts/check_source.py
python -m pip install -r requirements-test.txt
npm ci --ignore-scripts
python -m playwright install --with-deps chromium firefox webkit
python backend/server.py --port 8765 --db /tmp/trg-fictional.sqlite3
# in a second terminal
TRG_BASE_URL=http://127.0.0.1:8765 python tests/test_browser.py
TRG_BASE_URL=http://127.0.0.1:8765 TRG_BROWSER=chromium python tests/pilot/test_browser.py
```

Use Firefox/WebKit by changing `TRG_BROWSER`. The CI workflow tests the **built Pages output**, not only source HTML, and retains source/QA artifacts. Commands, failures, durations, data class and exact commit are in `qa/pilot/commands.json` and browser JSON files.

## Risk layers
Unit/state tests exercise all supported commands, invalid transitions, version/lease conflict, duplicate command keys, stopped/expired/invalidated states, frozen snapshots, evidence ownership, reviewed verification and sequence/replay invariants. Deterministic generated command streams test monotonicity; they are not additional scenarios.

Integration tests use SQLite for the legacy service and real IndexedDB transactions in hosted browsers. Two tabs, refresh, interrupted work, offline inspection and corrupt-cache export are explicitly tested. No provider/SSO/real-tenant tests are claimed because those services are not implemented.

Browser tests perform the complete assignment-to-retest loop and submit all four initial work models. They capture screenshots and exports at mobile/tablet/desktop widths. Axe scans the core pilot preparation surface, alongside named-control and keyboard/reflow checks. This does not establish whole-site WCAG conformance or screen-reader acceptance.

Targeted mutation testing changes eight critical engine guards. The initial transfer-link mutation survived; a specifically wrong same-capability transfer test was added, and the rerun killed it. `mutation-before-strengthening.json` preserves the initial evidence. This is test-quality work, not an independent audit.

Performance measurements cover synthetic 1/10/25 correction loops and their replay/export volumes, with 2-second replay and 2.5-second export budgets in the measured environment. They do not measure cloud concurrency, queues, providers or realistic human workload.

## Environment limits and acceptance
Container navigation to localhost is blocked by managed policy. Local injection tests are labeled volatile/DOM-only. Hosted native-origin tests are the persistence evidence. Failures are not silently retried; correct the cause, preserve the earlier result and rerun on the changed source. Human practitioner, assistive-technology, security and real-participant acceptance remain separate gates. No independent reviewer is fabricated.


## Review regression additions
The aggregate runner includes the content-audit unit tests and deterministic store snapshot tests. Browser regression fixtures deliberately cite the second work product and multiple work products, then amend only the rationale. They exercise real rendered controls instead of assuming reducer tests establish form behavior. Existing legacy histories remain replayable through a pre-fix synthetic fixture. Browser launch or native-origin access failures are reported separately from passed source/domain/HTTP checks.
