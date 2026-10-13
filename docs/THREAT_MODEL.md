# Threat model — fictional evaluation boundary

## Assets and trust boundaries
The pilot stores fictional assignments, written work, reviewer-entered judgments and action history. Browser storage is controlled by the local user; it is not a protected organizational system of record. The public repository and Pages site are public. The optional Python/SQLite service listens only on loopback and remains unauthenticated development software.

| Entry / risk | Implemented control | Remaining boundary |
|---|---|---|
| Written HTML/script content | Escaped rendering; browser injection regression | Not a general uploaded-file service. No file upload or arbitrary content execution is enabled. |
| Duplicate/stale commands | Idempotency fingerprint, revision check, atomic IDB state/event write | Not a server-side authorization guarantee. |
| Corrupt or altered local projection | Event replay on load, event-store comparison, raw recovery export | A determined device user can modify both state and events. Hash is not a signature. |
| Wrong role/record | Explicit rehearsal role matrix and org-scoped references | Any user can select a demo persona. Real identity/membership/entitlements need a trusted backend. |
| Roster import and spreadsheet payloads | Size/row/field bounds; duplicate/prototype header rejection; formula-prefix neutralization; fictional address requirement | Import UI cannot establish consent or HR authority. |
| Legacy local history replacement | Transaction rejects changing/removing terminal records; event content immutable | Development SQLite is not multitenant production storage. |
| Export leakage | Explicit fictional-data boundary; scoped export of this local workspace | No real personal/customer data is permitted. Export is not encrypted. |
| External requests/callback forgery | No live providers/callback endpoints in pilot | Signature, nonce, replay, rate limiting, outbox and provider failure controls must be built before connection. |
| Dependency/secret exposure | Static source scan; test-only pinned dependency and lock; no production keys | Regex scanning is limited; independent assessment remains open. |
| Backup/retention/deletion | User export and recovery preserve evidence; legacy DB dump/restore tested | Automated encrypted backup, legal hold, restore imports and retention enforcement are not implemented. |

## Prohibited use and stop boundary
Do not import real rosters, confidential plans, regulated data or credentials. Do not connect operational notification destinations or emergency/regulatory contacts. If such data is accidentally entered, stop testing, avoid redistributing exports, and arrange authorized handling; this build has no compliant retention/deletion service.

Independent security acceptance has not been obtained. A cloud release requires deny-by-default authorization across records, files, reports and exports; exact entitlement checks; tenant-aware database constraints/RLS; immutable server events; private storage; transactional outbox; verified callbacks; abuse limits; and measured backup/restore.
