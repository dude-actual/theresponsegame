# Resource Run v14 RC1 — Updated UX Architecture

## Experience layers

### Home / ICP

Purpose: orient the player, preserve career context, and configure the next operation.

Primary zones:

- master brand / audio control;
- career status;
- current retention objectives;
- incident selection;
- role selection;
- difficulty selection.

Scenario selection now has incident-specific iconography and theme accents so the player begins forming a distinct mental model before deployment.

### Mission Brief

Purpose: establish mission context without creating tutorial friction.

The brief presents:

- selected role and organizational level;
- opening incident condition;
- operating directive;
- first three incident objectives;
- daily challenge context when applicable.

The briefing remains one screen and one deployment action.

### Active Incident — Persistent Command Layer

A new persistent Command Status band is treated as the instrument panel for the incident. It exposes:

1. Incident Name
2. Role
3. Operational Period
4. Mission Effectiveness
5. Stabilization
6. Responder Effectiveness
7. Operational Tempo
8. Critical Needs
9. Incident Cost
10. IER Projection

The band remains visible while the player works through resource and role decisions.

### Active Incident — Common Operating Picture

The Common Operating Picture now has four functions:

- communicate the current operational-period condition;
- surface the most recent operational intelligence;
- visualize incident-type atmosphere and operational areas;
- display the active resource-management flow.

The situation canvas is intentionally not a geographic GIS product. It remains a simulation abstraction and therefore does not imply spatial precision the engine does not possess.

### Resource Deployment Board

Each active resource request is expressed as an operational status card containing:

- resource;
- destination;
- Tactical / Support route;
- priority / deployed / late status;
- seven-step resource-request lifecycle;
- required-by time;
- current lifecycle state.

Lifecycle stages are the existing engine stages:

`document → route → review → availability → source → check-in → deploy`

No process stages were added or removed by v14.

### Decision Workspace

The Decision Workspace remains the player’s primary action surface.

The v14 hierarchy is:

1. active-work identity and priority;
2. work metadata / due time;
3. decision prompt;
4. contextual coaching / decision feedback;
5. choices;
6. IMH and Situation job aids.

This intentionally separates “make the decision” from “read every dashboard.”

### Operations Rail

Desktop keeps two persistent operational rails:

- Pending Work
- Resource Availability

The previous redundant dashboard card is removed because command metrics are now persistent above the workspace.

### Mobile

The same conceptual architecture is preserved on mobile:

- compact incident header;
- two-row persistent command status;
- Common Operating Picture;
- Decision Workspace;
- five-action command dock.

The Resource Deployment board collapses to the most relevant active request on smaller phones to protect vertical decision space; full queue/resource state remains available through mobile command views.

### Operational Period Review

The period review remains a deliberate transition point because operational-period boundaries are meaningful to the simulation. It presents current performance and consequences before the next period begins.

### Results / AAR

The end state has four layers:

- Incident Effectiveness Rating;
- score breakdown;
- AAR strengths / improvements / retraining;
- career and achievement progression.

Downloaded AARs now mirror the same hierarchy so the product feels continuous from simulation to training record.

## Status semantics

Scenario colors are decorative / identity colors only.

Semantic colors remain invariant:

- Green: verified / deployed / healthy
- Amber: watch / attention / current process state
- Red: consequence / critical / late
- Cyan/Blue: information / command context

This separation prevents a wildfire-orange theme or chemical-green theme from changing the meaning of operational status.
