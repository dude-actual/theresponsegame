# Integration and state-machine contracts
Version 1.0 · Proposed production behavior. No live adapter is installed in this release.

## Commands, not arbitrary record writes
The authenticated server accepts a command with a client-generated idempotency key, expected session version and supported action type. It derives the user from the verified session/token and the tenant from active membership. A tenant ID in a request body is not authorization. It locks/checks the session, validates compatibility and role, appends an event, advances state and inserts any outbound work in ONE transaction. Repeated requests return the original command result; conflicting expected versions return a conflict, not a silent overwrite.

Suggested routes: POST /v1/campaigns/{id}/approve; POST /v1/campaigns/{id}/launch; POST /v1/sessions/{id}/commands; POST /v1/integrations/{id}/receipts; POST /v1/actions/{id}/verify. These are contracts, NOT implemented routes. The implemented local development API is documented in README.

## Dispatch gate
Before each send, require an active organization/license, approved campaign/configuration/content, current eligible participant, authorized and verified contact, applicable consent, no opt-out/hold/stop, permitted local-time window, quota/fatigue headroom, healthy adapter, compatible channel and an unexpired expected session state. Recheck at dequeue and immediately before the provider call. Failure records an explicit exclusion/cancellation; it does not cause an uncontrolled alternate-channel send.

## Independent lifecycle states
| Object | States | Important invariant |
|---|---|---|
| Campaign | draft, approved, scheduled, running, paused, stopped, closed | A saved schedule is not a running scheduler. |
| Delivery | queued, claimed, sent, delivered, bounced, rejected, unknown, canceled | Provider delivery is not participant acknowledgment. |
| Session | not_started, active, paused, stopped, expired, completed, invalidated | STOP and delivery failure are not automatic failed assessments. |
| Evidence | rule_event, self_report, submitted_artifact, verified_callback, human_observation | Evidence class remains visible in reports. |
| Assessment | not_observed, met, partially_met, unmet, pending_review | A submitted paragraph is not verified judgment. |
| Improvement | open, in_progress, ready_for_review, verified, reopened, retired | Verification requires accountable approval and appropriate evidence. |

A pause prevents new scheduled injects; it does not recall a message already accepted by a provider. A global stop cancels queued work, prevents new retries and records what was already sent. Real-incident suspension needs a designated authorized control path, not keyword guessing from an unrelated operational message.

## Generic external-task event
```json
{
  "schema_version": "1.0",
  "provider_event_id": "unique-provider-event",
  "integration_id": "server-resolved-integration",
  "session_id": "opaque-session-uuid",
  "task_id": "approved-task-key",
  "issued_nonce": "single-use-server-issued-nonce",
  "event_type": "task.submitted",
  "occurred_at": "2026-10-13T15:00:00Z",
  "external_subject_id": "approved-directory-subject",
  "evidence_reference": "approved-training-system-record-id",
  "content_hash": "sha256-of-approved-artifact"
}
```
The request must be authenticated using the provider-specific mechanism. Derive organization and scope from the registered integration and server-issued task record; compare subject, nonce, task, state and expiration. Store provider occurrence and server receipt times. Reject replay, cross-tenant references, wrong subject, unknown task, expired nonce and unapproved evidence destination. Do not fetch arbitrary evidence URLs. A submitted event may advance the workflow but does not automatically mark the work correct.

## Provider-specific checks
SMS/voice: approved sender/account, number validation, applicable consent, separate recording permission, STOP/HELP, no real emergency numbers, request signatures, bounded retries, cost ceilings, correct exercise labeling. Voice uncertainty produces clarification or review, never an assumed high-stakes intent.

Email: verified sender domain, training identity, bounce/suppression handling, secure task link, narrow payload, no reliance on tracking pixels for assessment. Collaboration cards: approved organization app, least-privilege scopes, signed interactions, installation/tenant verification and revoked-user checks.

Directory: SCIM/API source ownership, immutable external identity, inactive/deleted semantics, incremental sync, reconciliation queue, group provenance and disable-not-delete history. SSO: trusted issuer/audience, explicit tenant binding, approved domains, session expiration and revoked membership behavior. Never grant an application administrator role from user-editable profile fields.

## Operational acceptance
Test duplicates, out-of-order callbacks, expired links, wrong person, wrong tenant, wrong numbers, opted-out users, provider outage, daylight-saving changes, quiet windows, retry storms, real-incident stop, quota exhaustion, deprovisioning, malicious artifacts and signed-link leakage. Tests must show both permitted and denied cases. No “Connected” indicator until a provider-specific sandbox round trip and denied-path tests pass.
