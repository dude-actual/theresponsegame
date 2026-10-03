# Resource Run v17: audit and vertical-slice design

## Scope and sequence

This audit was completed against the retained v16 repository before the new production shell was written. It covers the engine lineage, experience layers, v14 presentation, v15 consequence interpretation, v16 planning, incident content, documentation, tests and CI. The active design is one fictional Oil Spill incident, **Blackwater Reach**, played by the **Resources Unit** across three operational periods. Ten-family platform expansion is deferred.

Fictional places, quantities, costs, offers, lead times and schedules are authored simulation parameters. They are not real incident data, vendor quotations, regulatory thresholds or guaranteed field capability. The training truth is resource process, accountability, coordination and consequence-aware judgment.

## Findings with source evidence

| Finding | Repository evidence | Design implication |
| --- | --- | --- |
| Every request repeats seven questions with one accepted answer. | `trg-v12-engine.js`: `requestDecision()`, `answer(correct, choiceCategory)` | Replace the answer API with explicit operational commands. |
| Correct prose bundles responsible behaviors; distractors often ignore accountability or wait until demobilization. | `requestDecision()`, `addRoleTasks()` | Use credible tradeoffs instead of deliberately weak distractors. |
| Shuffling cannot remove the answer pattern. | `trg-v14-ui.js`: `renderDecision()` shuffles boolean-tagged choices. | Change the work performed, not button position. |
| Queue sorting reveals the expected answer; sidebar selection bypasses prioritization. | `renderQueue()` sorts by `priorityScore()` and calls `select()`, not `prioritize()`. | Queue changes need transparent time/capacity consequences. |
| v15 translates generic score deltas into capability narratives. | `trg-v15-impact.js`: `resourceOutcome()`, `positiveEntry()`, `trajectory()` | Paperwork progress must not imply deployed capability. |
| Individual objectives lack operational evaluators. | `objectiveStatus()` assigns a common average with small index adjustments. | Evaluate entry readiness, coverage, accountability and continuity from state. |
| v16 planning is advisory. | `docs/V16_PLANNING_ARCHITECTURE.md`; `setObjectiveDisposition()`, `resourceForecast()` | Forecasts must create real orders, arrivals and later constraints. |
| Forecasting is a heuristic, not future knowledge. | `resourceForecast()` uses current pending demand and a 22% reserve heuristic. | Disclose the information basis; do not invent certainty. |
| Time advances on actions, not reading. | `advanceTime()` | Preserve accessible action-driven time. |
| Production is a wrapper stack. | Four style generations; v15/v16 prototype patches, DOM injection and class observers. | Use one state owner and one render/event path. |
| Existing QA does not establish a finished experience. | Contract tests check tokens; `smoke.mjs` answers only the first action across 70 combinations. | Add full sessions, invariants and rendered verification. |

### Reproduced baseline defects

Isolated Node probes, without modifying baseline source, confirmed:

1. An external order reached Complete with zero available, committed and deployed units. External arrivals were not materialized.
2. Three overdue requests created six unmet needs and penalties. Deadline checking re-entered through `penalty()` and `advanceTime()`.
3. Selecting lower-priority work from the sidebar created zero prioritization decisions or penalties.

Other source risks include full pending demand subtracted after commitment, out-of-service counts exceeding the availability removed, active-request text attached to another request's deadline, and separate memory-only reporting maps. Preserve the concepts, not these defects.

## Preserve, replace and defer

Preserve ICS functional relationships; Resources/Situation under Planning; Operations ownership of tactical assignments; Logistics support ordering; resource identity, quantity, capability, location, required time, source, ETA and status; check-in/accountability; cost/lead-time tradeoffs; period continuity; competency evidence; analytics; AAR; keyboard and mobile access.

The repository's local workflow routes tactical resources through its resource-status process and support requests through Logistics. This is organization-specific training context, not a universal ICS procurement rule. The authoritative organization IMH remains controlling. Resources records and coordinates an Operations-approved reassignment; it does not unilaterally direct tactics or grant Safety clearance.

Replace the boolean choice engine, repeated templates, generic objective scoring, post-hoc capability narrative, observational planning controls, prototype wrappers, redundant dashboards and inherited CSS stack. Retain the baseline at `v16.html` and in Git. Historical engines are not production dependencies of v17.

Defer additional incidents/roles, shared organizational services, GIS claims and formal credentials. In-game progression describes observed simulation decisions only.

## Interaction model

