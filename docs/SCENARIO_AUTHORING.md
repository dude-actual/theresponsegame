# Resource Run Scenario Authoring Guide

## Design principle

Incident packs change the operating environment, not ICS doctrine. Hazard details create different priorities, constraints, resources, and consequences while the underlying command-and-control concepts remain consistent.

## Required incident-pack fields

Each pack needs:

- a unique `id`
- display `name`
- short operational `summary`
- incident `priorities`
- 3–5 measurable `objectives`
- realistic `constraints`
- four operational-period condition statements
- applicable complication IDs

## Operational periods

Each period should materially change at least one of:

- life-safety pressure
- resource demand
- access
- information quality
- logistics capacity
- cost
- external coordination
- responder fatigue / relief needs

Do not make an operational-period transition cosmetic. It should change player decisions.

## Objectives

Use incident-level objectives that are outcome-oriented, measurable enough for simulation assessment, consistent with incident priorities, and not written as task lists.

The platform calculates objective status from mission success, stabilization, responder effectiveness, and operational impacts. Future packs may provide custom objective evaluators.

## Resources

Resources are catalog items tagged to incident types. Add a resource with:

```js
TRG.REGISTRY.registerResource({
  id: "example",
  name: "Example Resource",
  plural: "Example Resources",
  route: "Tactical",
  base: 2,
  tags: ["oil-spill"],
  cost: 500
});
```

Resource labels in the platform are intentionally generic unless an organization has supplied an authoritative resource-typing model.

## Complications

A complication should change a game variable. Supported effect families include travel delay, vendor delay, staffing degradation, accountability degradation, situational-awareness degradation, availability loss, request surge, priority escalation, command pressure, and cost-control pressure.

Avoid injects that only display text and have no simulation effect.

## Role tasks

Role-specific decisions should teach the work of the role without turning the session into a trivia quiz. Preferred patterns include conflicting information requiring validation, scarce resources requiring prioritization, changed conditions requiring reassessment, incomplete status requiring reconciliation, cross-section dependencies, and Safety / Public Information / Liaison issues requiring coordination.

## AAR design

Each scenario should allow the platform to explain what the player did well, where the incident picture degraded, how player decisions affected operations, and what competency should be practiced next.

The simulation should never claim that an in-game award is an external professional qualification.
