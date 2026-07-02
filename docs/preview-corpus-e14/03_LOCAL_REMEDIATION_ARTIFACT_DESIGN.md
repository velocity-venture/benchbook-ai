# Local Remediation Artifact Design

Date: 2026-06-29

## Design goal

The E14-A artifact design lets a corpus administrator record metadata-only decisions in a repeatable way without changing the active loader, active ingestion scripts, migrations, app code, source PDFs, generated corpus source files, or any remote database.

## Artifact principles

- Metadata only.
- Header-driven and validator-friendly.
- No legal body text or long excerpts.
- No secrets or connection details.
- No active write target paths.
- No production-display effect by itself.
- Every template includes reviewer, proposed action, decision status, owner escalation, production impact, and stop-condition fields.

## Shared decision vocabulary

Allowed decision outcomes:

- Adopt
- Adopt with revision
- Archive
- Reject
- Needs further review

Allowed decision status values for future filled artifacts:

- Draft
- Not started
- In review
- Owner review required
- Approved for future local patch-map consideration
- Rejected
- Archived

## Shared metadata columns

The templates reuse the E13-A field dictionary where practical:

`queue_category, priority, source_type, authority_family, source_file, source_sha256, source_path, chunk_id, authority_unit_id, authority_version_id, citation, normalized_citation, title, rule_number, section, policy_number, policy_chapter, document_type, display_status, answer_scope, version_status, effective_label, valid_from, valid_to, requires_qa_signoff, warning_category, current_value, proposed_value, proposed_action, decision_status, reviewer_role, reviewer_name, review_date, owner_escalation_required, production_impact, stop_condition, notes`

## Prohibited columns

These columns are not allowed in E14-A draft artifacts:

`text, chunk_text, body, body_text, source_text, content, excerpt, full_text, page_text, ocr_text`

## Application boundary

Future patch maps should be treated as proposed local metadata only. A later phase would need separate approval to decide whether to apply any patch map to a local transformed copy, active loader input, preview reload plan, or remote database.

## Privacy boundary

These artifacts must not contain court-specific local rules, juvenile case facts, student records, litigant information, or private court data. If local juvenile rules are added in a future phase, they must remain court-private and must be distinguished from statewide authority.
