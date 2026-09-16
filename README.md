# The Response Game — Resource Run

Resource Run is a responsive ICS 213-RR operational simulation designed to feel like a modern command-and-control product rather than a training webpage.

## Production architecture

- `index.html` — semantic application shell, SVG icon sprite, landing, briefing, game, results, and accessible dialogs.
- `resource-run-v10.css` — consolidated mobile-first design system and all responsive UI behavior.
- `resource-run-v10.js` — scenario data, game state, scoring, randomized choices, IMH guidance, movement/feedback logic, sound, dialogs, accessibility, and keyboard controls.
- `CNAME` — custom domain configuration for `theresponsegame.com`.

Older files remain in Git history; the v10 production page references only the v10 CSS and JavaScript.

## Design strategy

### Product character

- Dark incident-operations-center aesthetic.
- High-information but low-clutter visual hierarchy.
- Operational map and resource routing as the primary visual metaphor.
- Frosted-glass surfaces used for hierarchy, not decoration.
- Purposeful movement only: route progression, success/failure signaling, briefing transitions, and dialog transitions.

### Typography

- Inter throughout the product.
- Large, readable headings with restrained line lengths.
- Uppercase operational labels only for small metadata and status text.
- Body copy optimized for fast scanning on phone and desktop.

### Spacing

- 8px base spacing system.
- Mobile-first density with generous separation between interactive regions.
- Larger desktop gutters and dedicated intelligence rail.

### Color system

- Deep navy and near-black foundations.
- Muted blue operational lines and map detail.
- Cyan for information/navigation emphasis.
- Green for successful progression.
- Yellow for current route/attention.
- Red for route failure and operational impact.

## Component inventory

1. Landing / mission launcher
2. Three-step mission briefing
3. Simulation top bar
4. Incident operations map
5. Route progression nodes
6. Animated resource mover
7. Decision panel
8. Answer choice cards
9. Assignment intelligence card
10. IMH job-aid card and focused dialog
11. Route progress card
12. Mobile command bar
13. Success / results screen
14. ICP confirmation dialog
15. Scenario-specific game-over dialog
16. Scenario-specific complication dialog
17. Accessible live announcer / feedback line

## Responsive behavior

### Mobile

- One-column simulation layout.
- Compact operations map above the decision area.
- Score, streak, lives, IMH, and sound in the bottom command bar.
- All answer choices remain in the visible game region on typical phone viewports.
- Large touch targets and no horizontal scrolling.

### Desktop / laptop

- Two-column simulation layout.
- Main operations and decision workspace on the left.
- Persistent Assignment / IMH / Progress intelligence rail on the right.
- Score, streak, and lives move into the top bar.
- Answer choices display as a three-column decision set.

## Game functionality preserved

- Randomized assignments.
- Randomized answer order.
- Tactical vs. Support routing.
- Internal availability vs. external sourcing paths.
- Score and streak system.
- Three-life failure model.
- IMH guidance at every step.
- Resource movement and route progression.
- Assignment completion.
- Scenario-specific failure messaging.
- Scenario-specific complication injects.
- Sound toggle and feedback tones.
- Return-to-ICP flow.

## Accessibility

- Keyboard-accessible native buttons.
- A/B/C and 1/2/3 answer shortcuts.
- Visible focus states.
- Screen-reader live announcements.
- Focus-managed dialogs.
- Escape-to-close behavior where appropriate.
- Reduced-motion support using `prefers-reduced-motion`.
- High-contrast status colors plus text/state cues so color is not the only signal.

## QA routes

For visual regression checks:

- `/?qa=game` opens directly into a randomized assignment.
- `/?qa=results` opens a populated results state.

These query parameters are for QA only and do not change normal gameplay.
