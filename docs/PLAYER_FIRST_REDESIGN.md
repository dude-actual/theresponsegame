# The Response Game: player-first redesign

Design review and implementation specification · 28 September 2026

Reviewed baseline: `v17-rebuild`, commit `a232298ad2ad4a37f31680a6b75b8ea11a85e050`, preview revision 17.4. This document proposes the next implementation; it does not claim those changes are playable. The accompanying [screen wireframes](PLAYER_FIRST_WIREFRAMES.html) illustrate hierarchy and copy, not final art or a working simulation.

## 1. Direction and redesign recommendations

**Make the game about keeping a response working under pressure. Give the player one understandable problem, a consequential action, and a visible result before teaching the organization behind it.**

The present slice rewards learning how to operate its interface before the player has a reason to care. The latest onboarding fixes an actual context failure, but supplies that context through more screens, paragraphs and terminology. It now explains the dashboard rather than removing the need for a dashboard tutorial.

Replace the default experience with a focused incident scene. A crew needs something. The player chooses how to help. A resource moves, work starts or a gap opens. That result introduces the next problem. The full record remains available behind the scene.

Use three credible choices for the opening problem, as requested in the new brief. This supersedes any blanket objection to three choices in the earlier brief. Three options are a useful starting limit, not the architecture for every interaction. Later decisions use allocation, selection and comparison when those actions make sense.

The first mission remains Oil Spill, with the player coordinating resources inside the Resources Unit. Do not silently promote the player to Incident Commander to make the language more exciting. Introduce authority through short exchanges: “Operations approved these placements”; “Logistics confirmed this order.” Formal role descriptions belong in optional detail.

### Evidence and limits

This review combines the player's reported confusion, current rendered Edge inspection, the active UI/CSS, simulation commands, scoring, progression, persistence, tests and prior QA record. It is an expert design audit, not a measured retention study. No new-player completion rate, time-to-first-action baseline or return-rate baseline currently supports an engagement claim.

Measured using the current preview and a saved 07:00 opening state, with default text sizing:

| View | Observation | Consequence |
| --- | --- | --- |
| Scenario briefing, 1920 × 1080 CSS pixels | 467 words in the main content; page height 1,659 px; Continue starts at y=1,520 | The gate to play is below the fold even at the requested desktop size. |
| First decision, 1920 × 1080 | Page height 1,868 px; submit starts at y=1,396; status strip starts at y=1,467 | The player cannot see the complete decision or its submit control on one screen. |
| First decision, 390 × 844 | Page height 2,626 px; action panel starts at y=987; submit starts at y=2,230 | The phone's initial viewport shows navigation and a work queue rather than the decision. |

These measurements were taken from the rendered DOM and visually inspected. Heights may change with fonts, browser settings or content. They establish failure in the measured views, not a universal device result. This audit did not rerun a full rendered incident or test assistive technology; the earlier QA record remains separate.

### Complete UX audit

| Area | Current finding and source | Redesign decision | Priority |
| --- | --- | --- | --- |
| Game loop | `TASKS`, `validateAction()` and `advance` require all 12 tasks across three periods | Use incident conditions and meaningful commitments to pace the story. Automate routine records. | P0 |
| HUD | `play()` renders queue, map, traffic, action, metrics and ledger simultaneously | One threat and one decision surface; supporting systems reveal on demand. | P0 |
| Hierarchy | At 1920 px the map expands while the action column remains 440 px | Give the decision roughly 60% of usable width; use the scene to explain that decision. | P0 |
| Cognitive load | Four pending items, multiple clocks/targets and five metrics arrive immediately | Begin with one problem and one deadline. Introduce another system only after its first consequence. | P0 |
| Information density | Context, evidence, traffic, mission copy and result banners repeat facts | One canonical fact presentation per decision; history stores the full explanation. | P0 |
| Accessibility | Existing keyboard controls, motion settings and reflow are useful, but the action is below the fold | Preserve these controls while rebuilding reading order and responsive layouts; never shrink text to satisfy screen-fit. | P0 |
| Onboarding | Home → long briefing → controls page → five-field clarification | Short scenario hook → one Start action → three operational choices. Teach the next control in place. | P0 |
| Difficulty | Guided/advanced mostly share tasks; advanced adds a fixed Regional ETA slip and fewer hints | Change uncertainty, opportunity cost and number of simultaneous pressures; keep instructions clear in every mode. | P1 |
| Pacing | Results, period review and next-period briefing repeatedly interrupt action | Keep consequence on the same scene; one short chapter bridge with a single Continue. | P0 |
| Progression | Career records XP, sessions, best score and recent mastery; no substantive unlock path | Unlock an authored condition variant through completion, then introduce a new responsibility. | P1 |
| Decisions | Capability mismatch, check-all check-in and broadcast-to-all escalation expose answer patterns | Filter routine invalid options; focus on defensible tradeoffs and consequential exceptions. | P0 |
| Rewards | `complete()` grants 150 + score XP, but XP buys/unlocks nothing | Lead with visible outcomes and a specific newly available scenario variation. Keep competence evidence optional. | P1 |
| Consequences | Orders, availability and allocation are stateful; one-shot task locks prevent recovery | Preserve causality, remove artificial period restrictions, add corrective action paths. | P0 |
| Retention | Replay reverses two boom-demand variants while most events and solutions repeat | Curated branches with different constraints and endings; show what changes before replay. | P1 |

