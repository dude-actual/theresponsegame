# Resource Run — The Response Game

Resource Run is an evolving incident resource-management simulation built around the ICS 213-RR resource-request process.

The design goal is **a game that delivers training**, not a training page with game decoration.

## Gameplay architecture

A session is one incident played across four operational periods.

- Operational Period 1: establish the process and initial priorities.
- Operational Period 2: resource availability begins to tighten and complications increase.
- Operational Period 3: request volume and conflicts increase.
- Operational Period 4: the player manages the accumulated consequences of earlier decisions.

Requests compete for attention. Resource inventory persists across operational periods. Bad decisions can create deadline misses, resource conflicts, accountability failures, documentation gaps, and visible operational impacts.

## Educational objectives preserved

The simulation still teaches the organization-specific resource request flow:

1. identify the need and document the ICS 213-RR;
2. distinguish Tactical vs Support routing;
3. review the request for clarity;
4. check internal availability;
5. source/order resources when needed;
6. preserve pricing/UOM/ETA/vendor traceability when applicable;
7. check resources in and maintain accountability;
8. assign resources and keep status current.

The Incident Management Handbook remains an in-game job aid rather than a memorization penalty.

## Consequence engine

Errors affect the incident picture rather than only deducting points. Examples include:

- delayed spill containment or recovery;
- delayed evacuation transportation;
- shelter support shortages;
- degraded responder support;
- communications delays;
- missed required-by times;
- road closure and vendor-delay effects;
- accountability and documentation degradation.

Operational consequences persist in the incident score and period reviews.

## Incident Effectiveness Rating

The final IER combines six dimensions:

- Accuracy
- Speed
- Accountability
- Documentation
- Operational Impact
- Mission Success

The current weighting is:

- Accuracy: 24%
- Speed: 12%
- Accountability: 17%
- Documentation: 17%
- Operational Impact: 20%
- Mission Success: 10%

## Career progression

Persistent local career progression is stored in browser `localStorage`.

1. Resources Unit Trainee
2. Resources Unit Leader
3. Situation Unit Leader
4. Logistics Section Chief
5. Planning Section Chief
6. Operations Section Chief
7. Incident Commander

Career XP unlocks higher difficulty tiers and additional responsibility.

## Difficulty framework

- Recruit — guided routing and lower request pressure
- Qualified — faster tempo
- Advanced — stronger resource constraints and conflicts
- Section Chief — cross-function pressure and more complications
- Command Staff — highest request density and operational complexity

Higher tiers unlock through career progression.

## Learning system

The game tracks recurring mistakes in:

- prioritization;
- routing;
- sourcing;
- documentation;
- accountability.

Post-incident coaching identifies the strongest recurring weak areas. The player profile also stores recent IER history, mastery percentages, best performance, streaks, achievements, and in-game certifications.

> In-game certifications are Resource Run progression rewards and are not external professional credentials.

## Achievements

Current achievements include:

- Clean Route
- Accountability First
- Documentation Discipline
- Zero Preventable Impact
- Four for Four
- Fast Track
- Process Mastery

## Front-end architecture

Production files:

- `index.html` — application shell and semantic structure
- `rr-v11-data.js` — incidents, resources, ranks, difficulties, achievements, progression data
- `rr-v11-engine.js` — simulation state, request generation, resource constraints, scoring, consequences, progression
- `rr-v11-ui.js` — rendering, interaction, dialogs, mobile controls, coaching/results
- `rr-v11-core.css` — design tokens, landing experience, shared components
- `rr-v11-sim.css` — operations map, decision workspace, request queue, inventory, metrics
- `rr-v11-responsive.css` — period review, results, dialogs, breakpoints, accessibility

## Accessibility

The interface includes:

- high-contrast dark-mode UI;
- native keyboard navigation;
- A/B/C and 1/2/3 answer shortcuts;
- visible focus states;
- live feedback regions;
- semantic controls and labels;
- reduced-motion support;
- responsive mobile layouts without intentional horizontal scrolling.

## Mobile design

Mobile is treated as a first-class game layout:

- condensed incident picture;
- stacked touch-friendly decisions;
- persistent bottom command bar;
- queue, resource inventory, effectiveness, and IMH views available as focused dialogs;
- no dependence on the desktop command rail.

## Current production URL

https://theresponsegame.com/
