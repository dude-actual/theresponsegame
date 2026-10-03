# Resource Run v17: validation record

This record distinguishes verified results from checks still to perform. Static checks and automated playthroughs do not establish player engagement, professional suitability, formal accessibility conformance or a measured 10–15 minute first-time session.

## Checkpoint retry review repair — 2026-10-03

Review of PR #4 at `f5c7112c04532fac270104bfeb658d91832efc25` confirmed the reported P2 defect: an unfinished run retried its checkpoint but omitted a transiently failed career/settings write. The controller now tracks failed writes per store and retries dirty career/archive values as well as the checkpoint. Successful writes clear their dirty/error markers; malformed, denied-read and externally changed data retain the existing write guards.

Local verification: **11/11 test files; 11/11 production/historical syntax checks; 12/12 test-source syntax checks; full integration-base-to-head whitespace check passed.** Checkpoint coverage now totals **66 cases and 55 exact reload comparisons**. Six added cases exercise denied/quota career-setting writes at home and during an unfinished run, an archive write pending after a new response starts, and failed retries/external career edits. They assert no incident-state mutation, no engine calls, warning clearance only on successful saves, persisted reduced motion after reload, protected external raw values and no duplicate report/reward. The earlier 2026-09-30 rendered-browser evidence remains bounded historical evidence; the repair's storage-failure injection uses the controller/storage harness. Exact repaired publication head, tree and CI are recorded on PR #4 after publication. Item 04 remains pending Item 03 integration; Milestone A remains incomplete.

## Scene checkpoint persistence — 2026-09-30

PR #3 pre-merge verification retained authorized head `8b2f186c637c136017c1309904b074c535cfaf5c`, successful exact-head QA run 36628515117, the same four files/four commits, no review findings or unresolved conversations, and tree `c157d854f2a18380b8c99b092a917cde4739f0d8`. The authorized merge produced `ff22897a6bc9f1a86fc3ce262a8b2c850499d4b5`, fetched and verified as the integration head with that tested tree. PR #1 remains open/unmerged. No deployment was performed.