### Rules that undermine the experience

1. **The deadline cannot be met as presented.** A probe completed clarification, routing and Harbor sourcing, allocated boom and waited to 07:36. The monitor had arrived at 07:34 and was `awaiting_checkin`, but check-in was unavailable because its task belongs to period 2. An attempted check-in was rejected. Period 2 starts at 08:00, after the displayed 07:55 need. Arrival availability must depend on the resource, not a chapter index.
2. **Learning does not reliably permit recovery.** A second probe submitted incomplete check-in, then attempted to finish verification. The second command was rejected because the task was already done; source work remained on hold. Introduce correction with real time/cost consequences, retaining the original mistake in history. Never confuse a completed form with a permanently resolved operational need.
3. **Spending is often a weak tradeoff.** Harbor monitoring ($3,200), the additional skimmer ($4,600), one relief crew ($1,400) and one waste package ($1,000) total $10,200 against $12,000. `costControl` gives the same maximum component below that allowance. A premium-heavy strategy therefore has little budget pressure in the current authored needs. Balance future capacity and availability, not an arbitrary punishment for necessary spending.
4. **Several mechanics have obvious safe defaults.** Check-in rewards selecting all four checks. Escalation accepts any superset of required recipients, so selecting all four functions with “both” covers the test. Routing repeats the answer beside its dropdowns. These should be automated in the opening experience, then replaced by evidence-based exceptions later.
5. **The source list contains a declared non-solution.** Industrial Water Services explicitly cannot provide atmospheric monitoring. That can teach a capability distinction once, but it is not a credible recurring tradeoff when the requirement is already explicit. Logistics should filter incompatible packages in the opening. A later ambiguity can ask the player to resolve what capability is needed.
6. **Replay teaches the script.** The coupling failure is triggered on every period-2 transition with deployed boom; the second skimmer is always physically incapable; the same receipt fields recur. Keeping a spare becomes knowledge of the script. Author alternative, bounded conditions and signal relevant risk before commitment.
7. **Timing is opaque.** Targets are displayed, but command durations are generally revealed after action. Show “uses 6 incident minutes,” an absolute ETA and the operational deadline together where relevant. Reading never consumes time.

## 2. Information architecture

```text
Game home
  Play Oil Spill / Resume
  Optional: how it works, settings, completed missions
       ↓ one Start action
Incident scene
  Immediate threat + objective
  Current decision + directly relevant evidence
  Consequence in the same space
  Optional: current resources, relevant report, help, pause
       ↓ conditions and commitments advance the story
Mission outcome
  What the player protected / what remains exposed
  Two or three decisions that explain that outcome
  Replay with a named changed condition / return home
  Optional: detailed AAR, competency evidence, export
```

The evidence shown beside a decision is sufficient to act. Details offer provenance and depth, not a hidden answer. A new problem does not silently replace a choice being edited. Queue the update and let the player acknowledge it. Saves include the current scene, pending choice draft and acknowledged messages.

Keep three tiers: **act now** (threat, objective, options); **inspect if useful** (relevant resources, ETA, affected location); **review later** (forms, full traffic, competency scoring, exports). Advanced mode expands decision depth rather than restoring every dashboard panel.

