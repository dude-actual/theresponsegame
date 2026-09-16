# The Response Game — Resource Run v14 RC1 Release Notes

## Release focus

v14 RC1 is a front-end modernization release. It does **not** alter incident-management mechanics, scoring weights, progression, retention, analytics, role logic, or scenario logic.

The release objective is to make the sophistication already present in the simulation engine visible through a professional incident-management interface.

## New

### Persistent Command Status

Live display of:

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

### Professional resource-status visualization

Resource requests now expose:

- destination;
- Tactical / Support route;
- priority;
- time-to-needed / lateness;
- seven-stage lifecycle progress;
- current state;
- deployed state.

Map-style vehicle tokens have been replaced with compact operational resource-status markers.

### Scenario visual differentiation

Unique visual treatments are now provided for:

- Hurricane
- Wildfire
- Oil Spill
- Chemical Release
- Refinery Incident
- Pipeline Incident
- Maritime Incident
- Public Event
- Severe Weather
- Transportation Accident

The themes alter scenario identity without changing status semantics.

### Operations rail modernization

Pending Work now shows priority and timing state. Resource Availability now shows available, committed, deployed, out-of-service, and utilization information.

### AAR presentation

Downloaded After Action Reviews now use a structured, responsive, print-friendly command-report format aligned with The Response Game visual system.

## Changed

- tightened component radii and card geometry;
- reduced consumer-game visual cues;
- removed the redundant desktop Incident Dashboard card;
- made Command Status the authoritative summary surface;
- increased scenario identity through professional line iconography and color themes;
- updated production service-worker cache to v14;
- updated automated DOM and production-asset QA for v14.

## Preserved

- v12 incident engine;
- v12 incident content / resources / roles;
- v12 scoring and IER;
- career XP and progression;
- v13 daily / weekly / seasonal retention systems;
- v13 audio system;
- local analytics, reports, and leaderboards;
- contextual onboarding;
- IMH job aid;
- keyboard shortcuts;
- responsive mobile command dock;
- reduced-motion and contrast protections.

## QA gate

v14 RC1 is expected to pass:

- JavaScript syntax checks;
- production asset guard;
- v14 DOM contract;
- 70-combination engine smoke test;
- accessibility CSS guardrails;
- ten-incident scenario-theme guard.

Formal device-lab, assistive-technology, and measured performance testing remain separate validation activities.

## Production URL

https://theresponsegame.com/