Item 03 branched from that merge as `feat/checkpoint-resume`. [PR #4](https://github.com/dude-actual/theresponsegame/pull/4) targets `v17-rebuild` and remains open for separate exact-head integration review.

### Storage and ownership

`trg-v17-session` now contains `{schema: 'trg.checkpoint', version: 1, state, runtime, meta}`. `state` is the validated authoritative engine state. `runtime` holds scene/resume scene, selected task, input focus, view, at most one draft, one event-index/session-ID result reference and acknowledgment, and optional archive ID. Result text resolves from the authoritative event; the envelope has no parallel consequence ledger. `meta` holds the known migration origin, ready recovery marker, save timestamp and existing analytics forwarding cursor. Read classifications distinguish absent/current/legacy unfinished/legacy completed/malformed/unsupported/denied; write failures and cross-tab conflicts remain visible in the controller. No engine truth changes merely to save or resume.

The only legacy migrations are bare schema-17 engine state and `{state, selected}`. Conservative runtime defaults do not infer unsaved drafts or replay history. Existing `trg-v17-reports` records retain their report schema and remain separate from the active checkpoint; `trg-v17-career` retains reward deduplication. Viewing an archive preserves the different active response and draft. Replay requires explicit replacement and uses the displayed report's context. Unreadable/malformed archive data stays stored; valid entries remain readable.

### Local verification

- **11/11 top-level test files passed; 11/11 production/historical JavaScript syntax checks and 12/12 test-source syntax checks passed.** The complete integration-base-to-head whitespace check passed. Review covered the full changed controller and tests; no duplicate replacement paragraphs or parallel runtime were introduced.
- **60 checkpoint cases; 54 exact controller reload comparisons.** Each reload comparison asserts complete engine-state equality, complete runtime-context equality and zero engine calls. Fifteen state fixtures run through each of the two legacy save shapes: unfinished, pending/arrived monitoring, received but unassigned, correction available, completed check-in/status/relief corrections, replacement ordered/arrived/received, channel order/restored coverage, late support orders and completed mission.
- All six current runtime boundaries are covered: orientation, play, period review, period briefing, final AAR and archived AAR. Draft checks cover sourcing, allocation, multiselect, free text, handover order and input focus; draft edits and restoration preserve all time/cost/resources/orders/accountability/evidence/history/events. A valid submit calls the engine once; a rejected submit preserves both engine truth and editable values. Pending results restore; acknowledgment adds no action/history/event/report/reward and remains acknowledged after reload.
- Invalid JSON, invalid object/engine/runtime/metadata, unsupported version and missing version-1 fields preserve original raw bytes. Tests cover exact raw export, explicit replacement, cancellation, denied reads/writes, quota failure, failed migration writes, retry, changed-tab protection and readable archives during active-save failure. Failed writes do not retain a successful-save status. Career/archive partial-write retries and immediate-close reloads remain deduplicated.
- Item 01 and Item 02 regression suites pass. Item 02 retains **22 cases, 422 accepted helper commands (383 primary/39 restored), 170 valid-state and 8 malformed-state atomic rejections, 40 restores and 37 paired comparisons**, plus its separate two-accepted/one-rejected transaction probe. Existing engine coverage retains **392 accepted actions, 24 complete trajectories and scores 89/85/41**; historical smoke retains **70 incident/role combinations**. Report JSON/HTML exports, completion recovery, offline-worker and production contracts pass.
- Rendered local **Codex in-app browser** checks used an isolated `localhost:8767` origin. Confirmed orientation reload; checkbox draft reload at 07:00; committed result at 07:06; acknowledgment remaining dismissed; Regional sourcing draft at 07:10; one committed $1,850 order at 07:16 with ETA 08:05 after reload; closing/reopening a tab restored allocation 4/1 and focus on Channel sections at unchanged 07:16/cost. The restored form and incident view were visually inspected; no browser console errors were reported. This is bounded browser evidence, not a full Edge/mobile/accessibility acceptance pass.

### GitHub evidence and limits

Verified published code head **`8fe29bfe89babba619d57403387d530e437aad13`**, tree **`97c7c1c0e3d6b69d05de350f8a1f5e77a3eef980`**, exactly matched the locally tested tree. [GitHub QA run 36776166039](https://github.com/dude-actual/theresponsegame/actions/runs/36776166039) completed **successfully for that exact head**. This documentation commit follows that code head; final documentation-inclusive head/tree and its separate CI verification are recorded in PR #4, rather than claiming that an earlier run tested a later commit. CI still checks whitespace on its checkout; the actual base-to-head range is checked locally.

Persistence is browser-local and storage remains fallible: unsaved work cannot survive closing the tab after a denied write unless exported first. Raw export is provided; an import/repair UI is not included. Separate career/archive keys are not transactional: if a report persists but its career write fails and the tab closes immediately, the existing conservative report guard prevents another reward, which can leave the reward uncredited. This behavior is explicitly tested and no new reward schema was introduced. Cross-tab changes are detected before writes and require a discard/load choice; this is not a multi-tab collaboration protocol. Recovery dialogs, optional help and scroll position are not saved scenes; the underlying operational boundary, input focus and draft are. Storage failure injection uses the DOM/storage harness, not real-browser permission manipulation. New focused scenes, routine team automation, the approved emotional presentation, full platform/device acceptance and production deployment remain unfinished. Item 04 is the next implementation blocker after Item 03 review; Milestone A and the original weighted estimate are not marked complete or recalculated.

## Bounded operational recovery — 2026-09-29

Foundation PR #2 was reviewed and tested at `4291a6e963d9aa7c08df0a7b14f5a8ea81833145`. All nine then-existing test files passed, no posted review findings remained, and GitHub QA run 36612155501 succeeded at that exact head. The expected-head merge produced `6b38eadbdc1bf9efe48dd16259617f6e6b31b009`, verified on `v17-rebuild`.

Item 02 was implemented from that merge on `feat/operational-recovery`. Local verification:

- **10/10 test files passed; 11/11 JavaScript syntax checks passed.** The complete committed-change whitespace check also passed.
- Refined recovery suite: **22 cases; 422 accepted helper commands (383 primary and 39 restored-copy); 170 valid-state and 8 malformed-state atomic rejections; 40 restore calls and 37 paired action-equivalence comparisons.** The separate transaction probe adds two accepted calls (observed/control) and one rejected repeat. Valid-state helpers now assert fixture validity before checking an action; malformed-state rejection uses a separate helper. Rejections compare the original state's UTF-8 JSON bytes before/after. Semantic state comparisons normalize VM realms and use deep equality, independent of object key order.
- Existing engine regression: **392 accepted actions, 24 complete trajectories**, with unchanged representative strong/mixed/damaging scores **89/85/41**. Historical smoke coverage remains **70 incident/role combinations**. Foundation arrival/recovery, controller persistence/reward deduplication, report exports, worker and production contracts all pass.
- Wrong-vendor replacement covers both difficulties, both existing variants and both qualified vendors. Actual arrival alone does not clear the source hold; verified reception and authorized assignment are required. The incompatible asset, original sourcing choice/order/cost and elapsed delay remain. Advanced regional replacement retains its quoted ETA and the 12-minute revised delay.
- Channel recovery covers both qualified vendors, distinct order/resource identity and actual reception. Equal-duration work after assignment verifies that restored monitoring improves simulated recovery. Original source monitoring stays assigned.
- Bad status, unverified/misplaced/reserve relief, omitted support and late en-route relief have bounded legal paths. Old completed task records remain unchanged. Late relief preserves the duty-limit event; SK-02 stays incapable. Repeats, invalid inputs, identity/reference corruption and every recovery command after completion reject without mutation.
- Schema-17 histories without recovery metadata still restore. Restoring detaches the state and does not replay decisions. Tests compare commands before arrival, orders and completed corrections across restore, and preserve report history/cost.

### Exact-head forensic review

The raw GitHub files at `93ca98d93b62ca1f5a2a21941dd15cf3e8e0f7da` match the local committed blobs. The complete four-file base-to-head diff was inspected. No duplicated engine implementations or consecutive old/new roadmap paragraphs were present. In that exact engine blob:

- [Line 389](https://github.com/dude-actual/theresponsegame/blob/93ca98d93b62ca1f5a2a21941dd15cf3e8e0f7da/v17-engine.js#L389) declares `earlierCheckin` once using `priorDecision`.
- [Line 399](https://github.com/dude-actual/theresponsegame/blob/93ca98d93b62ca1f5a2a21941dd15cf3e8e0f7da/v17-engine.js#L399) calls `linkCorrection` once; lines 65–66 contain its one history write and one mirrored analytics write.
- [Lines 552–560](https://github.com/dude-actual/theresponsegame/blob/93ca98d93b62ca1f5a2a21941dd15cf3e8e0f7da/v17-engine.js#L552-L560) contain one copy/apply/validate transaction with a catch.
- [Line 603](https://github.com/dude-actual/theresponsegame/blob/93ca98d93b62ca1f5a2a21941dd15cf3e8e0f7da/v17-engine.js#L603) is the sole final export and includes `restoreState`.

The GitHub diff includes both removed (`-`) and added (`+`) lines for these replacements. Combining those lines would reproduce the reported duplicates, but the provenance of the material the reviewer saw is not established. No runtime deduplication was needed. The test refinement directly observes one `apply` entry and one correction-helper entry, exactly eight elapsed minutes and one new history/analytics pair, plus zero additional entries on rejected repeat. All recovery paths also assert one new history link and one mirrored analytics link. This strengthens evidence without changing incident behavior.

### GitHub CI versus local evidence

[GitHub QA run 36617941394](https://github.com/dude-actual/theresponsegame/actions/runs/36617941394) succeeded at the original PR head `93ca98d93b62ca1f5a2a21941dd15cf3e8e0f7da`; this was verified directly during the forensic review. It covers the earlier test version, not these refinements. The refined published head `8b2f186c637c136017c1309904b074c535cfaf5c` subsequently passed GitHub QA run 36628515117 before the authorized PR #3 merge recorded above. CI's current clean-checkout whitespace step does not establish base-to-head patch integrity; that complete range is checked locally here, with the workflow correction still assigned to Item 13.

Limits: this increment changes the engine and tests only, plus these existing evidence/roadmap documents. Recovery commands and physical-limit explanations are not yet wired into player-facing scenes. `recoveryOptions` returns legal command templates for a future controller; verification and Operations approval still need to be obtained in that interaction before submitting a command. `restoreState` does not implement checkpoint envelopes, scene drafts, result acknowledgments or archive migration. No new rendered-browser, assistive-technology or human-engagement claim is made. No production deployment, release-PR merge, additional scenario, metric or parallel state owner is included.

## Player feedback and onboarding revision — 2026-09-28

The first player evaluation found the entry experience unintuitive: it did not explain the platform, Blackwater Reach, the player's role, the objective, the controls or enough of the incident story. "Take the desk" was ambiguous, and task transitions felt abrupt. This is evidence that the original first-time comprehension criterion was not met, despite technical tests passing.

The revision adds a game home, explicit start button, narrative scenario/role briefing, four-area controls introduction, contextual instructions for every work item, visible prerequisites, separate desk-action and arrival deadlines, and state-derived period briefings. Results remain visible until the player continues. Relevant incident-team replies appear with the action result. Returning to the site opens the game home, with saved work and completed reports accessible there.

Historical validation of the 2026-09-28 revised flow:

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

## Historical automated release checks

The GitHub Actions workflow runs production and retained historical syntax checks, every `tests/*.mjs` contract and simulation test, and patch-integrity checking. It runs for `main`, `v17-rebuild` and pull requests.

`v17-production-contract.mjs` checks the independent production asset graph, consolidated CSS, zoom allowance, accessibility guardrail selectors, offline asset references and historical-shell retention. Its checks are static only.

Historical local run, 2026-09-23: all eight then-existing test files passed, as did JavaScript syntax and patch-integrity checks.

- Engine: 392 valid actions across 24 complete trajectories covering both difficulties, both current/containment variants and all four monitoring sources. Checked conservation, deadlines, actual arrival/capability dependencies, consequential reassignment, invalid-action rejection and save/resume equivalence. Representative strong/mixed/damaging effectiveness scores were 89/85/41.
- UI controller (mock DOM): complete action flow, archive recovery, completion reward deduplication, malformed storage, report exports and presentation controls passed.
- Offline worker (simulated network/cache APIs): required-asset installation, failed-install preservation, removal of only old TRG caches, network-first responses, offline resource/navigation fallback and exclusion of cross-origin/POST requests passed. This does not prove a browser service-worker upgrade on the deployed origin.
- Production asset and accessibility contracts passed; these are structural guardrails, not a formal accessibility audit.

## Historical rendered Edge verification

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
