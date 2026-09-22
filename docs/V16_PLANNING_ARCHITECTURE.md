# Resource Run v16 — Planning Cycle Architecture

## Purpose

v16 turns the existing four-operational-period simulation into the first layer of a broader Incident Management ecosystem.

The design goal is not to recreate every Planning P meeting or form. It is to make the player routinely ask the questions experienced IMT personnel ask while the current period is still underway:

- Are the objectives still appropriate?
- What changed?
- What must carry forward?
- What will the next operational period require?
- Which resources are becoming constrained?
- What should Command / General Staff know before the next planning checkpoint?

## Architectural boundary

`trg-v16-planning.js` is an observational / planning-services layer over the existing engine.

It reads objectives, operational-period definitions, pending work, inventory posture, unmet needs, system indicators, existing scores, incident priorities / constraints, and selected difficulty request volume.

It does not modify IER, penalties, request generation, complications, resource commitment, incident time, XP, or progression.

## Planning products

### Objective management

Every objective receives a current engine-derived status and an independent planning disposition:

- Carry Forward
- Review
- Revise

The disposition is a planning record, not a scoring decision.

### Operational Period Summary

Captured at each existing `closePeriod()` boundary:

- period condition
- objective status
- operational impacts
- unmet needs
- cumulative / incremental cost
- resource forecast
- next-period outlook
- planning recommendations

### Resource Forecast

Resource forecasting is intentionally bounded. It uses known current state to identify capacity pressure and does not reveal or pre-generate future random requests.

Inputs include available, committed, deployed, out-of-service, visible pending request quantity, and the next-period request count from the existing difficulty profile.

Outputs are **READY**, **WATCH**, and **GAP**.

### Operational Outlook

Three horizons are displayed:

- current OP
- next OP
- future / transition

The period names and condition text come directly from the selected incident pack.

### Command Brief

The command brief combines current condition, incident priorities, objective posture, critical need, resource forecast, next-period outlook, and planning recommendations.

### Future operational requirements

Scenario-family capability considerations help players think ahead without asserting that a specific random request will occur.

## Analytics

v16 adds:

- `planning_cycle_start`
- `planning_period_open`
- `planning_period_summary`
- `planning_brief_open`
- `planning_objective_disposition`

These events support future organizational training analytics without affecting gameplay scoring.

## AAR

v16 extends the existing report object with `planningAnalysis`, containing objective-management state, period summaries, final resource forecast, final recommendations, and final operational outlook.

## Future ecosystem direction

The architecture now supports later modules for formal objective-development exercises, Tactics Meeting / Planning Meeting workflows, ICS 215 / 215A-oriented resource and safety planning, IAP readiness checks, demobilization planning, executive / command brief generation, and cross-role instructor-led simulations.

Those capabilities should remain separate modules rather than being forced into the Resource Run request-processing loop.