## 3. HUD wireframe recommendations

See [the annotated screen wireframes](PLAYER_FIRST_WIREFRAMES.html). They contain opening, decision, allocation and outcome layouts with illustrative copy. Navigation switches design examples only; none of the displayed choices changes the current game or its save.

### Desktop contract

At a **1920 × 1080 CSS-pixel viewport**, use a 64 px identity/pause row, a roughly 100 px threat/objective region, a central decision stage, and a 56 px status/footer region. Keep at least 24 px outer margins. The stage gets remaining height and allocates approximately 60% to the decision and 40% to its scene/evidence. Avoid fixed widths that let the map consume every extra pixel.

```text
THE RESPONSE GAME             OIL SPILL · CHAPTER 1           Pause
Oil is spreading. Get an air-monitoring team to the source.
┌──────────────────────────────────┬─────────────────────────────┐
│ Crew message + deadline         │ Relevant incident location  │
│                                 │ Source: work waiting        │
│ [Fast external team]            │ Channel: team already busy  │
│ [Move existing team]            │                             │
│ [Lower-cost later team]         │ One relevant resource fact  │
│                                 │                             │
│ Direct cost / ETA / tradeoff     │ Details, if wanted          │
│                  [Send choice]  │                             │
└──────────────────────────────────┴─────────────────────────────┘
Reading pauses time · Chapter progress                  Resources
```

Start with two persistent statuses at most: current work status and the resource/constraint relevant to this decision. Budget appears when spending matters. Time appears next to a deadline or arrival. Hide raw recovery, shoreline and reliability indices in the default HUD; express their meaning through locations and work states. Do not replace five numbers with five unexplained icons.

Use the existing condensed display/body font pairing selectively. Decision copy should normally be 16–18 px; critical values and controls should not depend on 9–11 px labels. Keep 44 px minimum touch targets, strong focus indication, visible selected states and text accompanying color. Scene motion confirms state changes; ambient motion must not suggest oil advances while reading time is paused.

### Responsive and no-scroll contract

At 1366 × 768, reduce scene detail and decorative space before reducing decision width or text. At 390 × 844, replace the separate map column with a compact location illustration/status above the choice. Remove the queue from the first chapter. At 320 px, show the same essential evidence in shorter rows.

The default active decision must fit without document scrolling or a nested scrolling choice list. This includes all three opening choices, their essential tradeoffs and the commit control. More complex decisions use bounded steps such as **Allocate → Review**, preserving all selections and presenting an explicit summary before commitment. No hidden overflow, clipped options, tiny type or essential tooltips.

