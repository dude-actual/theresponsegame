# Resource Run v14 RC1 — Visual Audit & Design Rationale

## Audit conclusion

The simulation engine had outgrown the v13 presentation layer. The underlying product already modeled persistent operational periods, resource availability, costs, objectives, system effectiveness, consequences, and role-specific decisions, but the interface still presented much of that sophistication through compact game cards, generic map markers, and separated metric blocks.

The v14 objective is therefore **presentation modernization without mechanic change**.

## Visual audit

### 1. Command status was fragmented

**Before:** incident identity lived in the header; stabilization, responder effectiveness, tempo, and cost lived below the map; IER and queue statistics lived elsewhere.

**Problem:** the player had to visually reconstruct the command picture from several areas.

**v14 response:** a persistent Command Status band now keeps Incident, Role, Operational Period, Mission Effectiveness, Stabilization, Responder Effectiveness, Operational Tempo, Critical Needs, Incident Cost, and projected IER visible as one operational instrument panel.

### 2. Resource movement looked more illustrative than operational

**Before:** resources appeared as small generic vehicle tokens on a stylized map.

**Problem:** the display suggested movement but did not communicate resource-management state well enough.

**v14 response:** generic vehicle movement is replaced by operational resource-status markers and a Resource Deployment board showing destination, Tactical/Support route, priority, process progress, required time, lateness, and deployment state.

### 3. Queue and inventory lacked status density

**Before:** queue and inventory rows were readable but visually flat.

**v14 response:** queue rows now expose priority and time-to-needed / lateness at a glance. Inventory rows include available, committed, deployed, out-of-service status and a utilization indicator.

### 4. Incident families did not feel sufficiently distinct

The simulation content already changed by incident type, but the visual environment remained broadly the same.

**v14 response:** all ten incident families receive a restrained visual identity through a scenario accent, secondary accent, atmospheric glow, and professional line icon. These themes never replace semantic status colors: green remains success/verified, amber remains watch/attention, and red remains consequence/critical.

### 5. The information hierarchy still read as “game cards”

**Before:** large rounded surfaces, illustrated movement, and repeated card styling made the interface feel closer to a polished training game than operational software.

**v14 response:** radii are reduced, borders are quieter, spacing is denser where appropriate, controls are more instrument-like, and visual hierarchy is carried by typography, status state, alignment, and fine separators rather than decorative containers.

### 6. AAR presentation was disconnected from the simulator

**Before:** downloadable AAR HTML used a basic light report style unrelated to the application.

**v14 response:** AAR output retains print friendliness but now uses the same incident-command design language: dark command header, amber master-brand accent, structured KPI summary, objective table, score bars, strengths, improvement areas, recommended retraining, and operational impacts.

## Design rationale

The v14 system is intentionally closer to an EOC / logistics / command-and-control application than a consumer game HUD. It uses:

- persistent command status;
- compact instrumentation;
- explicit state labels;
- process visualization;
- scenario-specific atmosphere;
- restrained motion;
- semantic severity color;
- dense but legible information architecture;
- professional report continuity.

The design rule remains: every visible element must answer at least one of three questions:

1. What is happening?
2. What needs attention now?
3. What changed because of the player’s decision?

## Preserved systems

v14 does not change the incident engine, incident packs, role logic, resource logic, scoring weights, XP/progression, retention cadence, analytics schema, or consequence mechanics. It is a front-end modernization layer over the existing simulation platform.
