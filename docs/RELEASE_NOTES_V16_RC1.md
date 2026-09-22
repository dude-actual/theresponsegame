# The Response Game — Resource Run v16 RC1 Release Notes

## Release focus

v16 RC1 is the first **Planning Cycle / Incident Management ecosystem** release.

It preserves the existing simulation engine, incident mechanics, consequence system, IER scoring, progression, retention, accessibility, and v14/v15 command presentation. The release adds a planning layer that reads existing incident state and helps the player think one operational period ahead without turning the experience into a planning-process quiz.

## New

### Objective management

The Planning Outlook now presents each active incident objective with:

- current engine-derived status and progress;
- a suggested planning disposition;
- an optional player planning disposition: **Carry Forward**, **Review**, or **Revise**.

Planning dispositions are recorded as session analytics and included in the AAR. They do not alter IER, incident state, or scoring.

### Operational-period planning summaries

At the close of each operational period, Resource Run now summarizes objective posture, unmet needs, current operational impacts, resource-capacity outlook, next-period condition, planning implications, and recommended planning actions.

### Resource forecasting

The new resource forecast uses current inventory, visible pending demand, committed/deployed state, out-of-service state, and the selected difficulty's next-period request volume.

It identifies current capacity gaps, reduced planning margin, adequate reserve, and expected next-period work volume. It does **not** claim to know future randomized resource types.

### Operational outlook

The Planning Brief presents three horizons:

1. Current operational period
2. Next operational period
3. Future / transition horizon

The period names and condition text come directly from the selected incident pack.

### Planning recommendations

Recommendations are derived from objective status, unmet needs, urgent pending work, situational awareness, accountability, operational tempo, resource-capacity pressure, and the next operational-period condition.

Recommendations are advisory only and do not create hidden mechanics.

### Command briefings

Existing mission and operational-period narrative briefings now include a planning horizon. A dedicated Planning Brief provides the current command condition, planning posture, objectives, critical need, resource forecast, next-period outlook, and planning recommendations.

### Future operational requirements

Each incident family now has a concise capability-oriented future-requirements view. These are planning considerations tied to the scenario family, not guaranteed future resource requests.

### Enhanced AAR

The AAR now includes a **Planning Cycle Analysis** section with operational-period planning summaries, objective-management dispositions, final resource forecast, future outlook, and final planning recommendations. The existing v15 decision-to-outcome timeline remains intact.

## Planning-cycle philosophy

v16 reinforces a practical rhythm:

**Assess Situation → Validate Objectives → Forecast Resources → Build Next OP → Brief / Execute**

Planning concepts are introduced through the incident work itself rather than through a separate planning-process quiz.

## Preserved

No changes were made to:

- `trg-v12-engine.js` incident calculations;
- resource generation or request stages;
- complication mechanics;
- consequences / cascade logic;
- IER weights;
- XP or mastery calculations;
- role unlocks;
- v13 daily / weekly / seasonal retention;
- v14 command-status mechanics;
- v15 Incident Impact Feed / causal consequence reporting.

## Technical implementation

New production assets:

- `trg-v16-planning.js`
- `trg-v16.css`
- `tests/planning-contract.mjs`

The v16 layer wraps existing engine lifecycle methods for observation and planning-summary capture. It does not replace the engine source or modify engine calculations.

## Production URL

https://theresponsegame.com/
