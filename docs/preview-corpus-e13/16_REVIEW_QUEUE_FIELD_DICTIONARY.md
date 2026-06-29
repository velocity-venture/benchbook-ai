# Review Queue Field Dictionary

Date: 2026-06-29

## Purpose

This dictionary defines the metadata-only fields used in the E13-A review queues. The fields are for corpus-admin triage only. They do not approve production display, app integration, embeddings, or remote writes.

## Allowed fields

| Field | Purpose | Required | May affect production eligibility |
|---|---|---|---|
| `queue_category` | Identifies the review queue and blocker class. | Yes | Yes |
| `priority` | Sets review order. | Yes | No |
| `source_type` | Identifies statute, rule, DCS policy, or metadata source class. | Yes | Yes |
| `authority_family` | Identifies V1 corpus family. | Yes | Yes |
| `source_file` | Filename-level source identifier. | Yes | Yes |
| `source_sha256` | Source-file hash for provenance checks. | Yes when available | Yes |
| `source_path` | Local metadata path to source file. | Yes when available | Yes |
| `chunk_id` | Source chunk identifier for chunk-level rows. | Required for chunk queues | Yes |
| `authority_unit_id` | Derived authority unit identifier from local dry-run mapping. | Yes when available | Yes |
| `authority_version_id` | Derived authority version identifier from local dry-run mapping. | Yes when available | Yes |
| `citation` | Metadata citation, rule, section, or policy identifier. | Required when available | Yes |
| `normalized_citation` | Normalized identifier used for collision checks. | Required when citation exists | Yes |
| `title` | Metadata title or heading only. | Optional | Yes |
| `rule_number` | Rule number metadata. | Required for rule rows when available | Yes |
| `section` | Section metadata. | Required for statute rows when available | Yes |
| `policy_number` | DCS policy number metadata. | Required for DCS policy rows when available | Yes |
| `policy_chapter` | DCS chapter metadata. | Required for DCS rows when available | Yes |
| `document_type` | Document type such as protocol, manual, guide, or rule. | Yes when available | Yes |
| `display_status` | Current display gate status. | Yes | Yes |
| `answer_scope` | Current answer-authority scope. | Yes | Yes |
| `version_status` | Current, future-effective, or unknown-effectivity status. | Yes for version queues | Yes |
| `effective_label` | Short metadata-only effective-date label. | Required when present | Yes |
| `valid_from` | Parsed effective start date. | Required when known | Yes |
| `valid_to` | Parsed end date. | Required when known | Yes |
| `requires_qa_signoff` | Whether corpus-admin signoff is required. | Yes | Yes |
| `warning_category` | Metadata warning class or risk cue. | Yes | Yes |
| `proposed_action` | Default triage action. | Yes | Yes |
| `reviewer_role` | Required reviewer role. | Yes | No |
| `production_impact` | Why the row blocks or affects production readiness. | Yes | Yes |
| `stop_condition` | Condition that prevents promotion or display. | Yes | Yes |
| `notes` | Metadata-only queue note. | Optional | Sometimes |

## Prohibited fields

The queues must not contain fields named `text`, `chunk_text`, `body`, `body_text`, `source_text`, `content`, `excerpt`, `full_text`, `page_text`, `ocr_text`, or similar fields.

These fields are prohibited because the E13-A package is a metadata-only review packet. It must not print or commit legal body passages, source passages, page text, OCR output, or long excerpts. Any source review requiring body passages must happen in a separately approved corpus-admin workflow and must not be copied into these queues.

## Production boundary

Fields may help a future reviewer decide whether a local metadata remediation should be proposed. They do not themselves change approval status, display status, retrieval behavior, embeddings, or app integration.
