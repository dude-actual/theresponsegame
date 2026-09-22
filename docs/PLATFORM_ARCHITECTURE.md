# The Response Game — Incident Simulation Platform Architecture (v16)

## Purpose

Resource Run is now a platform game mode rather than a single scenario. The platform is designed to host reusable incident packs, role modules, game modes, analytics, session reporting, and optional organizational services without rewriting the simulation core.

## ICS alignment

The role model follows standard ICS functional relationships:

- The Resources Unit and Situation Unit are modeled under the Planning Section.
- Planning, Logistics, and Operations are modeled as General Staff functions.
- Command Staff gameplay represents coordination of Safety, Public Information, and Liaison concerns; it is intentionally labeled **Command Staff Coordination** because Command Staff is not a single ICS position.
- Incident Command is a separate capstone role.
- The resource workflow supports the ICS 213RR resource-request concept, check-in/accountability concepts associated with ICS 211, and resource status-change concepts associated with ICS 210.

Organization-specific Incident Management Handbook procedures remain authoritative where they differ in routing or procurement detail.

## Runtime modules

### `trg-v12-data.js`
Declarative content registry:

- incident packs
- ICS role modules
- career ranks
- difficulty profiles
- resource catalog
- complication library
- achievements and in-game certifications

The public `TRG.REGISTRY` API supports registering new incident packs, roles, resources, and future game modes.

### `trg-v12-engine.js`
The hazard-agnostic simulation engine owns:

- operational periods
- accumulating request / role-task queues
- resource availability and commitment
- incident cost
- responder effectiveness
- stabilization
- operational tempo
- situational awareness
- objectives and constraints
- decision effects
- complications and cascading impacts
- scoring and career progression

The engine never depends on a specific hazard pack.

### `trg-v12-services.js`
Platform services:

- persistent player profile
- event-level analytics
- session-report storage
- local leaderboards
- optional remote leaderboard adapter
- optional analytics forwarding
- After Action Review generation / download

Remote services are configured through `window.TRG_CONFIG`:

```js
window.TRG_CONFIG = {
  analyticsEndpoint: "https://example.org/trg/events",
  leaderboardEndpoint: "https://example.org/trg/leaderboard"
};
```

Without a configured backend, the platform remains fully playable and stores data locally.

### `trg-v12-ui.js`
UI controller for:

- incident setup
- role / difficulty unlocks
- common operating picture
- request / task queue
- resource inventory
- objectives and situation view
- mobile command views
- period reviews
- career / mastery
- leaderboards
- AAR and session-report workflow

### `trg-v12.css`
Responsive visual system for desktop and mobile.

## Incident pack contract

An incident pack provides:

```js
{
  id,
  name,
  summary,
  priorities: [],
  objectives: [],
  constraints: [],
  periods: [
    ["OP label", "changing condition"],
    ...
  ],
  complications: []
}
```

Resource applicability is declared on resource objects through incident tags. The engine automatically filters the resource catalog for the selected incident.

## Role module contract

A role defines:

```js
{
  id,
  name,
  career,
  unlockXp,
  section,
  purpose,
  competencies: []
}
```

Role-specific gameplay is injected by `SimulationEngine.addRoleTasks()`. Future modules can move these task generators into independently registered role plug-ins without changing the incident engine.

## Analytics event model

Core events include:

- `session_start`
- `period_start`
- `request_generated`
- `role_tasks_generated`
- `work_selected`
- `decision`
- `consequence`
- `condition_change`
- `period_end`
- `imh_open`
- `session_end`

Every event may include session, operational period, incident type, role, decision category, correctness, latency, consequence severity, and current competency values.

## Session report schema

A session report includes:

- player / organization identifiers
- incident type
- role and difficulty
- IER and sub-scores
- objectives and status
- priorities / constraints
- operational impacts
- simulated incident cost
- completed requests
- strengths
- improvement areas
- recommended retraining
- competency state
- event summary

The report can be downloaded as HTML or JSON.

## Leaderboard architecture

The default implementation supports:

- local session rankings
- local certification count
- local mastery rankings

Organizational rankings are intentionally not fabricated by the static GitHub Pages client. When a leaderboard endpoint is configured, the same UI requests shared organizational rankings from that provider. This keeps the static deployment useful while preserving a clean production path to authenticated organizational rankings.

## Organizational scalability

For enterprise deployment, place authentication and organizational reporting behind an API while retaining the same client contracts:

1. SSO resolves `playerId` and `organizationId`.
2. Analytics endpoint receives event records.
3. Session endpoint persists signed session reports.
4. Leaderboard endpoint returns authorized rankings by organization, certification, and mastery.
5. Admin dashboards aggregate competencies, recurring error categories, and training outcomes.

No simulation-engine changes are required.

## Future game modes

The same platform can host additional games through `TRG.REGISTRY.registerGameMode()` while sharing:

- profile and career progression
- analytics
- achievements
- role unlocks
- incident packs
- leaderboards
- session reporting

Examples: planning-cycle game, SimCell communications game, situation-status game, command decision game, or field-to-ICP information-flow simulation.


## v16 Planning Cycle layer

`trg-v16-planning.js` extends the platform with planning products without changing engine calculations. It observes existing incident state and provides objective-management dispositions, operational-period summaries, resource forecasts, three-horizon operational outlooks, command briefs, future operational requirements, planning recommendations, planning analytics events, and AAR planning analysis.

The practical planning rhythm is:

**Assess Situation → Validate Objectives → Forecast Resources → Build Next OP → Brief / Execute**

Objective dispositions and planning recommendations are advisory records. They do not alter IER, request generation, incident consequences, incident time, XP, or progression.

The planning layer keeps future expansion modular. Formal objectives-development, Tactics Meeting / Planning Meeting workflows, ICS 215 / 215A-oriented modules, demobilization planning, and instructor-led command workflows can be added later without forcing those activities into the Resource Run request-processing loop.
