# The Response Game — Resource Run v15 RC1 Release Notes

## Release focus

v15 RC1 is a consequence-visibility release.

It does **not** add artificial gameplay penalties, bonuses, timers, random failures, scoring weights, incident rules, progression changes, or retention mechanics.

The release exposes consequence relationships that already existed in the simulation engine so players can understand:

1. what happened;
2. why it happened;
3. which decision or external condition caused it;
4. what operational result followed.

## New

### Live Incident Impact Feed

A persistent Incident Impact Feed now records meaningful operational outcomes during the incident.

Entries distinguish:

- player-caused negative consequences;
- accepted / successful operational actions;
- resource deployment outcomes;
- missed required-time effects;
- changing incident conditions;
- downstream operational degradation.

Each entry shows the operational result and the decision / cause behind it.

### Operational-language consequence translation

Existing engine state changes are translated into plain operational outcomes where supported by the active resource or role context.

Examples include:

- air-monitoring capability advancing or being delayed;
- containment / recovery capability improving or being delayed;
- shelter support advancing or being delayed;
- evacuation movement advancing or being delayed;
- responder entry advancing or being delayed;
- field communications improving or degrading;
- responder sustainment improving or degrading;
- tactical / planning / command alignment improving or degrading.

These are descriptions of actual existing state changes, not new mechanics.

### Common Operating Picture status layer

The active incident now includes a compact COP status band for:

- Resource Posture
- Mission Objectives
- Incident Trend
- Critical Need
- Incident Trajectory

Resource Posture aggregates existing available, committed, deployed, and out-of-service inventory.

Mission Objectives uses the existing objective-status evaluator.

Critical Need identifies the highest-pressure existing pending item using priority, overdue state, and required time.

Incident Trend and Incident Trajectory are presentation-only interpretations of existing Stabilization, Responder Effectiveness, Operational Tempo, Situational Awareness, unmet needs, and Operational Impact state.

### Incident Outcome Chain

The incident-completion screen now includes a causal summary showing:

- what happened;
- why the final incident picture developed;
- the operational result;
- recent decision-to-outcome relationships.

### AAR causal timeline

Generated AARs now include a Decision-to-Outcome Timeline showing:

- when the event occurred;
- the decision or condition that caused it;
- the resulting operational outcome.

The existing AAR scoring, strengths, improvement areas, and retraining logic remain unchanged.

## Preserved

- `trg-v12-engine.js` simulation mechanics
- incident generation and operational periods
- resource availability / commitment / deployment logic
- required-time logic
- consequence and cascade mechanics
- complication mechanics
- scoring and IER weights
- role progression
- mastery and XP
- analytics schema
- v13 retention systems
- v13 audio
- v14 command dashboard and scenario themes
- accessibility protections
- mobile command navigation

## Technical implementation

New production assets:

- `trg-v15-impact.js`
- `trg-v15.css`

`trg-v15-impact.js` observes the existing `SimulationEngine` methods and records before/after state for presentation. It does not replace or modify engine calculations.

The service-worker cache is versioned to `trg-v15-rc1`.

A new automated `tests/impact-contract.mjs` guard verifies the consequence-visibility layer is present in production and continues to observe the existing engine paths.

## QA expectations

v15 RC1 is gated by:

- JavaScript syntax checks;
- production asset checks;
- DOM contract;
- v15 impact contract;
- existing 70 incident/role engine smoke test;
- accessibility guardrails;
- scenario-theme validation.

Formal device-lab and assistive-technology testing remain separate validation activities.

## Production URL

https://theresponsegame.com/
