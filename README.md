# The Response Game — organizational readiness platform

**v1.0 evaluation release.** A complete UI/runtime restart around configurable micro-simulations, role-based practice, evidence and improvement. This is not a production SaaS service, a live emergency notification system, or a qualification.

## Evaluate the application
Open `index.html` in a browser, or serve the directory using a static web server. No JavaScript build, package installation, API key or third-party account is needed for the browser demo. It stores fictional workspace data in the current browser. Storage refusal produces a warning; export before closing when storage is unavailable.

For the **actual local SQLite development database**, run from this directory:

```sh
python backend/server.py --port 8080
```

Then open `http://127.0.0.1:8080`. The application detects the local development API and saves structured entities to `.local/demo.sqlite3`. Choose another port when 8080 is occupied. Python 3.11+ is recommended. This server binds only to loopback, has **no authentication**, and is intended only for fictional local development data. Do not expose it publicly or import real personnel/plans.

The static/public site and standalone HTML use browser-local demonstration workspaces, not a secure multi-tenant service. Only the local development server uses SQLite. No Supabase project is provisioned by this package.

## What works
- New responsive public site and nine workspace areas; desktop, tablet and mobile layouts.
- Ninety-six authored sector-facing starter configurations across sixteen sectors, using six shared patterns. Each starter is marked review required; variants are not inflated into distinct original exercises.
- Search and filtering, bounded scenario configuration, and configuration snapshots in practice records.
- Group and individual audience selection; inactive/channel-consent exclusions; CSV validation with duplicate/invalid-record quarantine.
- Campaign drafts, rollout intent, delivery previews, and a visible no-live-transport boundary.
- Web practice; local SMS ACK/DETAILS/LATER/HELP/STOP; browser narration with transcript; simulated email and external-task worksheet.
- Decision consequences, pause/resume, coached/observed modes, active versus scenario clocks, rule evidence, written handover, JSON/CSV export and print.
- Linked improvement actions, evidence/reviewer fields and retest guards; actual demo activity updates the dashboard without fake readiness scores.
- Optional relational SQLite persistence, same-origin loopback API, append-only event/observation records in the database, and workspace-specific saves.

## Not activated or validated
No production authentication, SSO, directory/SCIM sync, tenant authorization, private artifact store, live SMS/email/telephone, scheduler, verified external callback, AI grading, automated plan extraction or enforced retention. Voice is browser speech, not a phone call or recorded reply. External worksheet references are self-reported, not provider proof. Typed reviewer names in the demo are not authenticated approvals.

The 96 catalog entries are reviewed neither by an independent practitioner nor by a customer. Specialist plan/jurisdiction/authority review, accessibility evaluation, human usability, security assessment and professional assessment validity remain release gates. A successful rule check is practice evidence, not certification. Do not submit simulated reports to operational systems or emergency/regulatory contacts.

## Source layout
- `index.html`, `styles.css`, `app.js`: responsive public/admin/participant experience.
- `engine.js`: deterministic practice state and validation.
- `catalog.js`, `assets/catalog.json`, `assets/scenario_catalog.csv`: generated starter catalog.
- `build_catalog.py`: maintainable authored sector/pattern/title source; regenerates catalog files.
- `backend/server.py`: loopback SQLite development API; `backend/schema.sql`: unapplied Supabase/PostgreSQL review scaffold.
- `docs/PRODUCT_BLUEPRINT.md`: full product, operating model and release gates.
- `docs/CONTENT_STANDARD.md`, `docs/INTEGRATION_CONTRACTS.md`: content and delivery contracts.
- `assets/product_registers.json`: taxonomy, configuration, delivery and acceptance backlog.
- `tests/`: repeatable rule, database, HTTP and browser checks.
- `qa/QA_REPORT.md`: exact completed checks and remaining acceptance boundaries.
- `trg-sw.js`: narrow retirement worker for the previous app's scope-specific cache; does not delete old browser saves.

## Tests

```sh
node --check app.js
node --check engine.js
node tests/test_engine.cjs
python tests/test_database.py
python tests/test_http.py
```

Browser testing uses `playwright==1.57.0`. Install only for development/CI:

```sh
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/test_browser.py
```

Without `TRG_BASE_URL`, the browser suite injects rendered app content and uses an explicit localStorage test double. That mode does **not** test real origin persistence or network transport. With the local development server running on a **fresh** database, use hosted mode:

```sh
TRG_BASE_URL=http://127.0.0.1:8080 python tests/test_browser.py
```

PowerShell equivalent: `$env:TRG_BASE_URL='http://127.0.0.1:8080'; python tests/test_browser.py`. Set `TRG_CHROMIUM` to a specific Chromium executable when needed. Browser results and screenshots appear in `qa/`. Test data are fictional and distinct from professional acceptance.

## Safe restart and release
The prior main commit `10f5c830b7baa9173fe7fa267a5f5464f3bab12c` was preserved on `archive/pre-readiness-platform-20261013` before replacement work. The new source is a fresh runtime, not another wrapper around the prior game. Keep historical saves and the archive. Do not reset repository history or clear all browser storage to deploy.

Before licensed use, provision the approved backend, implement and test authorization/identity, approve a content pack, activate one controlled delivery channel, and demonstrate security, privacy, accessibility and measurable pilot value. See the blueprint and backlog. Real owners, budgets and deadlines remain unassigned until approved.

## Attribution and assets
The library navigation icon incorporates the Tabler `library` outline SVG retrieved through Supericons; Tabler Icons are MIT-licensed (https://github.com/tabler/tabler-icons). Other simple UI geometry, CSS graphics and scenario text are authored for this release. System fonts are used; no font files are redistributed. No third-party stock photographs, generated disaster images or external analytics are included. Reference documents inform design; they do not endorse or certify the product.
