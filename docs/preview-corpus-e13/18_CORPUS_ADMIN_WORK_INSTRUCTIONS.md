# Corpus Admin Work Instructions

Date: 2026-06-29

## Review posture

Work from the queues in `docs/preview-corpus-e13/review-queues/`. Record decisions as metadata decisions only. Do not change production display, app retrieval, embeddings, remote data, migrations, existing loader scripts, or source PDFs without separate owner approval.

## Unresolved identity rows

1. Start with `unresolved_identity_chunks.csv`, then reconcile with `unresolved_identity_units.csv`.
2. Verify source file, source hash, authority family, document type, and warning category.
3. Classify each row as Adopt, Adopt with revision, Archive, Reject, or Needs further review.
4. For DCS rows, decide whether the row is document-anchored guardrail material, a map-to-policy candidate, or a production exclusion.
5. Escalate to Judge Eckel if identity cannot be resolved from metadata or would require a legal-authority judgment.

## Unknown effectivity rows

1. Review `unknown_effectivity_versions.csv` before `unknown_effectivity_chunks.csv`.
2. Confirm whether the row is current, future-effective, superseded, or unknown.
3. Verify effective-date metadata and as-of-date behavior.
4. Keep every unknown-effectivity row excluded until status is verified.
5. Escalate high-risk juvenile or family-law rows to Judge Eckel if current-law status is ambiguous.

## DCS document-anchored rows

1. Use `dcs_document_anchored_summary.csv`.
2. Keep the default action as Adopt with revision as guardrail/reference only.
3. Require DCS source currency, policy identity, and manual mapping before any higher authority status.
4. Stop if production-answer authority would be inferred from document title, filename, or topic alone.

## Restricted Lexis rows

1. Use `restricted_lexis_content_summary.csv`.
2. Keep annotations, case notes, advisory comments, and editorial material internal QA only.
3. Do not use restricted material for production display, source cards, or independent case-law verification.
4. Escalate any display proposal to Judge Eckel and license review.

## Pending extraction QA rows

1. Use `pending_extraction_qa_summary.csv`.
2. Prioritize black-letter statutory and rule rows before support material.
3. Resolve effectivity warnings before any display discussion.
4. Keep history, metadata, unknown, guide, and work-aid rows out of answer authority unless separately approved.

## Recording a decision

Record reviewer role, date, proposed action, evidence reviewed, production impact, stop condition, and escalation status. Keep the record metadata-only. Do not paste legal passages into the queue.

## Must escalate to Judge Eckel

- Any production display proposal.
- Any DCS production-answer authority proposal.
- Any restricted Lexis display or answer-authority proposal.
- Any ambiguous current-law decision in a high-risk juvenile or family-law domain.
- Any proposal to modify loader behavior, migrations, source manifests, source PDFs, app code, or remote data.

## Must never change without owner approval

- Display gates.
- App integration.
- Embeddings.
- Remote Supabase data.
- Production project settings.
- V1 corpus scope.
- Titles 39, 40, or 55.
- Web retrieval.
