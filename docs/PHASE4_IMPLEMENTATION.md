# Oil Spill vertical slice — Phase 4 execution plan

3 October 2026. Integration branch: `v17-rebuild`. Original planning baseline: `a96bf31922e89e922ff5c6842bcf9fdaea91442c`. Verified foundation merge: `6b38eadbdc1bf9efe48dd16259617f6e6b31b009`. This is an implementation backlog and release contract, not another design proposal.

**Execution update:** Item 02 / [PR #3](https://github.com/dude-actual/theresponsegame/pull/3) was merged from authorized head `8b2f186c637c136017c1309904b074c535cfaf5c`, after exact-head QA run 36628515117 and the four-file/tree review. Merge commit and verified post-merge `v17-rebuild` head: `ff22897a6bc9f1a86fc3ce262a8b2c850499d4b5`; tree `c157d854f2a18380b8c99b092a917cde4739f0d8`. Item 03 is implemented pending separate integration review in [PR #4](https://github.com/dude-actual/theresponsegame/pull/4), `feat/checkpoint-resume` → `v17-rebuild`. Verified code head: `8fe29bfe89babba619d57403387d530e437aad13`; published/tested code tree: `97c7c1c0e3d6b69d05de350f8a1f5e77a3eef980`. [GitHub QA 36776166039](https://github.com/dude-actual/theresponsegame/actions/runs/36776166039) succeeded for that exact code head. These documentation updates follow it; the PR verification record identifies the final head and its own CI result. Local evidence: 11/11 test files, 11/11 production/historical syntax checks and 12/12 test-source syntax checks; 66 checkpoint cases with 55 exact controller reload comparisons after the 3 October review repair. Failed career/archive writes now retry during unfinished runs; the repaired publication head and CI are recorded on PR #4. See `V17_QA.md` for coverage and limitations. Milestone A is not complete; Items 04 and 05 remain unfinished.

**3 October integration update:** PR #4 was merged with explicit approval from reviewed head `d48b23499e7ed7c1792d762fb1ee3bb87d8d1df1` after successful exact-head QA 37115078369 and zero unresolved threads. Verified integration commit: `26e80667a76675ae6bbb625cfe84ccf083ec7072`. This supersedes the pending Item 03 status above. Item 04 is implemented on `feat/team-actions` for separate review; its final published head and QA are recorded on its PR. Item 05 remains unfinished, so Milestone A remains incomplete.

The Player First Redesign, Emotional Engagement Audit, wireframes and narrative storyboard are approved requirements. Their approval does not mean their runtime implementation exists. Where older approved documents propose unlocks, additional variants, analytics systems or progression, the latest production brief takes precedence: no new scenarios, progression, currencies, badges, achievements or metrics. Use the two existing current/demand variants. Preserve existing reports and historical records.

## Repository health and verified delivery state

**Health: viable simulation foundation; not a release candidate for the approved experience.** One DOM-free engine owns incident truth. One controller owns rendering/storage, and one stylesheet serves production. The approved scene flow, automatic routine work, persistent visual consequences and outcome-first replay are not integrated. The controller and stylesheet require replacement of their old compositions, not additional wrappers.

- PR #1 remains the integration-to-`main` release PR; its integration branch now includes the foundation and Item 02 merges. Its description still primarily describes revision 17.4 and must be rewritten around the finished implementation before release. This increment does not merge it.
- Historical planning-baseline GitHub QA runs 36576960657 and 36576972592 succeeded at `a96bf31922e89e922ff5c6842bcf9fdaea91442c`. Those results do not certify subsequent heads or user comprehension/commercial quality.
- At the original planning baseline, GitHub issues contained only PR #1. PR #2 has since merged. The issue bodies below are implementation contracts, not claims of created implementation tickets.
- Item 03 protects an unfinished checkpoint during archived-report replay and reads the displayed report's difficulty/variant. Outcome-first replay presentation remains in 10. QA still uses a clean-worktree whitespace check; the workflow correction remains in 13, with the complete base-to-head range checked locally for this PR.
- `v17-rebuild` is unprotected. Repository rulesets returned an empty list. Reading `main` protection returned 403, so its protection is **unverified**, not assumed absent.
- The only checked-in workflow is `.github/workflows/qa.yml`; it runs Node 24 syntax, all `tests/*.mjs`, and whitespace checks. No browser job, RC artifact or branch-preview deployment is checked in.
- `CNAME` names `theresponsegame.com`. GitHub's dynamic Pages build/deployment last succeeded for `main` at `7244c600`, run 35755409920. That establishes a deployment record, not a fresh origin/offline smoke test. Pages settings and automatic deployment behavior must be checked before merging PR #1.
- No GitHub releases were returned. No public deployment is made by this plan or foundation patch.

### Completion estimate

**Original planning estimate: 45% complete, 55% remaining.** The table is retained as that baseline, not a recalculated completion claim after Items 02–03. This is a weighted engineering judgment against the approved release contract, not elapsed effort, a code-count calculation or a confidence claim about fun. Precision is approximately ±10 percentage points. Human acceptance gates remain unknown and cannot be awarded partial credit merely because automation passes.

| Acceptance area | Weight | Earned | Reason |
| --- | ---: | ---: | --- |
| Simulation rules and safe command lifecycle | 20 | 14 | Working outcomes and validation; task locks, correction and pacing remain incomplete. |
| Resource/orders/accountability | 10 | 8 | Persistent identity, capability, ETA and costs; broader recovery/automation missing. |
| Consequence evidence and presentation | 10 | 5 | State/history persist; approved visuals and callbacks remain a study. |
| Approved player-facing flow | 20 | 2 | Existing onboarding and controls; focused approved layouts absent from runtime. |
| Beginning-to-ending pacing | 10 | 4 | Legacy twelve-task route finishes; approved 7–9-commitment flow absent. |
| Save/report compatibility | 10 | 6 | Existing checkpoints/AAR recovery; drafts, acknowledgments and migration absent. |
| Meaningful replay | 10 | 2 | Two real variants; archive-context bug and generic score-led invitation remain. |
| Release evidence/accessibility/deployment | 10 | 4 | Automated coverage and bounded prior Edge tests; revised human/AT/upgrade gates open. |
| **Total** | **100** | **45** | Foundation patch alone does not move a milestone to Done. |

## Vertical slice gaps and code disposition

P0 blocks this approved release. P1 is required for its quality and must also close before the excellent-mission release. P2 can follow only if it does not delay P0/P1 acceptance. A ticket marked partial remains open.

| Area | Existing support | Missing acceptance / priority | Execution decision |
| --- | --- | --- | --- |
| State/command ownership | Physical reception and bounded recovery in the single engine | Focused UI exposure and later pacing (P0) | Retain atomic copy/apply/validate and conservation. |
| Arrivals | Merged foundation enables timely reception and incomplete check-in correction | Focused UI exposure (P0) | Keep actual ETA and capability/verification gates; UI wiring remains pending. |
| Bad/late plans | Bounded status/relief correction; real replacement/channel/support orders merged in PR #3 | Focused UI exposure (P0) | Preserve original histories, costs, delays and unique identities; no repair by status change. |
| Routine process | Validation/routing/receipt/COP commands | Team automation with provenance, no hidden player score (P0) | Replace quiz prerequisites; preserve resource truth and local functional ownership. |
| Time/pacing | `tick`, three periods, `advance` | 7–9 meaningful commitments, useful next-arrival action, no twelve-form gate (P0) | Change eligibility/transition orchestration in engine and scene selector. |
| Opening | `home`, `briefing`, `orientation` | One Start, immediate crew need, three qualified approaches (P0) | Replace mandatory briefing/tour; optional help retains useful facts. |
| Active play | `play`, `workDesk`, `taskFields` | Approved one-problem stage; bounded allocation/planning; sufficient evidence (P0) | Replace queue/map/metrics/ledger composition; retain optional records. |
| UI drafts | Item 03 versioned envelope retains scene, focus/task, one draft and result acknowledgment | Item 03 integration review; focused-scene wiring in 05 (P0) | Keep draft edits inert and restore validated engine truth directly. |
| Allocation | Six actual resources plus `flags.boom` | Persistent actual boom segments/reserve/failure trace (P1) | Replace `map()`'s all-asset counts with capability-specific rendering. |
| Narrative | `traffic`, `history`, report constraints | Recurring voices; state-selected result lines; opening-to-ending callback (P1) | Pure selectors, no parallel narrative simulation. |
| Handover | `apply` handover/COP/escalation; `report` | One priority action plus automatically generated supported record (P0) | Remove check-all/recipient quizzes from active flow; preserve authority. |
| Ending | `complete`, `makeReport`, `aar` | Changed-place ending and two actual causal callbacks before score (P1) | Separate outcome presentation from optional detailed AAR. |
| Replay | Both authored `SCENARIOS`; replay handler | Same/changed alternatives from displayed report, truthful invitation (P0/P1) | Fix archive context; no new scenario or progression system. |
| Storage | Schema 17 validator, guarded writes, reward dedup | Non-destructive migration, visible invalid-save recovery, cross-version fixtures (P0) | Preserve old keys/reports; explicit recovery path instead of silent null. |
| Accessibility | Keyboard controls, live region, motion/forced-colors CSS | Actual new-flow keyboard/AT/zoom/device acceptance (P0) | Preserve vertical reflow exception; no clipping to pass screen-fit. |
| Assets | Harbor SVGs, bundled fonts and licenses | Correct resource-specific state layers, optional motion finish (P1/P2) | Reuse licensed art; no external font dependency or art overhaul gate. |
| Tests | 24 full engine trajectories; controller/offline doubles | Scene lifecycle, corrections, rendered paths, upgrade and human evidence (P0) | Replace obsolete twelve-submission assertions as semantics change. |
| Delivery | QA workflow, Pages, retained `v16.html` | Effective committed-diff gate, preview, RC evidence, rollback (P0) | Keep main recoverable; explicit release authorization after gates. |

**Remove from default play:** mandatory long briefing/tour, four-item opening queue/reordering, repeated result banner plus receipt, five-index strip, always-visible ledger, routine field/recipient checklists, duplicate period review/briefing gates. Remove their unused CSS and event branches when replacements land. Keep their useful records/help available on demand.

**Refactor:** task eligibility and corrections, automated action provenance, the controller's compressed composition functions, map selectors, report-context replay, checkpoint envelope, worker activation/update flow, CI range checks. Do not put these changes into v18/v19 overlays.

**Leave untouched unless a demonstrated dependency requires a change:** retained v16 runtime and historical contracts; resource IDs/capability truth; source relief/duty dependency; actual order costs/ETAs; local functional authority; two existing incident variants; report archive/reward deduplication; action-driven rather than reading-driven time; asset license files.

## GitHub-ready implementation backlog — strict execution order

Each block is a ticket body. Complexity is relative implementation/verification effort, not calendar duration: XS localized; S one bounded behavior; M cross-function; L cross-layer; XL requires subdivision before coding. Do not file duplicate issues for already implemented portions.

### 01 · [P0] Receive arrived monitoring and correct incomplete check-in

**Description:** Remove the chapter lock from physical reception; add append-only correction for an arrived qualified team. This patch supplies the engine seam, not the approved UI.

**Files:** `v17-engine.js`; `tests/v17-arrival-recovery.mjs`.

**Dependencies:** none. **Complexity:** S. **Status:** engine seam merged through PR #2 at `6b38eadbdc1bf9efe48dd16259617f6e6b31b009`; focused UI exposure remains in 05.

**Acceptance:** Harbor can be received at 07:36 and support source work at 07:44, before 07:55; early arrival command rejected; correction consumes eight minutes, retains original record/penalty and references it; wrong capability cannot be corrected into readiness; duplicates rejected; source duty hold remains without relief.

**Testing:** physical arrival, staged/incomplete receipt, both source origins, wrong capability, repeat rejection, old-schema JSON restore equivalence, duty-limit hold, full existing suite. UI exposure belongs to 05.

### 02 · [P0] Add bounded operational recovery without duplicate resources

**Description:** Add corrective status/relief assignment and qualified replacement after incompatible sourcing; support filling the channel monitoring gap through a real order/arrival. Replace one-shot completion as the sole eligibility rule. Do not erase original choices or refund committed costs implicitly.

**Files:** `v17-engine.js` (`validateAction`, `apply`, `refresh`, `order`, `processArrivals`, `record`, `validateState`); new recovery tests.

**Dependencies:** 01. **Complexity:** L. **Status:** merged in PR #3 at `ff22897a6bc9f1a86fc3ce262a8b2c850499d4b5` after exact-head verification. Includes one bounded additional relief/waste order when the original forecast omitted that support. Read-only recovery eligibility and physical limits support later focused scenes; no new runtime UI is delivered here.

**Acceptance:** each recoverable constraint has a finite legal action or an explicit physical limit; IDs/order references remain unique; no spending/score exploit through repeats; late help stays late; SK-02 remains incapable; saved corrections replay identically. Preserve decision-to-correction links across exports.

**Testing:** wrong vendor→replacement→actual arrival→assignment; unverified and misplaced relief→correction; bad status→supported status; repeated/invalid commands atomic; no correction after finish; old histories without new fields load.

### 03 · [P0] Persist scene progress and drafts without losing existing sessions

**Description:** Define a versioned checkpoint envelope around existing engine state. Persist active scene, pending result acknowledgment and draft selections. Migrate known legacy saves without replaying actions; preserve unsupported saves for export/recovery.

**Files:** `v17-ui.js`; `tests/v17-checkpoint.mjs`; `tests/helpers/ui-harness.mjs`; adapted `tests/v17-ui-contract.mjs`; these existing QA/implementation documents. Engine and stylesheet unchanged.

**Dependencies:** 02. **Complexity:** M. **Status:** implemented pending separate exact-head integration review in PR #4 on `feat/checkpoint-resume`. The exact verified code head/CI is recorded above; documentation-only successors are verified on the PR. The six current runtime boundaries, two known legacy save shapes, one inert draft, result identity/acknowledgment and explicit storage recovery are covered. No generic migration framework, new report schema, team automation or focused visual scenes were added.

**Acceptance:** resume returns to the same unresolved scene/draft; acknowledged events do not replay; unapplied choices do not change resources; old completed AARs remain accessible; malformed storage produces useful recovery text; no silent overwrite when migration fails.

**Testing:** saved fixtures before/after each period, pending arrivals, corrections, result shown/unacknowledged, finished checkpoint/archive recovery, denied/quota writes, refresh during allocation and handover, no duplicate rewards.

### 04 · [P0] Automate routine team work with accountable evidence

**Description:** Route known requests, receive matching resources and generate supported COP/recipient records as explicit team actions. Do not call a string of old correct-answer commands to award the player points.

**Files:** `v17-engine.js` (`record`, `event`, `apply`, `refresh`, `report`, `validateState`); engine tests.

**Dependencies:** 02–03. **Complexity:** L. **Status:** engine implementation ready for separate review. The explicit `team-work` command opts a new, untouched run into routine work; old saves and the existing controller retain their legacy path. Item 05 will invoke the command through the approved opening. Team clarification/routing, matching atmospheric-team and all ordered relief-crew receipt, supported COP snapshots and constraint-recipient distribution use their own ledger provenance. Operations owns the authored assignment authorization; absent/mismatched verification or unsuitable capability leaves reception pending. Team work has no player decision events or competency credit. Six existing player commitments remain on the tested team route; final 7–9-commitment pacing remains Item 07. This is engine evidence, not rendered player acceptance.

**Acceptance:** distinguish player, condition and team action provenance; stable causal IDs, backward-compatible with old history; normal matching arrival becomes usable only after actual arrival and required verification; discrepancies remain actionable; Operations owns authorization; automated actions add no player decision count/competency credit.

**Testing:** ledger provenance and conservation; matched/mismatched manifests; automation exactly once after reload; late arrival; missing authorization; scoring/evidence excludes team work; report traceability.

### 05 · [P0] Replace onboarding and desk with the approved playable beginning

**Implementation update:** `feat/focused-opening` implements the new home, direct sourcing and persistent result over the Item 04 merged team engine. Qualified choices show cost/absolute ETA/action time/assignment sacrifice; optional resources expose Items 01–02 corrections. Pure scenes derive real capability counts. Rendered Edge opening fits 1366×768 and 390×844; 320 px reflows. Thirteen test files pass. Separate GitHub review/CI is pending. This does not close Items 06–15 or Milestone A human acceptance; see the current QA evidence.

**Description:** Introduce the focused scene selector and implement the approved hook→sourcing→result sequence. Show three qualified approaches, absolute ETA, action time, cost and sacrificed assignment. Expose received-resource corrections from 01–02 through actual controls.

**Files:** new `v17-scenes.js` pure selectors; replace `home`, `briefing`, `orientation`, `play`, `workDesk`, affected handlers in `v17-ui.js`; consolidate `v17.css`; `index.html`, `trg-sw.js`; production/controller tests.

**Dependencies:** 03–04. **Complexity:** L.

**Acceptance:** one Start reaches actionable incident; no mandatory tour; source selection is a genuine commitment; scene does not change beneath an edited choice; needed evidence visible; reading consumes no incident time; default opening fits 1920×1080, 1366×768, 390×844; 320 px/large text reflows.

**Testing:** real Start→choice→dispatch→arrival/correction; keyboard and touch; all three approaches; empty/error states; resume draft; script and cached-asset graph; no duplicate event handlers.

### 06 · [P0] Implement containment and complication through real commitments

**Description:** Connect approved allocation controls, actual boom placements and competing recovery work. Keep consequence in the current scene and replace redundant chapter gates.

**Files:** `v17-scenes.js`; `v17-ui.js` allocation/map/handlers; `v17.css`; engine transition eligibility where required; scene/controller tests.

**Dependencies:** 05. **Complexity:** L.

**Acceptance:** six-module conservation; needs beside controls; reserve survives save; review preserves draft; failure affects the correct actual resource; two workstreams expose the cost of commitment order; no drag-only control or four-form chapter lock.

**Testing:** allocations at boundaries, invalid totals, keyboard numeric controls, both existing variants, reserve/no-reserve divergence, interruption/reload, time advances exactly once per accepted action.

### 07 · [P0] Finish sustainment and one meaningful handover

**Description:** Complete planning, relief, incident continuation and incoming priority selection. Generate routine verified records from state instead of adding separate checklists.

**Files:** `v17-engine.js` (`apply` forecast/relief/handover/advance); `v17-scenes.js`; `v17-ui.js`; journey tests.

**Dependencies:** 06. **Complexity:** L.

**Acceptance:** 7–9 meaningful commitments on the normal route, with optional corrective actions; strong/mixed/adverse plans all reach truthful handover; late support can recover after actual arrival; outstanding help is never described as present; record remaining gaps at finish.

**Testing:** complete both variants with low-cost/fast/internal plans, no-relief and no-waste choices, late recovery, source duty limit, stale priority information, no deadlock or infinite wait; export final resources/orders/history matches state.

### 08 · [P1] Make choices visible through consequences and recurring crew callbacks

**Description:** Integrate the approved storyboard treatment into real play. The map must draw boom, monitoring and recovery independently; revisit Entry Group, Operations and incoming watch through actual conditions.

**Files:** `v17-scenes.js` presentation selectors; replace `map` and result rendering in `v17-ui.js`; consolidate `v17.css`; reference `EMOTIONAL_STORYBOARD.html` without loading its scripted trajectories.

**Dependencies:** 07. **Complexity:** M.

**Acceptance:** one extra vessel cannot falsely create a boom line; retained spare visibly replaces failed section; no spare leaves a gap; moved vessel leaves an empty origin; crew waits until readiness; event emphasis occurs once and static/silent state carries the same meaning.

**Testing:** exact state-to-caption/map assertions; screenshot comparison for two choices before/after failure; reload/acknowledgment; no fabricated oil transport, saved lives, wildlife outcomes or safety clearance.

### 09 · [P1] Generate the ending from the response the player leaves

**Description:** Make the opening location, actual final coverage and two player-attributable callbacks the ending. Move effectiveness and competency details into optional AAR.

**Files:** `v17-scenes.js` ending selector; `v17-ui.js` (`complete`, `aar`, `makeReport`, `download`); `v17.css`; report/controller tests.

**Dependencies:** 08. **Complexity:** M.

**Acceptance:** all endings trace to final state/history; mixed outcomes remain mixed; original/corrected decisions both visible in full record; archives render without current-session assumptions; completion/reward dedup retained; no new progression.

**Testing:** source hold/relief/coverage permutations, empty/legacy optional history fields, archived report without live checkpoint, repeated completion, JSON/HTML exports, keyboard AAR disclosure.

### 10 · [P0/P1] Replay the displayed response and name the alternative

**Description:** Fix the existing PR finding: current replay reads global `state` rather than the displayed report. Provide same conditions and existing opposite-current variant, with a state-supported question and no fabricated counterfactual ending.

**Files:** `v17-ui.js` (`aar`, replay handler, `startRun`); `v17-scenes.js` replay prompt; controller/journey tests.

**Dependencies:** 09. **Complexity:** M.

**Acceptance:** archive difficulty/variant controls replay; running checkpoint replacement is explicit; same-condition replay preserves variant; changed replay reverses actual demand/current; prior AAR remains intact; no unseen third scenario is promised.

**Testing:** old archived report while a different unfinished session exists, both variants/difficulties, cancel replacement, reload at replay start, meaningful different allocation outcomes, report isolation.

### 11 · [P0] Complete rendered accessibility and layout gates

**Description:** Verify the actual finished flow and consolidate leftover desk CSS. Preserve approved no-scroll default and accessible reflow exception.

**Files:** `v17-ui.js`, `v17.css`, assets only if needed; `docs/V17_QA.md`; browser evidence/tests.

**Dependencies:** 10. **Complexity:** M.

**Acceptance:** all essential choices and commit controls visible at default target sizes; 320 CSS px/200% zoom retain every fact/control; keyboard completes whole mission; dialogs restore focus; reduced motion/forced colors remain meaningful; screen reader announces material results without duplicate narration.

**Testing:** desktop Edge at laptop sizes, phone 390×844 and 320 px reflow, actual browser zoom and text enlargement, real assistive technology, physical iPhone-width device, error/result states and optional records. Responsive emulation alone is not physical-device acceptance.

### 12 · [P0] Ship one compatible asset set and prove upgrade/rollback

**Description:** Version the asset graph, checkpoint envelope and worker update coherently. Network-first caching plus immediate activation needs real upgrade proof before claiming atomic release behavior.

**Files:** `index.html`, `trg-sw.js`, `manifest.webmanifest`, checkpoint loader, production/offline tests; release evidence in `docs/V17_QA.md`.

**Dependencies:** 11. **Complexity:** M.

**Acceptance:** failed precache leaves prior game usable; update never pairs old controller with new schema unexpectedly; existing active session survives safe update or receives explicit reload guidance; old AARs survive; scope/base-path/custom-domain assets work offline; rollback uses known prior artifact/commit and compatible save handling.

**Testing:** online→offline→reload, interrupted installation, old open tab during update, refresh with pending draft/arrival, localhost bypass contrasted with actual worker-enabled preview origin; preview rollback rehearsal.

### 13 · [P0] Make CI inspect the committed change and retain RC evidence

**Description:** Resolve the whitespace-review finding and enforce engine, scene, controller, packaging and rendered smoke checks on the actual PR range. Avoid a green gate that only inspects a clean checkout.

**Files:** `.github/workflows/qa.yml`; new bounded browser test config/scripts if needed; current tests; dependency lockfile only if browser tooling is adopted.

**Dependencies:** 12 for final gate content; can prepare range-check correction earlier without changing sequence. **Complexity:** M.

**Acceptance:** use fetched merge-base→head or validated push-before→after range, with first-push fallback; introduce a whitespace error in test branch to prove failure; required simulation and browser jobs publish screenshots/logs for exact head; no token-string checks as substitutes for playthrough.

**Testing:** PR and push contexts including shallow checkout/base fetch, both variants, failed install, one intentional browser failure to prove gate; retain historical contracts on their historical shell. Normalize existing accidental whitespace only where necessary, preserving license text.

### 14 · [P0] Close human and incident-professional acceptance gates

**Description:** Evaluate the approved implemented game, not the wireframes. Record unresolved stalls/answer exploits and fix them in the existing implementation.

**Files:** `docs/V17_QA.md`; minimal affected production files/tests for reproduced defects.

**Dependencies:** 13. **Complexity:** M plus external participant availability.

**Acceptance:** definition of done below; no claim of fun or replay lift based on static checks; emergency-management review confirms functional ownership and two defensible strategies. Latest brief excludes new analytics; use existing records and observation.

**Testing:** novice and professional sessions separately; independent play without coaching; actual completion times and voluntary second-run choices. A failed gate reopens the owning issue, not a new design study.

### 15 · [P0] Cut and verify the Oil Spill release candidate

**Description:** Assemble evidence for the exact integration commit, update PR #1, verify a public preview, and prepare an explicit main/Pages release and rollback.

**Files:** existing QA/README/release notes; `index.html`, worker version/manifest only for final release metadata; deployment workflow only if actual Pages configuration requires it.

**Dependencies:** 14, all P0/P1 closed. **Complexity:** S.

**Acceptance:** all gates green on identical commit; preview starts/resumes/completes/replays offline as specified; named release owner approves production; deployment run and live origin asset/version match tag; main remains recoverable; no secret or private test data in report/artifact.

**Testing:** public URL cold visit, existing-save visit, hard refresh, worker update, missing asset, mobile/keyboard smoke and rollback rehearsal. Merge alone is not deployment verification.

### 16 · [P2] Finish restrained motion and optional audio

**Description:** Refine already approved transitions only after the silent/static game meets release gates. No new soundtrack pipeline or cinematic screen.

**Files:** `v17.css`, existing audio helper in `v17-ui.js`, existing maritime assets if needed.

**Dependencies:** 15 readiness; may defer beyond release. **Complexity:** S.

**Acceptance/testing:** no autoplay surprise, no repetitive alarm, effects fire once per material event; reduced-motion, mute, focus, page performance and static consequence comprehension unchanged.

## Milestones, PR sequence and deployment requirements

Each feature PR targets `v17-rebuild`. Milestones are dependency gates, not optimistic dates. Code may merge to integration after automated review while the milestone remains incomplete pending human checks.

| Milestone | Required PRs / issues | Affected files | Gate | Deployment |
| --- | --- | --- | --- | --- |
| A — Playable Beginning | `fix/resource-arrival-recovery` (01); recovery (02); checkpoint (03); team actions (04); focused opening (05) | Engine, UI, new pure scenes, CSS, tests, index/worker | Start→understood sourcing→real arrival/result; correction usable; opening screen-fit | Isolated preview, no main merge; cache all active assets. |
| B — Complete Mission | containment/complications (06); sustainment/handover (07) | Engine/scenes/UI/CSS/journey tests | Both variants and strong/mixed/adverse routes reach supported ending state without deadlock | Update preview; preserve A checkpoint fixtures. |
| C — Consequence Persistence | visible outcomes/callbacks (08); final ending (09) | Scenes/UI/CSS/reports | Same earlier choices recognizable after failure and at ending; survives resume | Preview exact commit; compare two whole trajectories. |
| D — Replay Loop | report-context replay (10) | Scenes/UI/controller/journey tests | Same and changed-condition replay starts from displayed report; no data loss | Preview, retain archived-report fixtures. |
| E — Release Candidate | accessibility (11); upgrade/rollback (12); effective CI (13); player gates (14); RC (15) | QA, UI/CSS fixes, worker/index/manifest, CI | Definition of done on exact RC commit; no open P0/P1 | Worker-enabled preview first; authorized main/Pages release then live smoke. |

### Branch, merge and version strategy

- `main` is the public release line; `v17-rebuild` is integration. Use short purpose branches from updated integration: `fix/resource-arrival-recovery`, `feat/operational-recovery`, `feat/checkpoint-resume`, `feat/team-actions`, `feat/focused-opening`, then the remaining issue names. One reviewable behavior per PR; split L tickets at stable testable seams.
- Squash feature PRs into integration after exact-head CI/review. Avoid rebasing branches another contributor uses. PR #1 remains the integration-to-main release vehicle; do not merge it merely because the foundation patch passes.
- Recommended protections for both branches: PR-only updates, passing simulation/browser gates once those jobs exist, resolved conversations, no force pushes/deletion; require an independent approval where a reviewer is actually available. Do not create an impossible single-maintainer approval gate. These are recommendations, not applied settings. Verify main's current rules with an authorized owner.
- Keep one engine, one controller, one stylesheet and one pure scene selector. `v17-scenes.js` is a bounded presentation module approved in the design; it does not patch prototypes or own competing state. Do not introduce `v18-ui`, `v19.css`, version-named wrapper layers or future-incident abstractions.
- Use release version `17.5.0-rc.1`, then `17.5.0-rc.2` for changed candidates and `17.5.0` for accepted release; tags `v17.5.0-rc.1`, `v17.5.0`. Subsequent compatible fixes increment patch. Filename stability and save-schema compatibility are separate from release version. No tag is created until its evidence is complete.
- Distinguish engine schema 17, report schema `trg.session-report.v17`, checkpoint-envelope version and asset/worker release. Change a schema only when its data shape/meaning requires it; migration fixtures are mandatory. Derive asset query/worker versions from one release value during packaging or validate equality in tests.
- Pages currently has a dynamic deployment record from main. Confirm actual source/settings before release because main merge may publish immediately. Preview must use a separate origin and storage so it cannot corrupt production checkpoints. Do not repoint CNAME for previews.

## Exact implementation homes

These are changes to existing functions or named future functions in the approved pure scene module; future functions are not claimed to exist today.

| Requirement | Current authority | Specific implementation path |
| --- | --- | --- |
| Recurring crew callbacks | Engine `traffic`, `record`, `monitoringReady`, `hasSourceRelief`, `updateSafety`; UI `taskContext`, `workDesk` | New `RR17Scenes.crewLine(state, event)` derives a short field line from confirmed resource state and actor. `workDesk` replacement renders one line. Persist acknowledgment in checkpoint, not a crew-trust score. |
| Consequence persistence | `resources`, `flags`, `history`, `events`; UI `persist` | Keep authoritative changes in engine. Add stable event/history identity and causal references in `record`/`event` with migration support. Scene acknowledgment lives alongside draft; map derives current state each render. No second outcome store. |
| Allocation persistence | `apply('allocate')`, `beginPeriod`, `flags.boom`, six resource records | Preserve asset identity and actual failed/replacement records. New `RR17Scenes.containment(state)` feeds actual segment counts to replacement `map`; reject inconsistency in validator/tests. Never redraw boom using all assigned assets at a location. |
| Handover logic | `apply('handover')`, `gaps`, `report`; current COP/escalation logic | Engine derives verified facts and functional recipients; player chooses material priority. `RR17Scenes.handover(state)` presents actual unresolved limits. Recompute facts at commitment so elapsed time cannot leave a stale readiness claim. |
| Replay prompts | UI `aar(r)`, replay click, `startRun`; engine `SCENARIOS` | New `RR17Scenes.replayPrompt(report)` selects a question from actual commitments/constraints. Bind displayed report ID/difficulty/variant to buttons. Do not read unrelated live checkpoint to derive variant. |
| Ending generation | Engine `report`; UI `makeReport`, `complete`, `aar` | New `RR17Scenes.ending(report)` selects headline, final spatial state and two supported causal references. `complete` opens outcome; detailed AAR remains optional with existing exports and dedup behavior. Old report fallback uses facts it actually contains. |

## Definition of done

The mission is not Done until all the following hold for the same release candidate. No gate can be satisfied by a wireframe or storyboard screenshot.

1. **Start:** cold visit identifies The Response Game, Oil Spill, Resources Unit and one objective; one primary Start reaches the first decision. Existing checkpoint remains recoverable.
2. **Understand:** at least 4 of 5 adult novice participants state what happened, what they are trying to do and the opening tradeoff without coaching. At least 4 of 5 make an understood first commitment within 30 seconds; report landing and Start times separately.
3. **Decide:** normal path has 7–9 meaningful commitments; operational time/cost/ETA evidence precedes commitment; invalid actions are atomic; corrections are available where physically possible. Two expert-reviewed defensible strategies produce different useful outcomes.
4. **Experience consequences:** every material result traces to state/history; at least 4 of 5 players recall an accurate choice→location/work consequence unprompted. No caption claims ecology, rescue, repair or safety clearance beyond modeled truth.
5. **Reach handover:** both existing variants and strong/mixed/adverse plans finish without external instructions or deadlock; remaining gaps/orders are truthfully inherited; corrected mistakes remain in history.
6. **Reach ending:** at least 4 of 5 novice participants finish unaided; target median first-run duration 10–15 minutes, with actual range and stalls reported. Deviations trigger pacing work, not filler waiting. Ending leads with actual work/coverage and two supported callbacks; score is optional.
7. **Replay:** same and changed conditions launch from displayed report; archive remains intact. At least two of the first five novices voluntarily begin an alternative run at a genuine stopping point and can name what they intend to change. This is a provisional product gate, not statistical retention proof; record completions and reasons for stopping.
8. **Resume:** reload at every scene/draft/result boundary preserves chosen-but-uncommitted values, actual resources/time, acknowledgments and report/reward dedup. Legacy saves migrate or receive an explicit non-destructive recovery path. Storage denial stays visible.
9. **Access:** full keyboard path, meaningful focus/live announcements, 44 px touch controls, silent/reduced-motion equivalence, forced colors, actual screen-reader run, actual 200% zoom and 320 CSS px reflow. No clipped essential evidence; default active scenes fit 1920×1080, 1366×768 and 390×844.
10. **Release:** exact-head engine/controller/scene/offline/asset/browser checks pass; licensed assets bundled; preview-origin upgrade/offline/rollback tested; no open P0/P1; public deployed commit/version confirmed after authorized release.

## Release risk register — ranked top 20

Categories separate the source of the risk. Rank reflects release impact first, then likelihood/uncertainty; owner means the responsible function, not an assigned GitHub person.

| Rank | Severity | Category | Risk / concrete trigger | Mitigation and closure evidence | Owner / issue |
| --- | --- | --- | --- | --- | --- |
| 1 | Critical | Design | Approved studies mistaken for implemented game; dashboard ships again | Replace active composition; acceptance against approved scenes on actual runtime | UX / 05–09 |
| 2 | Critical | Gameplay | Chapter lock prevents physically timely arrival | Early reception and UI exposure proven before 07:55 | Engine / 01,05 |
| 3 | Critical | Gameplay | One-shot tasks make recoverable mistakes permanent | Finite correction/replacement branches; no deadlock on adverse run | Engine / 02,07 |
| 4 | Critical | Technical | New scene/state loses existing checkpoints or duplicates actions | Fixture migration plus draft/acknowledgment resume tests; preserve failed migration | Persistence / 03 |
| 5 | Critical | Deployment | Main merge publishes before RC acceptance | Verify Pages settings; explicit release gate and rollback rehearsal | Release / 15 |
| 6 | High | Technical | Team automation awards player competency or fabricates readiness | Separate provenance, physical arrival/capability gates and no-score automation tests | Engine / 04 |
| 7 | High | Gameplay | Repeating corrective orders duplicates IDs, cost or rewards | Unique order/resource IDs; idempotence and invalid-action immutability | Engine / 02 |
| 8 | High | Gameplay | Twelve checklists still define pacing and obvious-answer strategy | Approved 7–9 commitments; automated routine work; expert strategy review | Systems / 04,07,14 |
| 9 | High | Retention | Choices produce indistinguishable experienced endings | Actual spatial persistence and two contrasting complete trajectories | Narrative / 08–10 |
| 10 | High | Design | Emotional text implies rescue, ecological recovery or unsafe clearance | Predicate-to-copy tests; exact role/authority review | Narrative/SME / 08,14 |
| 11 | High | Accessibility | No-scroll target clips choices at zoom or phone size | Default screen-fit plus explicit vertical reflow at enlarged text | Accessibility / 11 |
| 12 | High | Accessibility | Replacement controls lose keyboard/focus/reader semantics | Complete actual keyboard/AT route and dialog return-focus evidence | Accessibility / 11 |
| 13 | High | Technical | Map counts skimmers/monitors as containment coverage | Capability-specific segment rendering and resource/flag conservation checks | UI / 08 |
| 14 | High | Technical | Archived AAR replays unrelated live-session settings | Bind replay to displayed report; replacement confirmation and regression | UI / 10 |
| 15 | High | Deployment | Worker activates while old UI/save schema is still open | Worker-enabled upgrade matrix; compatible assets/migrations; rollback | Release / 12 |
| 16 | High | Technical | Passing CI fails to inspect committed changes or rendered play | Correct diff range; browser gate with retained exact-head evidence | QA / 13 |
| 17 | High | Retention | First run teaches deterministic script; second has little curiosity | Use actual two variants and alternate allocation/assignment; finite promise; voluntary replay test | Game design / 10,14 |
| 18 | Medium | Gameplay | Expensive approach dominates without a real sacrifice | Compare cost/ETA/availability outcomes; never invent budget scarcity in prose | Systems/SME / 14 |
| 19 | Medium | Deployment | Preview assumed equivalent to custom-domain/base-path/offline delivery | Verify CNAME/origin asset graph and deployed commit after publication | Release / 12,15 |
| 20 | Low | Retention | Repeated motion/audio interrupts the incident or excludes muted play | Optional one-shot emphasis; static/silent equivalence first | Presentation / 16 |

## Fastest path and current implementation

The fastest credible path is **engine eligibility/recovery → persistent focused beginning → complete mission → visible consequences/ending → meaningful replay → exact-build acceptance and release**. Reuse the two authored variants, licensed harbor assets, resource engine and report system. Do not spend the critical path expanding incident families, art tooling, progression or a new architecture generation.

**Current implementation, 5 October 2026:** PRs #2–#7 are merged into `v17-rebuild`. Foundation, bounded recovery, checkpoint persistence, accountable team actions, focused opening and complete mission are integrated. The focused route now has seven normal commitments, persistent allocation review/results, separate support plans, full handover, outcome-first ending and report-context replay. Legacy runs retain their original route.

PR #8 contains compatible offline releases, committed-range CI and complete rendered mission/upgrade checks. Exact-head results and findings belong in `docs/V17_QA.md`. Implementation milestones A–D are present in the playable build; this is not a statement that their human acceptance gates passed.

The user has explicitly requested finishing the full mission and then updating the live site. The public increment is a complete-mission playtest release. Novice understanding/completion/timing, voluntary replay, SME strategy review, actual screen-reader and physical-device checks remain unmeasured. Preserve these as open evaluation criteria; do not rename them passed or represent this release as satisfying the full Definition of Done.
