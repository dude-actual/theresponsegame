# The Response Game — Resource Run Platform v14 RC1

Resource Run is a browser-based incident-management simulation platform for practicing decisions across evolving incidents. The product is designed to feel like professional operational software while preserving real-world ICS concepts and organization-specific resource-request procedures.

## v14 release focus

v14 is a **front-end modernization release**. The simulation engine, scoring model, progression, retention, analytics, and incident content are preserved.

The release adds:

- a persistent command-status instrument panel;
- professional resource lifecycle / deployment visualization;
- queue timing and priority states;
- resource utilization / availability states;
- ten incident-specific visual themes;
- command-and-control visual hierarchy;
- AAR presentation aligned with the simulator;
- v14 production QA and service-worker cache updates.

## Current production scope

Ten incident packs are included:

- Hurricane
- Oil Spill
- Wildfire
- Pipeline Incident
- Refinery Incident
- Chemical Release
- Transportation Accident
- Severe Weather
- Public Event
- Maritime Incident

Every incident contains priorities, objectives, constraints, four operational periods, changing conditions, resource pressure, and complications with mechanical effects.

## Role progression

The platform unlocks increasingly broad views of the incident:

1. Resources Unit
2. Situation Unit
3. Logistics Section
4. Planning Section
5. Operations Section
6. Command Staff Coordination
7. Incident Command

**ICS note:** Resources and Situation are Planning Section units. Planning, Logistics, and Operations are General Staff sections. “Command Staff Coordination” is a gameplay view coordinating Safety, Public Information, and Liaison concerns; Command Staff is not treated as a single real-world ICS position. Incident Command remains a separate capstone role.

## Platform gameplay

- four accumulating operational periods;
- pending requests carry forward;
- scarce resource inventory persists;
- resource commitments reduce later availability;
- simulated costs accumulate;
- objectives can become at-risk;
- conditions and constraints change;
- decisions affect responder effectiveness, stabilization, tempo, situational awareness, cost, and operational impact;
- role-specific tasks change gameplay as the player advances.

The ICS 213RR resource-request workflow remains a core Resources Unit / Logistics learning thread. The IMH remains an in-game job aid.

## Command dashboard

The v14 persistent Command Status surface displays:

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

## Resource operations visualization

The simulator exposes:

- pending work with priority and time-to-needed;
- available / committed / deployed / out-of-service resource state;
- utilization indicators;
- active resource-request lifecycle progress;
- deployment / late-state indicators;
- destination and Tactical / Support routing context.

The request lifecycle visualization is based directly on existing engine stages:

`document → route → review → availability → source → check-in → deploy`

## Incident Effectiveness Rating

The IER combines:

- Accuracy
- Speed
- Accountability
- Documentation
- Operational Impact
- Mission Success
- Cost Control

## Retention / progression

The platform retains:

- Incident of the Day
- Daily Challenges
- Weekly Operations
- Seasonal Operations
- career XP
- role / difficulty unlocks
- mastery paths
- achievements
- incident streaks
- session history

## Analytics

Event-level analytics are stored locally and can optionally be forwarded to an organizational endpoint. Events include session starts, period starts, requests, work selection, decisions, condition changes, consequences, IMH use, period endings, and session endings.

Tracked learning domains include prioritization, routing, sourcing, documentation, accountability, situational awareness, planning, logistics, operations, and command.

## Leaderboards

The client supports:

- local session rankings;
- certification rankings;
- mastery rankings;
- an organizational leaderboard adapter.

Shared organizational rankings require a configured backend. The static GitHub Pages client does not fabricate multi-user rankings.

## Session reports / AAR

Completed sessions produce a persistent report with:

- objectives and status;
- IER and sub-scores;
- operational impacts;
- simulated cost;
- strengths;
- improvement areas;
- recommended retraining;
- competency state;
- analytics summary.

AARs can be downloaded as branded HTML and session data as JSON.

## Production architecture

### Simulation / content core

- `trg-v12-data.js` — incident packs, role definitions, resources, complications, registry
- `trg-v12-services.js` — profiles, analytics, reports, leaderboards, AAR export
- `trg-v12-engine.js` — hazard-agnostic simulation engine

### Experience systems retained from v13

- `trg-v13-experience.js` — retention, mission narrative, daily/weekly/seasonal operations, guided onboarding
- `trg-v13-audio.js` — procedural professional audio cues

### v14 production presentation

- `trg-v14-ui.js` — professional command-dashboard controller / rendering
- `trg-v14.css` — visual system, responsive command layout, incident themes
- `index.html` — production application shell
- `trg-sw.js` — static asset service worker
- `manifest.webmanifest` / `trg-mark.svg` — app identity

Historical v11-v13 source remains in the repository for development history, but production does not load the legacy UI controllers.

## Optional organizational services

Configure remote services before the application loads:

```js
window.TRG_CONFIG = {
  analyticsEndpoint: "https://example.org/trg/events",
  leaderboardEndpoint: "https://example.org/trg/leaderboard"
};
```

A production enterprise deployment can add SSO, organization IDs, signed session reports, and centralized training dashboards while leaving the game engine unchanged.

## Standards alignment

The platform is designed around ICS organizational concepts and uses standard ICS form concepts such as ICS 213RR resource requests, ICS 211 check-in, and ICS 210 resource status change. Organization-specific procedures remain authoritative for local routing, procurement, and documentation detail.

## Production URL

https://theresponsegame.com/

## v14 documentation

- `docs/V14_VISUAL_AUDIT.md`
- `docs/V14_UX_ARCHITECTURE.md`
- `docs/V14_IMPLEMENTATION_SUMMARY.md`
- `docs/V14_BEFORE_AFTER.md`
- `docs/V14_PERFORMANCE_ACCESSIBILITY.md`
- `docs/RELEASE_NOTES_V14_RC1.md`

## Platform / authoring documentation

- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/SCENARIO_AUTHORING.md`
- `docs/BRAND_SYSTEM.md`
