# Resource Run v17: validation record

This record distinguishes verified results from checks still to perform. Static checks and automated playthroughs do not establish player engagement, professional suitability, formal accessibility conformance or a measured 10–15 minute first-time session.

## Bounded operational recovery — 2026-09-29

Foundation PR #2 was reviewed and tested at `4291a6e963d9aa7c08df0a7b14f5a8ea81833145`. All nine then-existing test files passed, no posted review findings remained, and GitHub QA run 36612155501 succeeded at that exact head. The expected-head merge produced `6b38eadbdc1bf9efe48dd16259617f6e6b31b009`, verified on `v17-rebuild`.

Item 02 was implemented from that merge on `feat/operational-recovery`. Local verification:

- **10/10 test files passed; 11/11 JavaScript syntax checks passed.** The complete committed-change whitespace check also passed.
- New recovery suite: **21 cases, 416 accepted commands, 178 atomic rejections, 40 restore comparisons.** Counts include commands performed against restored copies. Rejected commands compare the entire state before/after, including time, cost, resources, orders, history and evidence.
- Existing engine regression: **392 accepted actions, 24 complete trajectories**, with unchanged representative strong/mixed/damaging scores **89/85/41**. Historical smoke coverage remains **70 incident/role combinations**. Foundation arrival/recovery, controller persistence/reward deduplication, report exports, worker and production contracts all pass.
- Wrong-vendor replacement covers both difficulties, both existing variants and both qualified vendors. Actual arrival alone does not clear the source hold; verified reception and authorized assignment are required. The incompatible asset, original sourcing choice/order/cost and elapsed delay remain. Advanced regional replacement retains its quoted ETA and the 12-minute revised delay.
- Channel recovery covers both qualified vendors, distinct order/resource identity and actual reception. Equal-duration work after assignment verifies that restored monitoring improves simulated recovery. Original source monitoring stays assigned.
- Bad status, unverified/misplaced/reserve relief, omitted support and late en-route relief have bounded legal paths. Old completed task records remain unchanged. Late relief preserves the duty-limit event; SK-02 stays incapable. Repeats, invalid inputs, identity/reference corruption and every recovery command after completion reject without mutation.
- Schema-17 histories without recovery metadata still restore. Restoring detaches the state and does not replay decisions. Tests compare commands before arrival, orders and completed corrections across restore, and preserve report history/cost.

Limits: this increment changes the engine and tests only, plus these existing evidence/roadmap documents. Recovery commands and physical-limit explanations are not yet wired into player-facing scenes. `recoveryOptions` returns legal command templates for a future controller; verification and Operations approval still need to be obtained in that interaction before submitting a command. `restoreState` does not implement checkpoint envelopes, scene drafts, result acknowledgments or archive migration. No new rendered-browser, assistive-technology or human-engagement claim is made. No production deployment, release-PR merge, additional scenario, metric or parallel state owner is included.

## Player feedback and onboarding revision — 2026-09-28

The first player evaluation found the entry experience unintuitive: it did not explain the platform, Blackwater Reach, the player's role, the objective, the controls or enough of the incident story. "Take the desk" was ambiguous, and task transitions felt abrupt. This is evidence that the original first-time comprehension criterion was not met, despite technical tests passing.

The revision adds a game home, explicit start button, narrative scenario/role briefing, four-area controls introduction, contextual instructions for every work item, visible prerequisites, separate desk-action and arrival deadlines, and state-derived period briefings. Results remain visible until the player continues. Relevant incident-team replies appear with the action result. Returning to the site opens the game home, with saved work and completed reports accessible there.

Validation of the revised flow:

- All eight automated test files pass. New controller checks verify that reading the briefing/controls does not consume incident time, unfinished prerequisites disable submission, an action result survives resume, in-game help leaves the current form intact, and period briefings describe consequences from the actual state.
- Rendered Edge checks on Windows covered the home and scenario briefing at 1366 x 900 and 320 x 740, and the controls introduction, first-period decisions, results and period transition at 390 x 844. Checked document width against client width; no horizontal overflow in those views.
- Played the complete first period through the UI: clarified RR-041, routed the requests, sourced Harbor Response and allocated four boom sections to the marsh, one to the channel and one to reserve. The second-period briefing retained the $3,200 commitment and channel gap and explained the retained spare's consequence.
- Verified keyboard entry/submission, useful waiting text and disabled sourcing before prerequisites, reload/resume at 07:16, and explicit progression from a result to the next request.
- Opening and dismissing Screen guide preserved edited allocation values (4 and 1), returned focus to its invoking button, and did not consume time.

These checks establish that the revised flow functions. A second player evaluation is still needed to establish whether it is now intuitive and whether the richer story sustains interest. The earlier full-playthrough evidence below applies to the underlying slice; this revision's rendered check covered onboarding through the second-period introduction, with full progression covered by the controller and engine tests.

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
