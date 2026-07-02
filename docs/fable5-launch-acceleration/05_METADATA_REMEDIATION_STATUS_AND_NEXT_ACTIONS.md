# 05 - Metadata Remediation Status and Next Actions

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration

## 1. Where remediation stands

The remediation pipeline is three phases deep and validated at every step:

| Stage | Artifact set | Validation state |
|---|---|---|
| E13A | 9 review-queue CSVs (31 columns, metadata-only) under `docs/preview-corpus-e13/review-queues/` | `validate_e13a_review_queues.py` PASS (re-run in this pass) |
| E14A | 8 draft templates plus 5 corpus-admin checklists under `docs/preview-corpus-e14/` | `validate_e14a_draft_artifacts.py` PASS (re-run in this pass) |
| E14B | 7 populated candidate CSVs (39 columns) plus 4 manifests under `docs/preview-corpus-e14b/` | `validate_e14b_candidate_artifacts.py` PASS (re-run in this pass) |

Every queue row now exists as a candidate row with `current_value`, `proposed_value`, `proposed_action`, `decision_status`, reviewer fields, and `owner_escalation_required`. Nothing has been decided; every candidate is machine-proposed and awaits human review.

## 2. Queue-by-queue status and the exact next action

| Queue | Rows | Candidate disposition | Next action (E14C) | Decision authority |
|---|---:|---|---|---|
| Unresolved identity | 38 | pending_corpus_admin_review | Review each unit/chunk; assign canonical citation or exclude from production; record reviewer and date in the candidate CSV | Corpus admin; owner escalation where marked |
| Unknown effectivity | 54 | pending_effectivity_review | Verify effective date from source PDF page evidence; set valid_from or exclude | Corpus admin |
| QA signoff required | 439 versions | pending_qa_signoff | Execute signoff workflow from `docs/preview-corpus-e13/05_QA_SIGNOFF_WORKFLOW.md`; sign or return each version | Corpus admin |
| DCS document-anchored | 1,146 | guardrail_reference_only_pending_mapping | Default stands (guardrail only). Optional per-document mapping to policy numbers only where the admin affirmatively maps and the owner approves | Owner |
| Restricted Lexis | 2,392 | restricted_internal_qa_only | No display action. License review is a separate owner workstream; rows stay internal-QA-only for launch | Owner plus license review |
| Pending extraction QA | 4,198 | pending_extraction_qa | Sampled extraction QA per `docs/preview-corpus-e13/08_PENDING_EXTRACTION_QA_WORKFLOW.md`; bulk-approve families only on passing samples with recorded sample IDs | Corpus admin |
| DCS handbook reconciliation | 8 rows / 1 issue | evidence_required | Attach provenance evidence to the register; close or accept the historical gap in writing | Owner |

## 3. Critical-path analysis

Not all 8,275 candidate rows gate the internal QA launch equally:

- **Hard gate for any display:** identity (38), effectivity (54), QA signoff (439). These are small queues; the 439 signoffs are version-level checkbox work driven by an existing workflow doc. This is days of corpus-admin effort, not weeks.
- **Hard gate for volume:** pending extraction QA (4,198) blocks the bulk of the corpus. The E13 workflow already allows family-level sampled QA. The practical internal-QA corpus is whatever passes sampled extraction QA plus the three small queues.
- **Not on the internal QA critical path:** DCS mapping (guardrail-only default is the launch posture), restricted Lexis (non-display is the launch posture), DCS handbook (documentation closure).

A viable internal QA corpus therefore requires: 38 + 54 + 439 decisions plus sampled extraction QA over the statute and rule families. DCS and restricted classes launch as reference-only and non-display respectively, exactly as already gated.

## 4. What E14C should be (recommended next execution phase)

E14C, local-only corpus-admin review support, as recommended in `docs/preview-corpus-e14b/14_OWNER_DECISION_PACKET.md`:

1. Review-session tooling that walks the candidate CSVs queue by queue and records decisions into the decision columns (local file edits of the candidate artifacts only; the E14B validator re-run after each session).
2. Priority order: identity, then effectivity, then QA signoff, then extraction-QA sampling for tca_title_36, tca_title_37, tenn_rules_juvenile_practice_procedure, tenn_rules_evidence, in that order. DCS last.
3. Output: reviewed candidate CSVs where `decision_status` moves from pending_* to approved/rejected/escalated per row, plus a patch-manifest regeneration and re-validation.
4. Exit criteria: zero rows in decision_status pending_* for the three small queues; sampled extraction-QA decisions recorded per family; owner escalation list produced.

Only after E14C completes does E15 (preview reload planning, then separately-approved execution) become actionable. This pass prepared the E15 readiness audit in doc 06 so no analysis time is lost when the owner approves.

## 5. Prohibited shortcuts (do not do these)

- Do not bulk-set decision_status to approved to zero the queues. Every row needs a reviewer identity and date; the validator and audit trail assume it.
- Do not patch the preview database in place ad hoc. Patches flow only through reviewed candidate artifacts into a planned reload.
- Do not open display gates for rows whose version lacks QA signoff even if identity and effectivity pass.
- Do not treat DCS mapping as bulk-approvable; each mapping is an individual authority decision.
