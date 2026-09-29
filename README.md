# The Response Game — Resource Run v17

**Blackwater Reach** is a playable Oil Spill vertical slice for the Resources Unit. This branch replaces the production quiz loop with twelve operational interactions across three periods. It is scoped to one incident and role; the wider incident catalog remains available in the retained v16 experience.

## Play

Open the repository through a static web server and load `index.html`. No build step, package install, account, API key or external service is required. For example, `python -m http.server 8080` serves the repository at `http://localhost:8080`.

The game opens at a welcome page explaining the experience and its objective. Choose **Start oil spill scenario** to read the incident story, your Resources Unit role, the locations and the mission. Select **Guided shift** or **Under pressure**, continue to the controls introduction, then choose **Begin playing**. Saved scenarios can be resumed from the welcome page.

Every work item explains why it has arrived and what action the player is taking. Waiting work explains its prerequisites. Submitting a decision leaves its result and consequences on screen until the player chooses the next item. New periods open with a briefing drawn from the current incident state. **Screen guide** provides in-game help without discarding an unfinished form.

Incident time advances when the player acts, so reading and comparing information never consume a real-time timer. The intended first-time duration is 10–15 minutes; measured user testing remains part of evaluation.

The three periods cover:

1. Request clarification, tactical/support routing, monitoring sourcing and scarce boom allocation.
2. Arrival/check-in, conflicting equipment status, Operations-approved reassignment and relief/waste orders.
3. Relief assignment, common operating picture publication, cross-function escalation and handover.

Orders have actual arrival times. Capability, verification and assignment determine readiness. Committing resources, carrying reserve, moving a skimmer or delaying support changes the next period. The AAR preserves the action, state change, consequence and remaining constraint.

## Runtime

- `index.html` — independent v17 shell.
- `v17-engine.js` — serializable state, validated operational commands, resource/arrival model, objectives, consequences and report generation.
- `v17-ui.js` — briefing, incident work, map, traffic, resource ledger, keyboard controls, checkpoint persistence, career record and AAR exports.
- `v17.css` — one responsive visual system with locally hosted fonts, reduced-motion and forced-colors support.
- `assets/v17/` — authored maritime chart and local presentation assets.
- `trg-sw.js` — versioned offline asset worker.
- `v16.html` — retained baseline with its original runtime assets.

The v17 application does not load v12–v16 engine/UI/CSS wrappers. Historical source is retained for comparison and recovery. Historical test contracts explicitly read `v16.html`.

## Persistence and analytics

Checkpoints, career progress and up to 30 completed AARs are saved in the current browser. Existing `trgProfileV12` XP is imported into a separate v17 profile when no v17 profile exists; historical keys are preserved. Storage refusal produces a visible warning and does not stop play. Finished checkpoints can rebuild a missing archive entry without awarding the same completion twice.

JSON exports contain the report, final state, resources, orders, competency evidence and event records. The printable HTML AAR contains objectives and the decision/consequence ledger. These are simulation practice records, not external qualifications.

No remote service is required. An organization may explicitly configure `window.TRG_CONFIG.analyticsEndpoint` before loading the application to forward simulation events. Delivery uses the browser's best-effort beacon mechanism. Shared leaderboards, authentication and organizational dashboards are not implemented in this vertical slice.

## Training boundaries

Resources and Situation are Planning Section units. Operations controls tactical assignment; Resources records and coordinates it. Logistics handles support/external sourcing under the local process preserved from this repository. Organization-specific IMH procedures remain authoritative. The slice uses ICS 213RR, ICS 211 and ICS 210 concepts without claiming that its simplified interactions replace official forms or universalize local routing.

Blackwater Reach, vendors, quantities, costs, lead times, geography and outcome indices are authored exercise assumptions. The map is not for navigation. Atmospheric readiness and relief limits are simulation dependencies, not instructions for real hazard entry.

## Validation

Run all automated checks from the repository root:

```sh
node --check v17-engine.js
node --check v17-ui.js
node --check trg-sw.js
for test in tests/*.mjs; do node "$test"; done
```

On PowerShell:

```powershell
Get-ChildItem tests/*.mjs | ForEach-Object { node $_.FullName; if ($LASTEXITCODE) { throw "Test failed: $($_.Name)" } }
```

GitHub Actions performs syntax and automated tests on pushes to `main`/`v17-rebuild` and pull requests. Mock-DOM controller checks do not substitute for rendered browser, assistive-technology or player testing.

See [the audit and experience design](docs/V17_GAMEPLAY_AUDIT.md) for source-backed findings, preservation decisions and the full slice; [the QA record](docs/V17_QA.md) distinguishes completed checks from evaluation still required. Earlier architecture and release documents remain historical references.

## Approved design and Phase 4 implementation

The player-first redesign and emotional engagement treatment below are approved source requirements. The [Phase 4 execution plan](docs/PHASE4_IMPLEMENTATION.md) maps the remaining work to ordered GitHub-ready issues, milestones, code locations and release gates. The initial arrival/recovery engine patch is a foundation change; the focused player-facing flow still requires implementation.

The [28 September player-first review and implementation plan](docs/PLAYER_FIRST_REDESIGN.md) audits revision 17.4 against the new onboarding, simplicity and replay goals. [Screen wireframes](docs/PLAYER_FIRST_WIREFRAMES.html) illustrate the proposed opening, decision, allocation and outcome hierarchy. These are design deliverables; the playable runtime has not yet been changed to this proposed flow.

The follow-on [emotional engagement review](docs/EMOTIONAL_ENGAGEMENT_AUDIT.md) contains five ranked top-20 lists, scene and tension audits, state-based visual storytelling recommendations and a retention plan. Its [consequence storyboard](docs/EMOTIONAL_STORYBOARD.html) compares two scripted runs through the unchanged engine to illustrate how an earlier allocation can become a memorable consequence. It is a presentation study, not a playable mission or a change to saved games.
