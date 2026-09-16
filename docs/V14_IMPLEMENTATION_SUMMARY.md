# Resource Run v14 RC1 — Implementation Summary

## Production changes

### New production presentation layer

- `trg-v14.css`
- `trg-v14-ui.js`

`index.html` now loads the v14 presentation layer while continuing to use:

- `trg-v12-data.js`
- `trg-v12-services.js`
- `trg-v12-engine.js`
- `trg-v13-experience.js`
- `trg-v13-audio.js`

This preserves simulation, scoring, progression, retention, analytics, and audio logic while replacing the visible interaction layer.

## Command Status

A persistent command status component was added with live values for:

- Incident
- Role
- Operational Period
- Mission Effectiveness
- Stabilization
- Responder Effectiveness
- Operational Tempo
- Critical Needs
- Incident Cost
- IER Projection

Presentation severity is derived from existing state only. No score or simulation variable is changed by the UI.

## Resource visualization

The v14 UI replaces generic vehicle-map tokens with:

- resource-status markers;
- lifecycle progress segments;
- route and destination context;
- required-by time;
- late-state indication;
- queue priority chips;
- resource utilization bars;
- available / committed / deployed / out-of-service detail.

The lifecycle board reads the existing request `stage` value and therefore cannot invent progress that the engine has not recorded.

## Scenario visual system

A presentation-only theme adapter maps the ten current incident IDs to:

- line icon;
- accent color;
- secondary accent;
- ambient glow.

Supported incident IDs:

- `hurricane`
- `wildfire`
- `oil-spill`
- `chemical`
- `refinery`
- `pipeline`
- `maritime`
- `public-event`
- `severe-weather`
- `transportation`

## AAR presentation

The existing AAR report schema and download mechanism remain unchanged. v14 replaces only the HTML renderer with a branded, responsive, print-friendly report presentation.

## Mobile

Mobile continues to use the existing five-action command dock. The new command-status band wraps into two dense rows. Resource-flow detail is progressively reduced on smaller screens to prioritize the decision surface while preserving full state through Queue, Resources, Situation, Metrics, and IMH controls.

## Performance controls

- state-signature caching retained for queue, inventory, and scenario markers;
- new state-signature caching added for Command Status and Resource Deployment;
- no raster scenario art added;
- incident differentiation uses CSS variables and inline SVG symbols;
- no new network service dependency;
- no simulation render loop introduced;
- reduced-motion behavior retained.

## QA changes

The DOM contract now checks the v14 controller and required command-system nodes. GitHub Actions now verifies:

- v14 JavaScript syntax;
- correct production assets;
- no legacy v13 controller loaded by production;
- v14 DOM contract;
- existing 70-combination engine smoke test;
- accessibility CSS guardrails;
- presence of all ten scenario visual themes.
