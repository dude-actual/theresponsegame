# Assumptions and decisions

| ID | Decision / reversible assumption | Basis and limit |
|---|---|---|
| AD-01 | Run a fictional internal rehearsal, not a customer rollout. | Master prompt permits browser/local mode; production identity, customer data and external communications are not authorized. |
| AD-02 | Keep existing public domain/repository and archive. | Baseline main is `ca51c7379e4d09a6a8d6af6fdd338e753879ae2e`. Changes go through one feature PR. Roll back by reverting that PR; never clear browser data to roll back. |
| AD-03 | Use a separate `trg-pilot-v2` IndexedDB database. | Preserve v1 browser history. Transactions, expected revisions, idempotency and replay improve reliability but do not create a trusted security boundary. |
| AD-04 | Author four task models plus two transfer conditions. | Escalation, evidence reconciliation, resource status and handover. Escalation/resource transfer pairs support the first complete correction cycle; other transfer variants remain explicit backlog work. |
| AD-05 | Keep source and assessment judgments unapproved. | Synthetic source excerpts are identified/versioned; checking the source box acknowledges reading, not professional approval. No actual human reviewer is named without their acceptance. |
| AD-06 | Let the existing branch-based Pages build render release metadata. | Remove `.nojekyll`; two small Jekyll manifests render `site.github.build_revision` and build time. App JS/CSS remain static. This avoids changing DNS, billing or Pages account settings. Verify the built result before claiming deployment. |
| AD-07 | Keep active and scenario clocks separate. | Five-second active-time checkpoints; abrupt process loss can omit one interval. No offline elapsed-time inference. Time is evidence, not a pass/fail grade. |
| AD-08 | Pin test tools and record their execution. | Playwright 1.57.0; axe-core 4.10.3. No npm production-runtime packages. Hosted browser testing is necessary because container navigation is administratively blocked. |
| AD-09 | Distinguish agent tests from independent acceptance. | Scripted personas and agent visual review do not count as real participant learning, practitioner approval, independent security review or assistive-technology acceptance. |
| AD-10 | Use bounded lexical/structural repetition screening. | Flags are review candidates, not automatic evidence of learning diversity. A full semantic model and human adjudication remain open. |

No production credentials, paid infrastructure, real roster, confidential plan or live communication has been introduced. Real owner assignments and dates for open governance work are not invented; the backlog contains owner roles with unassigned people.
