# Product invariants

1. The workspace starts with fictional identities only and zero activity. Seed identities do not count as participation.
2. A command belongs to one organization and known record relationships. Browser checks are reliability controls, not trusted authorization.
3. A duplicate key with the same payload creates no second effect; different payload reuse is rejected. A stale expected revision cannot overwrite a newer transaction.
4. Event sequence and UTC timestamps do not move backward. Late commands do not rewind completed history.
5. Campaign/session source, scenario, configuration and rubric snapshots remain frozen. Review amendments and invalidations are separate history, not edits to completed work.
6. Acknowledgment/launch, completed work, rule checks, evaluator decisions, owner evidence and verification are separate records.
7. Free text is never automatically judged correct. Rule checks only compare supplied synthetic conditions.
8. An action cannot be verified from completion alone, an unrelated retest, an unreviewed retest, an invalidated session, unresolved appeal or wrong verifier.
9. Retest belongs to the original action and participant and uses an explicitly linked different condition/evidence set.
10. Original finding, owner evidence, retest and review IDs survive verification. Historical verification records are not a permanent certification; later invalidations/revisions remain visible for reassessment.
11. Paused/stopped/expired sessions accumulate no active work time. Stopping is not a fabricated failure grade.
12. No live messages are scheduled or sent. No callback, signed URL, secure cloud tenant, operational dispatch or legal compliance is simulated as connected.
13. Every displayed metric provides its numerator/denominator record IDs. No universal readiness score is calculated.
14. Unreadable state is preserved. Recovery exports do not silently reset or overwrite history.

Executable evidence: `tests/pilot/test_domain.cjs`, `test_regressions.cjs`, `test_history.py`, and the native browser suite. Targeted mutation tests challenge eight critical guards; they are not exhaustive proof.