The player works source messages, incomplete requests, resource records, an operational map and actionable work. Commands carry fields to clarify, routes, source IDs, quantities, check-in details, supported status, allocation, order commitments, COP entries and handover sequence. UI validation prevents impossible quantities while plausible operational mistakes remain playable.

Time advances for actions and period transitions. Reading, inspecting source information and accessibility navigation do not consume real-time allowance. Costs and time are simulation values. The target duration is 10–15 minutes; actual first-time duration requires measured playtests, not enforced waiting.

## Start-to-finish slice

| OP / work | Player action | Consequence and future constraint |
| --- | --- | --- |
| 1 · Validate request | Mark missing monitoring capability and precise location for clarification. | Clarification spends work time; omissions can cause a mismatch or later correction. |
| 1 · Route work | Route tactical needs through Resources and support through Logistics using the displayed local workflow. | Ownership and routing delay persist. |
| 1 · Source monitoring | Compare four offers by capability, ETA, cost and confidence. | Actual order/arrival scheduled; fast suitable supply protects entry tempo, cheaper/slower supply delays readiness, mismatch needs recovery. |
| 1 · Allocate boom | Distribute six units among marsh, channel and reserve. | Coverage and reserve become actual state; full commitment narrows the later tide-shift response. |
| 2 · Receive resources | Reconcile manifest and confirm check-in/readiness. | Orders become accountable arrivals; check-in is separate from assignment and Safety clearance. |
| 2 · Reconcile skimmer | Compare time-stamped reports and record supported status/location. | Information can become reconciled or remain uncertain; reassignment uses that record. |
| 2 · Coordinate reassignment | Record an Operations-approved allocation including the source assignment. | Receiving area gains capability while source area loses coverage; no extra resource is created. |
| 2 · Forecast relief/waste | Place support orders based on fatigue and recovery throughput. | Costs, ETAs and quantities persist to OP3; deferral creates later shortage or delay. |
| 3 · Assign relief | Check in/assign resources that actually arrived and reconcile gaps. | Relief and waste capacity determine continuity; a forecast label cannot satisfy the need. |
| 3 · Publish COP | Publish relevant confirmed reports; qualify unverified traffic. | Source confidence persists; rumor does not silently become operational truth. |
| 3 · Support escalation | Escalate a decision above Resources authority with decision-critical evidence. | Command receives a supported constraint; routine tracking alone is not escalation. |
| 3 · Transfer record | Arrange usable handover of risks, assignments, orders and continuity needs. | Owners/status/future constraints persist; omissions appear in AAR. |

Each period inherits preceding actions. Tide shifts and revised ETAs are external conditions. Players are not blamed for the event itself; preparedness and response remain within their influence.

## State, causality and reporting

Invariants: resource conservation, unique commitments, nonnegative quantities, once-only arrivals/deadlines and one record per valid submission. Saved state includes resources, orders, event cursor, decisions, conditions and current work. Resume must not duplicate consequences or progression.

Consequences record **action/external cause → state change → operational effect → remaining constraint**. Readiness depends on actual capability, arrival, check-in and assignment. AAR separates outcome, cost, delay, uncertainty, competency evidence and choices. Mixed outcomes are legitimate: faster supply may preserve operations at higher cost; reserve may reduce immediate coverage.

## Visual brief

Blackwater Reach is a fictional industrial estuary: petroleum water, oxidized teal, restrained amber work lights, fine operational markings and legible contrast. Map relationships communicate marsh/channel/staging and resource coverage, not GIS accuracy. Tide, deployment paths and resource state must mean something in play.

Use a distinctive condensed display face for incident identity and period headings, paired with a readable UI/body family. Do not preserve the baseline's 7–10px operational density. Use squared restrained surfaces, meaningful depth and selective atmosphere rather than stacks of rounded dashboard cards.

Desktop gives the active workbench priority beside map/traffic. Mobile uses real view controls while keeping next actions and consequences reachable. Every pointer manipulation has a keyboard equivalent. Text and structure supplement color; reduced motion removes nonessential animation.

## Acceptance and limits

Automated: complete good/mixed/damaging runs, invariants, once-only events, dependencies, forecast continuity, resume, invalid/stale actions and AAR consistency. Rendered: Edge laptop sizes, mobile width, keyboard navigation, reduced motion, zoom/reflow, all controls and realistic playthroughs. Static checks are guardrails, not browser evidence.

Engagement and replay claims require observed evaluation. Automated tests cannot establish whether a knowledgeable professional can exploit patterns, whether a first-time player needs a manual, or whether a player wants another incident. QA must distinguish implementation evidence from these human judgments.
