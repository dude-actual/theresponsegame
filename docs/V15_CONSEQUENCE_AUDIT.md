# Resource Run v15 RC1 — Consequence System Audit

## Scope

v15 reviews and exposes consequence behavior already present in:

- `trg-v12-engine.js`
- `trg-v12-services.js`
- `trg-v13-experience.js`

The release does **not** introduce a new scoring layer, new failure mechanics, new random penalties, or new incident rules.

## Existing consequence systems found in the engine

### Decision penalties

Incorrect decisions already reduce existing incident variables through `penalty()`:

- Accuracy
- Documentation, when the error is documentation-related
- Accountability, when the error concerns accountability or resource tracking
- Situational awareness, when the error concerns information quality
- Operational Impact score
- Responder Effectiveness
- Operational Tempo
- Incident time

Each penalty already creates an `impact` record and a `consequence` analytics event.

### Required-time failures

`checkDeadlines()` already converts overdue pending work into unmet operational needs. A missed required time:

- sets the work item overdue;
- increments unmet needs;
- invokes the existing consequence path;
- records a text explanation that the required time was missed.

v15 surfaces this as an operational outcome rather than leaving it primarily in scores and counters.

### Cascading effects

`cascade()` already models second-order degradation:

- low accountability can degrade the resource picture / situational awareness;
- poor situational awareness can reduce operational tempo;
- low responder effectiveness can reduce incident stabilization.

These are existing engine relationships. v15 displays their downstream result when they occur.

### Resource deployment effects

Correct resource processing already changes the operational picture:

- internal availability becomes committed;
- committed resources become deployed;
- external sourcing consumes additional time and cost;
- completed deployment improves stabilization, with a larger improvement for urgent resources.

v15 translates those state changes into plain operational language such as containment capability improving, air-monitoring capability advancing, responder entry capability becoming available, or shelter support moving closer to operational readiness.

### Role-task effects

Correct role decisions already apply role-specific positive effects through `applySystemEffects()` including:

- Situational Awareness improvement
- Stabilization improvement
- Operational Tempo improvement
- Accountability improvement
- Documentation improvement
- Mission improvement

v15 shows those improvements in the Incident Impact Feed rather than presenting only a correct-answer response.

### Complications / changing conditions

`applyComplication()` already changes existing incident state through travel delay, vendor delay, staffing pressure, accountability loss, situational-awareness loss, cost-control pressure, resource availability loss, request surge, stabilization pressure, and command pressure.

v15 explicitly labels these as **external incident conditions**, not player-caused failures.

## Existing service-layer consequences

`AARBuilder` already summarizes:

- objectives;
- Incident Effectiveness Rating;
- sub-scores;
- operational impacts;
- simulated cost;
- strengths;
- improvement areas;
- recommended retraining;
- competency state;
- selected analytics events.

v15 extends the generated report presentation with a decision-to-outcome timeline sourced from observed engine state changes. The underlying scoring and AAR assessment logic remains unchanged.

## Existing experience-layer consequence language

`trg-v13-experience.js` already provides narrative hooks for:

- deployment alerts;
- operational impacts;
- changing conditions;
- period close summaries;
- accepted resource / command actions.

v15 does not replace those systems. It adds a persistent causal view so the player can understand what changed after the alert disappears.

## v15 interpretation boundary

v15 calculates presentation-only labels such as **Improving**, **Stable / Pressured**, **Degrading**, or **Deteriorating** from existing Stabilization, Responder Effectiveness, Operational Tempo, Situational Awareness, unmet needs, and Operational Impact state.

These labels do not modify the simulation. They are explanatory views of state the engine already owns.

Likewise, operational-language translations such as “Air monitoring delayed” or “Containment capability improved” are display descriptions tied to the resource being processed and actual engine deltas. They do not create an additional incident effect.
