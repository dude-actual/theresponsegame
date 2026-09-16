# Resource Run v14 RC1 — Performance & Accessibility Review

## Performance impact assessment

### Added work

v14 adds:

- one persistent command-status component;
- one resource-deployment status board;
- incident-specific inline SVG icons;
- CSS-variable scenario theming;
- additional state-signature comparisons.

These are DOM/CSS presentation changes and do not add a simulation loop, 3D renderer, canvas renderer, video asset, raster background library, or new API dependency.

### Rendering controls

The v14 controller retains queue/inventory/map render signatures and adds signatures for:

- command status;
- resource-flow state.

Those areas are only rewritten when their underlying display state changes.

The Common Operating Picture uses static CSS layers plus a single transform-based scan effect. `prefers-reduced-motion` removes that scan. Mobile disables expensive glass blur inherited from desktop presentation.

Scenario differentiation is implemented with CSS custom properties and the existing inline SVG sprite, avoiding additional image downloads per incident.

### Network impact

New production assets are two text files:

- `trg-v14.css`
- `trg-v14-ui.js`

The service worker cache is versioned to `trg-v14-rc1` and pre-caches the production asset set. No new remote service is required.

### Expected posture

The modernization increases DOM density modestly but should remain lightweight relative to media-heavy simulation products. Actual LCP, CLS, INP, memory, and CPU figures require measurement on the deployed URL and representative devices; this document does not invent benchmark numbers.

## Accessibility validation review

### Preserved protections

- browser zoom remains enabled;
- semantic gameplay buttons remain in use;
- A/B/C and 1/2/3 keyboard decision shortcuts remain available;
- IMH, Situation, Queue, Resources, and Metrics remain reachable without pointer-only interaction;
- modal focus trapping and focus return remain implemented;
- Escape dismisses modal dialogs;
- visible focus treatment remains 3px with offset;
- primary interactive elements retain a 44px minimum target height;
- live regions continue to announce decision feedback and Operational Intelligence changes;
- reduced-motion behavior remains supported;
- `prefers-contrast: more` strengthens component borders.

### New v14 considerations

The persistent Command Status panel uses visible text labels in addition to color. Green/amber/red underline state is supplementary rather than the only communication mechanism.

Resource progress uses both segmented position and textual current-state / deployed wording. Priority and late state are written into status chips, not conveyed solely through hue.

Incident-specific colors are decorative and intentionally separate from semantic status colors, reducing the risk that a wildfire-orange or chemical-green theme changes the meaning of system state.

### Mobile reflow

The Command Status panel reflows into a two-row grid rather than horizontal scrolling. On smaller phones the Resource Deployment board is progressively reduced because the decision workspace is higher priority; full queue/resource state remains available through the mobile command dock.

### Formal validation boundary

The source review supports a WCAG 2.2 AA-oriented implementation but is not a formal conformance claim. Before an external accessibility certification, complete:

- VoiceOver and NVDA testing;
- 200% and 400% zoom/reflow checks;
- computed contrast measurement;
- keyboard-only walkthrough of every dynamic state;
- representative iOS/Android orientation and text-scaling tests.
