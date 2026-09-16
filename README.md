# The Response Game — Resource Run Platform v13 RC1

Resource Run is a browser-based serious-game platform for practicing incident-management decisions across evolving incidents. The game is designed to feel like an operational simulation while preserving real-world ICS concepts and organization-specific resource-request procedures.

## Release-candidate experience

The v13 release candidate adds a mission-first experience layer over the validated v12 incident engine:

- single-screen mission briefings;
- live operational-intelligence feed;
- deployment / consequence alerts;
- guided first mission and contextual help;
- Incident of the Day, Daily Challenges, Weekly Operations, and Seasonal Operations;
- challenge streaks and bonus progression;
- professional procedural audio cues;
- refined The Response Game brand system;
- service-worker static asset caching;
- automated GitHub Actions QA.

The simulation core remains ICS-aligned and retains the ten incident packs, role progression, analytics, leaderboards, and AAR reports.

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

- four accumulating operational periods
- pending requests carry forward
- scarce resource inventory persists
- resource commitments reduce later availability
- simulated costs accumulate
- objectives can become at-risk
- conditions and constraints change
- decisions affect responder effectiveness, stabilization, tempo, situational awareness, cost, and operational impact
- role-specific tasks change gameplay as the player advances

The ICS 213RR resource-request workflow remains a core Resources Unit / Logistics learning thread. The IMH remains an in-game job aid.

## Live dashboards

The simulation exposes:

- assigned resources
- available resources
- pending work
- unmet needs
- operational impacts
- priority pressure
- responder effectiveness
- incident stabilization
- operational tempo
- simulated cost
- objectives / constraints / current conditions

## Incident Effectiveness Rating

The IER combines:

- Accuracy
- Speed
- Accountability
- Documentation
- Operational Impact
- Mission Success
- Cost Control

## Analytics

Event-level analytics are stored locally and can optionally be forwarded to an organizational endpoint. Events include session starts, period starts, requests, work selection, decisions, condition changes, consequences, IMH use, period endings, and session endings.

Tracked learning domains include prioritization, routing, sourcing, documentation, accountability, situational awareness, planning, logistics, operations, and command.

## Leaderboards

The client supports:

- local session rankings
- certification rankings
- mastery rankings
- an organizational leaderboard adapter

Shared organizational rankings require a configured backend. The static GitHub Pages client does not fabricate multi-user rankings.

## Session reports / AAR

Completed sessions produce a persistent report with:

- objectives and status
- IER and sub-scores
- operational impacts
- simulated cost
- strengths
- improvement areas
- recommended retraining
- competency state
- analytics summary

AARs can be downloaded as HTML and session data can be downloaded as JSON.

## Expansion architecture

Production files:

- `trg-v13-experience.js` — retention, mission narrative, daily/weekly/seasonal operations, guided onboarding
- `trg-v13-audio.js` — procedural professional audio cues
- `trg-v13-ui.js` — release-candidate experience controller
- `trg-v13.css` — v13 brand / interaction / mobile experience layer
- `trg-sw.js` — same-origin static asset service worker
- `manifest.webmanifest` / `trg-mark.svg` — app identity
- `index.html` — application shell
- `trg-v12-data.js` — incident packs, role definitions, resources, complications, registry
- `trg-v12-services.js` — profiles, analytics, reports, leaderboards, AAR export
- `trg-v12-engine.js` — hazard-agnostic simulation engine
- `trg-v12.css` — validated base responsive layout primitives retained beneath the v13 experience layer
- `docs/PLATFORM_ARCHITECTURE.md` — platform architecture and organizational scaling
- `docs/SCENARIO_AUTHORING.md` — authoring contract for future incident packs

Future games can register additional incident packs, roles, resources, or game modes through `TRG.REGISTRY` without replacing the simulation core.

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

## Release documentation

- `docs/FINAL_EXPERIENCE_AUDIT.md`
- `docs/BRAND_SYSTEM.md`
- `docs/QA_REPORT_RC1.md`
- `docs/PERFORMANCE_REPORT.md`
- `docs/ACCESSIBILITY_REPORT.md`
