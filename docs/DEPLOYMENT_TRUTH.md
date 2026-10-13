# Deployment truth

## Baseline observation
| Item | Expected | Observed | Discrepancy / action |
|---|---|---|---|
| Public application | Readiness evaluation, not old Resources Unit game | Fresh HTTP 200 scrape showed `data-release="readiness-1.0.0"` and the readiness landing/workspace | No wrong-site defect. |
| Default branch | Current source baseline | GitHub `main` = `ca51c7379e4d09a6a8d6af6fdd338e753879ae2e` | Matched mounted verified source archive on runtime file blob hashes. |
| Pages deployment | Default-branch static site | GitHub run 38440326388, dynamic Pages build/deployment, success at baseline SHA | Branch deployment is functioning. No DNS changes needed or made. |
| In-product provenance | Build SHA, version, time, environment | Version only; no reliable SHA/time manifest | Fixed in v2 source by build-rendered release/health manifests and Release & limits panel; final deployment must be checked. |
| Last verification claim | Reproducible tests | Re-ran engine, Python and rendered regression suite | Baseline report under `qa/pilot/baseline/`; native container navigation blocked and explicitly separated. |
| Archive | Recoverable pre-rebuild | `archive/pre-readiness-platform-20261013` preserved, original baseline `10f5c830b7baa9173fe7fa267a5f5464f3bab12c` | No deletion requested by this controlling brief. |

## Release mechanism and verification
The public `release.json` and `health.json` are **static release manifests**, not live backend health checks. Their source contains a small Jekyll template. The existing GitHub Pages build fills in its exact source commit and build timestamp. `_config.yml` excludes development code, tests, QA records and internal documentation from site publication; those remain in the repository. Runtime JS/CSS are copied unchanged.

The loopback server renders equivalent metadata from its actual environment but labels it local; a local server start is not a public deployment timestamp. The panel displays unavailable metadata honestly rather than assuming a commit.

Verification order: successful PR checks on the exact candidate -> merge -> successful Pages deployment -> fresh public release JSON -> compare `sourceCommit` to deployed commit -> verify runtime hashes and `#/pilot` navigation. Do not equate a pushed branch or green unit test with deployment. Record observed release evidence in `RELEASE_EVIDENCE.md` and its cited CI artifacts.

DNS/caching boundaries: successful HTTPS retrieval and unchanged CNAME were observed; a complete DNS/resolver/CDN audit was not performed. The retired service worker remains available to release old caches. No new promise of reopening offline is made.

Sources: GitHub Docs, “About GitHub Pages and Jekyll”; GitHub Metadata configuration (`JEKYLL_BUILD_REVISION` defaults to source HEAD). These support build metadata, not a claim of production platform security.