An absolute no-scroll rule at every text size conflicts with accessibility. The proposed rule is: no scrolling at supported default gameplay viewports; allow vertical reflow at large text/zoom or unusually short viewports to preserve every control and fact. This is an explicit accessibility exception, not a way to pass a clipped screen. W3C requires non-exempt content to reflow without loss at 320 CSS pixels; maps have a limited exception that does not exempt the surrounding choices. [W3C Reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

## 4. Screen-by-screen improvements

| Screen/state | Default content | Remove or move | Primary action |
| --- | --- | --- | --- |
| First visit | “Oil is spreading toward the marsh. Get crews what they need to contain it.” Incident identity, one image, duration | Generic simulation pitch, four mission objectives, formal role lecture | Play Oil Spill |
| Returning visit | Saved chapter + one unresolved situation | Repeated onboarding; archive as the main destination | Resume response |
| First problem | Crew cannot begin without air monitoring; deadline; three qualified sourcing approaches | Forms, routing exercise, queue, full ledger | Choose approach, then send |
| Immediate result | Team ordered/transferred, actual ETA, cost and any new gap | Correct/incorrect label; duplicate result banner and traffic | Continue response |
| Containment | Six visible boom sections; marsh/channel needs; reserve consequence | Nine asset cards; number-only form with implied defaults | Allocate then confirm |
| Field complication | One changed condition; what earlier action exposed/protected | Full period review followed by another briefing | Respond to the change |
| Arriving resource | Matching arrival resolves routinely; mismatch opens a focused verification decision | Check four boxes to certify an obvious matching manifest | Resolve exception when one exists |
| Competing priorities | Two workstreams with explicit consequence of delay | Drag order that does not commit work | Handle one now |
| Planning | Crew limit and waste need on a short timeline, with arrival predictions | Full next-period planning form | Order support / accept a named gap |
| Handover | Actual unresolved risk, one priority decision, generated verified record | Separate COP checklist, recipient checklist and repeated watch-list exercise | Brief incoming team |
| Outcome | Incident ending, protected/exposed locations, two causal highlights | Long AAR before replay, dominant numerical grade | Try a named alternate condition |
| Help/detail/pause | Contextual definition, relevant evidence, resume/save/settings | Multiple help entry points in every header | Return to the same decision |

## 5. New onboarding flow

Target timings below are design targets to test, not observed results.

**0–5 seconds:** A clear scene and one short hook identify the incident, objective and agency: “A ruptured line is spilling oil toward the marsh. Choose where help goes and keep the response working.” A visible **Play Oil Spill** button states where to begin. “Blackwater Reach” is the location subtitle, not assumed knowledge.

**5–12 seconds:** Start opens the actual decision scene. Caption: “You coordinate resources. Your team handles routine paperwork.” Crew message: “We need an air-monitoring team before work can start. Needed by 07:55.” No mandatory controls tour or difficulty selection.

**12–30 seconds:** Present three qualified approaches. Example quotes from a proposed 07:00 opening state:

| Approach | Visible commitment | Visible tradeoff |
| --- | --- | --- |
| Bring in Harbor Response | $3,200; arrival 07:24 | Keeps the channel team working; uses more funds |
| Transfer the channel team | $0; arrival 07:08 | Channel recovery loses its monitoring support |
| Bring in Regional HazMat | $1,850; arrival 07:55 | Lower cost; check-in means source work starts later |

These examples reuse current supplier parameters but need recalculation from the new command timing. Arrival must not be described as ready-to-work time. Each option needs a cost and a credible consequence; none receives a “best” badge. Select, inspect its short commitment summary, then confirm. Confirmation is the action, not another modal.

**30–60 seconds:** “Harbor team dispatched. $3,200 committed. Source work waits for arrival and check-in.” The scene shows the route/ETA. This is an immediate dispatch result, not a claim the team is on site. The next scene introduces floating barriers with an illustration and one sentence. Complete arrival processing when incident time reaches it.

**Within roughly two minutes:** The player sees a genuine operational payoff: a supported work area, established monitoring, or a visible gap they now need to address. Never manufacture a success because it is the tutorial. Reading, opening help and changing a draft remain free.

## 6. New progression and mission pacing

Separate responsibilities learned during this mission from the future platform's career. Do not cram all six requested complexity phases into a first session.

| Phase | Player capability | Introduction gate | Scope |
| --- | --- | --- | --- |
| 1. One problem | Choose among three operational approaches | Immediately, no ICS knowledge assumed | First minute of Oil Spill |
| 2. Resource management | Place six boom sections and understand reserve | After seeing the opening decision's result | Early Oil Spill |
| 3. Competing priorities | Choose which of two pressures to address first | After allocation consequences are understood | Middle Oil Spill |
| 4. Planning | Order support before current capacity runs out | After an arrival and resource limit are demonstrated | Late Oil Spill; deepen on replay |
| 5. Multi-agency response | Negotiate constraints across organizations with distinct authority | A later authored mission, after the slice passes evaluation | Future; no locked menu advertised as available |
| 6. Full incident complexity | Manage broader objectives and delegation in an appropriate role | Optional expert campaign after multiple validated missions | Future; explicit role transition required |

Recommended full Oil Spill session: **7–9 meaningful commitments in 10–15 minutes**, with an early payoff. This is a pacing hypothesis, not a request for artificial delays. If users finish thoughtfully in less time, retain the shorter run. A branch should appear because the state warrants it, not to satisfy a task quota.

| Approximate elapsed play | Story beat | Interaction | State carried forward |
| --- | --- | --- | --- |
| 0:00–1:00 | Crew waiting at the source | Three-way sourcing choice | Order, ETA, funding, possible channel gap |
| 1:00–3:00 | Oil approaches protection areas | Boom allocation | Real placements, exposed area, reserve |
| 3:00–5:00 | Help arrives / field picture changes | Conditional receipt exception or recovery choice | Verified readiness; corrected or remaining gap |
| 5:00–8:00 | Two places need limited recovery capacity | Select work first; keep/move/contract resource | Transfer time, source coverage loss, future availability |
| 8:00–11:00 | Capacity will run out | Relief/waste forecast with clear timeline | Orders and arrival dependencies |
| 11:00–13:00 | Earlier planning pays off or falls short | Conditional assignment or corrective action | Work continuation or explicit limit |
| 13:00–15:00 | Incoming team takes over | Select the material unresolved priority | Accurate handover and supported ending |

Retain three operational periods internally if useful, but present chapters as story milestones. Do not make the clock wait for four forms to be checked off. Match chapter titles and messages to actual state; a late arrival stays late across a chapter transition.

## 7. Cognitive-load reduction and UI disposition

Use this as the element-by-element removal/simplification checklist. “Keep in record” means it can remain in the simulation or AAR without occupying the active scene.

| Current element | Does it help the next decision? | Disposition |
| --- | --- | --- |
| Brand / scenario identity | Yes, as orientation | One compact header; avoid repeated oversized place names |
| Incident clock | Only for timing judgments | Put next to the relevant deadline/ETA; otherwise compact |
| Six header tools | Usually no | Pause/menu; context-specific Help remains one action away |
| Period rail and full condition sentence | Partly | Compact chapter progress; current condition becomes scene headline |
| Mission strip | Yes if immediate | One current goal, not a summary of four pending tasks |
| Top outcome banner | Duplicates result | Remove; one in-place consequence presentation |
| Four-item incoming queue | No in phase 1 | Hide initially; show two actionable pressures in phase 3 |
| Queue move arrows / drag | Sorting is not a commitment | Remove in default play; choose actual work order when timing matters |
| “Advance 10 minutes” | Sometimes necessary, poorly framed | Replace with Next arrival/Continue response and a preview of elapsed time; confirm no urgent work is skipped |
| Full map | Sometimes | Contextual crop/layers; enlarge during allocation only |
| Assigned-asset counts | Often misleading as capability | Show “monitoring working,” “recovery paused,” or exact needed equipment |
| Three latest traffic messages | Not reliably relevant | One relevant sender/message; full log optional |
| Context paragraphs | Some facts needed, repeated elsewhere | One situation sentence, one goal, compact evidence |
| ICS form replica | Not needed for initial sourcing | Generate routine record; reveal request ambiguity in a later focused interaction |
| Routing dropdowns | Routine rule following | Automate known routing; keep responsible function visible in receipt |
| Source offers | Yes | Three qualified opening approaches; dynamic options later |
| Boom quantity inputs | Yes, but abstract | Visible tokens plus numeric/keyboard alternatives; no drag-only controls |
| Check-in checkboxes | Usually no real evidence judgment | Match routine arrivals automatically; escalate discrepancies |
| Status/evidence dropdowns | Potentially useful | Present conflicting reports and ask which resource is actually usable |
| Authorization checkbox | Repetitive paperwork | Route request to Operations automatically; pending approval remains a real state |
| Relief/waste form | Timing is useful, duplicate counting is not | Timeline and bundles; separate only if there is a real tradeoff |
| COP checklist | Obvious include-all-except-rumor pattern | Generate supported facts; make uncertain reports a later verification decision |
| Recipient checklist | Broadcast-all exploit | Auto-route routine notices; ask for Command decision only when beyond delegated authority |
| Optional free text | Unnecessary for most new players | Optional detailed handover/advanced practice; not keyword graded |
| Handover ranking | Useful only for material competing risks | One prioritized unresolved risk with a generated factual handover |
| Five numeric indices | Require interpretation before action | Replace with explicit current conditions; keep analytical view in AAR |
| Nine individual asset cards | Mostly unrelated to current choice | Relevant inventory summary; full ledger on demand |
| Process hints | Helpful when contextual | One optional “Why?” beside the decision; no answer-revealing default |
| Period review + next briefing | Duplicated transition | One bridge: what changed, what needs attention next |
| AAR score / competency meters | Supporting evidence | Outcomes first, details second |
| Replay below full timeline | Important action buried | Place a named next run beside the outcome |
| Storage warning | Essential when saving fails | Persistent plain-language notice; never hide in optional detail |

Keep a copy budget: hook about 30 words; situation plus objective about 50; three opening choices about 20 words each excluding short values. Later choices may need more evidence. When they do, design a comparison or a bounded step rather than compressing into unreadable prose. These are editorial targets, not rigid truncation rules.

## 8. Retention and rewards

The reason to return should be: **“I want to see how a different resource decision changes the response.”** Current XP and two nearly identical runs do not yet establish that reason.

1. **Immediate reward:** a resource departs, a barrier appears, or a crew reports that work can continue. Tie each visual change to a logged state transition. Captions carry the same information as animation/audio.
2. **Chapter reward:** a short acknowledgment names the useful action and its remaining cost: “The spare kept marsh protection in place. Your reserve is now empty.” No gold star for completing a form.
3. **Completion reward:** a state-derived ending with two causal highlights. Example templates: source work supported / paused; priority shoreline protected / exposed; relief ready / gap carried forward. Combine these; do not fabricate saved lives, recovered volume or environmental restoration from abstract indices.
4. **Return invitation:** reveal an authored condition variant after any completed first run, including a difficult outcome. Display its actual change: “Next run: current toward the channel.” Let the player retry the same conditions too.
5. **Deeper replay:** add one curated availability/lead-time variation only after the first variant tests well. A changed forecast, vendor availability or recovery unit creates a different plan; random wording does not.
6. **Progression reward:** unlock a decision type or scenario condition, not statistical advantages that invalidate comparison. Explain “new responsibility available” without claiming a professional credential.

No streak loss, daily obligation, energy timers or randomized reward purchases. The brief's retention goal is voluntary return driven by interest. Keep a satisfying stopping point and reliable resume. Cosmetics can follow demonstrated engagement; they are not the first retention fix.

### Measure the return loop

Keep operational analytics and experience analytics distinct. Add versioned local events: `home_viewed`, `mission_started`, `decision_presented`, `decision_committed`, `consequence_seen`, `chapter_reached`, `mission_completed`, `replay_selected`, `mission_resumed`, `help_opened`. Record experience version, scenario variant, interaction ID and visibility-aware active elapsed time. Do not collect entered narrative notes as product telemetry.

Define start-to-first-action from Start to first accepted commitment; also track landing-to-first-action to include onboarding friction. Completion rate is completed started missions, with resumed runs deduplicated by session ID. Replay rate is replay starts divided by completed missions. Next-day return needs an agreed identity/consent model and an actual later session; a click on Replay is not next-day retention. Local browser records cannot establish cross-device return. Preserve the current no-default-remote-analytics behavior.

## 9. Authenticity and consequence design

Automate the work of a competent incident team, not the truth of the incident. A correctly matched routine arrival can be received by Staging, with its ID, capability, time and responsible person retained. A discrepancy should stop that automation and become player-visible work. A requested resource cannot become physically present because the UI skipped its form.

Operations retains tactical direction; Resources maintains resource status within Planning; Logistics provides support and sourcing through the applicable local process. Show these responsibilities in messages and action receipts. FEMA's training reference distinguishes these functions; it does not establish the repository's organization-specific routing as universal. [FEMA ICS training material](https://emilms.fema.gov/is_822/groups/310.html).

Every action should yield: **commitment → state change → consequence → remaining constraint**. For example, transferring monitoring shortens source wait but pauses the channel work that required it. If the player later obtains a replacement, the channel can recover after actual arrival and authorized assignment. Both decisions remain in the AAR. A mistake should create a new problem the player can work, not disable the relevant control forever.

Keep objective constraints explicit. Never award a better outcome merely for calling Command, checking every box or spending less. Distinguish consequences imposed by conditions from consequences of a player's response. Keep multiple defensible outcomes; do not replace the old quiz with three choices whose adjectives reveal the preferred answer.

## 10. GitHub-ready implementation plan

Continue on `v17-rebuild` / PR #1 while keeping `main` recoverable. Treat the following as implementation work packages, not completed issues. Do not add v18/v19 wrapper layers over `play()`.

| Package | Files/components | Required work | Acceptance / dependency |
| --- | --- | --- | --- |
| P0-01: condition-driven availability and recovery | `v17-engine.js`; engine tests | Separate event eligibility from fixed task periods. Allow arrival check-in when physically eligible. Add correction/replacement commands and history links. | An arrived qualified team can support entry before 07:55 when timing permits. Incomplete verification can be corrected; original evidence persists. |
| P0-02: introductory scene model | New focused `v17-scenes.js`; engine integration | Author opening, allocation, complications, planning and outcome scene definitions. Scene data names the known facts, eligible actions and disclosure level. | UI never infers physical readiness. Scene changes follow state and explicit acknowledgments. Depends on P0-01. |
| P0-03: opening and focused HUD | Replace `home()`, `briefing()`, `orientation()`, `play()` composition in `v17-ui.js`; consolidate `v17.css` | Short entry, one-click start, three sourcing approaches, compact objective, contextual evidence, in-place consequence. Remove superseded CSS. | All opening choices/tradeoffs/submit fit default 1920×1080, 1366×768 and 390×844. No mandatory pre-play reading gate. |
| P0-04: automation with accountability | Engine commands; scene model; UI | Routine request validation/routing/check-in and factual handover run through explicit team actions. Do not call old correct-answer commands just to earn hidden points. | System actions are auditable and excluded from player competency/reward counts; discrepancies create actionable exceptions. |
| P0-05: complete mission pacing | Scene model, allocation controls, competing-priority and planning interactions | Deliver one complete 7–9-commitment path plus meaningful recovery branches. Merge redundant chapter transitions. | Full stateful 10–15 minute target evaluated with people; no filler waits; story accurate on costly, late and incomplete runs. |
| P0-06: save compatibility and packaging | Save loader, manifest/index, `trg-sw.js`, production/offline tests | Version new state/scene schema; preserve reports and existing checkpoints. Provide legacy resume or explicit migration if lossless conversion is impossible. Cache complete new asset graph. | Old save does not silently reset; failed update preserves playable prior assets; inspect actual deployed-origin upgrade. |
| P0-07: rendered/player gate | `docs/V17_QA.md`, controller tests, browser review | Test full paths, keyboard, motion, text sizing, reflow, phone layout and first-time comprehension. | Pass the gates below before treating the slice as release-ready. |
| P1-01: endings and replay | Outcome view; scenario conditions; reward persistence | Outcome-first AAR, causal highlights, named changed-condition replay, one unlock with deduplication. | Unlock survives resume; replay exposes real differences; narrative matches final state. Depends on complete mission. |
| P1-02: balance and measurement | Engine scoring, scenario values, analytics | Remove broadcast/check-all exploits; evaluate premium/default strategies; instrument experience funnel. | At least two credible strategies have different useful outcomes; no claimed retention uplift without cohort evidence. |
| P2-01: advanced responsibilities | Future scenario/role data | Add genuine uncertainty and multiple owners after basic loop validation. | Separate role authority and explain new responsibility in play; avoid catalog-wide generalization. |

Suggested scene contract: `id`, `chapter`, `eligibility`, `objective`, `knownFacts`, `interactionType`, `eligibleActions`, `relevantResourceIds`, `onCommit`, `nextWhen`, `help`. Keep prose out of consequence calculations. Use one authoritative command/state engine and a pure presentation selector. Separate presentation `seen/expanded/draft` state from resource truth.

Add explicit `actor` and `causedBy` references to history: player, incident condition or team automation. Keep IDs stable across saves and reports. Computed forecasts must disclose uncertainty and not reveal unreleased scenario truth. Persist presentation acknowledgment so reload does not skip a consequence or replay an action.

Tests should verify behavior, not exact paragraph strings or a fixed count of 12 submissions. Retain conservation, actual arrival, authority, invalid-action immutability, save equivalence and reward deduplication. Add arrival-before-period eligibility, corrected check-in, replacement after wrong capability, no fabricated arrival, simultaneous-pressure consequences, and meaningful branch divergence. Replace obsolete controller contracts when the flow changes; preserve the retained historical runtime tests.

## 11. Prioritized development roadmap

**Milestone A — Prove the first two minutes (P0-01 to P0-04).** Build the opening sourcing decision, its actual dispatch/arrival consequence and boom allocation in the focused HUD. Test with novices before polishing the rest. This is the next implementation priority; more scenario content and new dashboards wait.

**Milestone B — Complete the incident (P0-05 to P0-07).** Carry decisions through a field complication, recovery choice, support forecast, handover and ending. Verify correction paths and save/upgrade behavior. Finish the entire authored slice; do not stop at an attractive opening mockup.

**Milestone C — Give replay a reason (P1).** Implement outcome-led replay, a curated changed-condition variant and strategy balance. Measure completion and voluntary replay before investing in cosmetic progression.

**Milestone D — Expand responsibility (P2).** Only after repeated novice evaluation supports the core loop, design the next responsibility/role or incident. Multi-agency and full-command phases need their own authority model and pacing, not a toggle exposing every hidden panel.

These are dependency milestones, not calendar estimates. Establish effort estimates after P0-01 confirms how much of the task-bound engine must change.

## 12. Evaluation gates and decision rules

Recruit an initial round of five players unfamiliar with ICS, then repeat after revisions. Include keyboard and small-screen users in the review. This is a usability discovery round, not statistical proof of retention. Emergency-management reviewers separately check authenticity and exploitable answer patterns. If testing minors, use an appropriate consent process; adult newcomers can test plain-language comprehensibility without recruiting minors.

| Test | Proposed release gate | Evidence to retain |
| --- | --- | --- |
| Five-second comprehension | At least 4 of 5 novices can say what happened, their immediate objective and what they can choose | Verbatim answers after brief exposure, before coaching |
| First action | At least 4 of 5 commit an understood opening choice within 30 seconds of landing; also report Start-to-action time to isolate decision friction | Timestamps and their explanation of the tradeoff, not speed alone |
| First reward | At least 4 of 5 explain what their action changed and one remaining constraint | Observation after the first genuine outcome |
| Screen fit | Every default active scene passes the declared desktop/laptop/phone sizes with critical evidence and commit control visible | DOM bounds plus screenshots of every interaction type and its error/result states |
| Completion | At least 4 of 5 complete the slice without facilitator direction; record help use and every stall | Full playthrough, duration, abandonment point, recovery behavior |
| Replay interest | Offer a genuine stopping point, then observe whether players choose another run | Replay starts/completions and stated reasons; no satisfaction claim inferred from politeness |
| Strategy diversity | Test at least two defensible plans across authored variants; surface universally dominant actions | State/cost/timing comparisons and expert review |
| Accessibility | Complete with keyboard, touch, motion reduction, enlarged text and screen-reader support; no lost essential information | Rendered and assistive-technology checks, documented exceptions, actual zoom checks |
| Truthfulness | Every selected narrative outcome traces to actual resource/condition state | History IDs and assertions across strong, mixed and adverse trajectories |

Treat 4-of-5 thresholds as provisional usability gates, not population estimates. Decide larger retention experiment sizes from observed baselines and a defined effect of interest. Do not claim that reaching these gates guarantees fun, commercial quality or next-day return.

If comprehension fails, simplify the opening before adding features. If choices are understood but feel trivial, revise constraints and consequences before adding more choices. If people finish but decline replay, improve scenario divergence and the payoff before adding XP. If professionals approve but novices cannot act, the player-first objective is still unmet.

### Review traceability

Primary repository references: `v17-ui.js` (`home`, `briefing`, `orientation`, `taskFields`, `workDesk`, `play`, `complete`, `aar`); `v17.css` (command layout and responsive rules); `v17-engine.js` (`TASKS`, `refresh`, `validateAction`, `apply`, `tick`, `beginPeriod`, `report`); `tests/v17-engine.mjs`; `tests/v17-ui-contract.mjs`; `docs/V17_QA.md`; `docs/V17_GAMEPLAY_AUDIT.md`. Browser review and isolated engine probes performed on 28 September 2026. The runtime is unchanged by this design deliverable.

Wireframe verification: all four layout examples were checked in Edge at 1920 × 1080, 1366 × 768 and 390 × 844. At default text size, the final layouts had no document overflow and their illustrative action labels were in the viewport. Opening/decision desktop and phone outcome visuals were inspected. Navigation and the notes dialog were exercised; the script parses and referenced local assets exist. These checks apply to the design artifact only, not to a completed gameplay implementation, actual browser zoom, assistive technology or novice comprehension.
