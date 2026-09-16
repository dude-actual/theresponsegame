# QA Report — Resource Run v13 RC1

## Scope

Release-candidate QA covers source review, automated syntax / engine smoke tests, responsive-design guardrails, interaction-risk review, and persistence / service integration review.

## Automated checks

A GitHub Actions workflow now runs on main pushes and pull requests.

Checks include:

- Node syntax validation for simulation and v13 experience files;
- engine start / decision smoke tests across every incident pack and every role combination;
- deterministic Daily Challenge generation;
- score-range validation;
- accessibility CSS guardrails for target size, focus visibility, and reduced motion.

Current smoke-test matrix: 10 incident packs × 7 roles = **70 incident / role combinations**.

## High-risk defects addressed

- prioritization feedback being cleared by immediate re-render;
- dialog focus not being trapped or returned;
- passive onboarding creating unnecessary clicks;
- no professional audio feedback architecture;
- no retention cadence outside session-level progression;
- unnecessary mobile backdrop blur;
- repeated queue / inventory / map DOM writes when state had not changed;
- insufficient narrative visibility for conditions and consequences;
- no static-asset service-worker cache.

## Regression-risk areas

1. Service-worker cache versioning after future releases.
2. Long organization-specific IMH text inside compact mobile dialogs.
3. Very long incident / role names supplied by future plug-ins.
4. Remote organizational leaderboard payloads that do not match the documented adapter.
5. Safari Web Audio behavior before the first user gesture.

## Manual verification still recommended before a formal external release

- iPhone Safari current + previous major iOS;
- iPhone Edge / Chromium shell;
- Android Chrome;
- Windows Edge at 100%, 125%, and 200% zoom;
- macOS Safari;
- keyboard-only navigation;
- VoiceOver / NVDA smoke test;
- slow 4G and offline reload behavior;
- service-worker update from the prior production build to the next build.

No device-lab test is claimed where one has not actually been run.
