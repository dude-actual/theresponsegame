# Resource Run v17: validation record

This record distinguishes verified results from checks still to perform. Static checks and automated playthroughs do not establish player engagement, professional suitability, formal accessibility conformance or a measured 10–15 minute first-time session.

## Baseline preservation and audit

- Preserved the original production shell as `v16.html` before replacing `index.html`.
- Historical DOM, consequence and planning contracts now explicitly inspect `v16.html`.
- All three historical contracts passed after the move: 111 document IDs and 80 UI ID references in the DOM contract.
- Historical engine smoke passed across 70 incident/role combinations. That test covers startup and one correct action per combination, not full legacy incidents.
- Isolated audit probes reproduced external-arrival inventory omission, repeated deadline penalties and sidebar prioritization bypass. These are documented baseline defects, not v17 acceptance results.

## Automated release checks

The GitHub Actions workflow runs production and retained historical syntax checks, every `tests/*.mjs` contract and simulation test, and patch-integrity checking. It runs for `main`, `v17-rebuild` and pull requests.

`v17-production-contract.mjs` checks the independent production asset graph, consolidated CSS, zoom allowance, accessibility guardrail selectors, offline asset references and historical-shell retention. Its checks are static only.

Final local run, 2026-09-23: all eight test files passed, as did JavaScript syntax and patch-integrity checks.

- Engine: 392 valid actions across 24 complete trajectories covering both difficulties, both current/containment variants and all four monitoring sources. Checked conservation, deadlines, actual arrival/capability dependencies, consequential reassignment, invalid-action rejection and save/resume equivalence. Representative strong/mixed/damaging effectiveness scores were 89/85/41.
- UI controller (mock DOM): complete action flow, archive recovery, completion reward deduplication, malformed storage, report exports and presentation controls passed.
- Offline worker (simulated network/cache APIs): required-asset installation, failed-install preservation, removal of only old TRG caches, network-first responses, offline resource/navigation fallback and exclusion of cross-origin/POST requests passed. This does not prove a browser service-worker upgrade on the deployed origin.
- Production asset and accessibility contracts passed; these are structural guardrails, not a formal accessibility audit.

## Rendered Edge verification

Tested locally over HTTP on Windows with Microsoft Edge 153.0.4234.48. Inspected actual rendered screens at 1366 x 900 and 1280 x 800, and responsive views at 390 x 844, 375 x 812 and 320 x 700. No browser runtime was downloaded for these tests.

- Completed all three periods through the rendered interface at phone width. The run used Regional HazMat, a boom reserve, reassignment to the marsh, relief/waste forecasting and a containment-first handover. The resulting AAR recorded effectiveness 87, cost $4,250, 13 action/condition records and four supported objectives, with an unresolved constraint retained.
- Confirmed an attempted check-in before arrival produces a useful error and does not commit the action. Other work advanced the clock until actual arrival, after which verified assignment cleared the source-entry hold.
- Verified queue arrow controls, selection of simultaneous work, optional waiting, operational forms, multi-selects, numeric allocation, handover ordering, free-text COP notes, period reviews, map location details, the full traffic log and all three mobile views.
- Reloaded during play and recovered the same period/time. Reopened the completed AAR through the career archive. Save/leave and changed-conditions replay controls worked.
- Downloaded both JSON and printable HTML AAR files using the rendered buttons. Inspected the saved JSON: schema `trg.session-report.v17`, finished state, score/cost, 12 resources, 28 events and the entered COP note matched the run. The HTML download was present and populated.
- Checked keyboard form submission, queue controls, visible focus and Escape dismissal of native dialogs with focus returned to the invoking control. Reduced-motion setting disabled the map animation in computed styles.
- Checked document reflow at 640 and 320 CSS pixels, including active work and the AAR. Fixed a 320-pixel briefing-heading overflow; document scroll width then matched client width. Native browser-zoom key commands did not change the browser's scale through the automation surface, so actual 200% browser zoom remains a manual acceptance check.
- No captured console errors or warnings during the completed run. This is bounded evidence for the tested paths, not a claim that every possible browser condition is covered.

## Required rendered and human evaluation

Before merging/releasing, check actual browser zoom, a deployed-origin service-worker upgrade/offline reload, assistive technology and physical mobile devices. The localhost preview intentionally bypasses service-worker registration. A configured external analytics endpoint was not available; mock-controller checks cover event forwarding, not a live organizational analytics integration.

First-time comprehension, professional answer-pattern exploitation, subjective commercial quality, replay interest and the duration target require observed human evaluation. Source review and automated completion cannot answer those questions.
