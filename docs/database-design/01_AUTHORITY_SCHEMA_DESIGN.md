# Authority Schema Design

## Purpose

BenchBook.AI needs a legal authority database that preserves source traceability, authority hierarchy, effectivity, display restrictions, retrieval indexes, and answer audit records. The design below is additive. It does not replace current app tables, and it does not assume production corpus approval.

The recommended database namespace is `legal_authority`.

## Core Entities

### `corpus_builds`

One row per approved or staged corpus build. A build records the manifest hash, source selection, extraction pipeline version, chunk file hash, load status, and approval status. Retrieval and answers should always record the `corpus_build_id` used.

Key fields:

- `build_id`
- `build_version`
- `manifest_sha256`
- `chunk_jsonl_sha256`
- `extraction_pipeline_version`
- `source_selection`
- `approval_status`
- `validation_status`
- `loaded_at`

### `source_files`

One row per unique source file hash. For DCS duplicates, the file hash is the document identity. Paths are not unique document identities because the same PDF can appear under more than one DCS chapter.

Key fields:

- `source_file_id`
- `source_manifest_sha256`
- `sha256`
- `primary_source_path`
- `filename`
- `source_type`
- `authority_family_code`
- `approval_status`
- `storage_status`
- `metadata`

### `source_file_memberships`

Many-to-many path and chapter memberships for a source file. This table preserves DCS alias paths and chapter membership without duplicating chunks.

Key fields:

- `membership_id`
- `source_file_id`
- `source_path`
- `path_role` such as `primary`, `alias`, `manifest_path`
- `dcs_chapter`
- `document_type`
- `is_selected_for_build`

### `authority_families`

Controlled vocabulary for authority families and their default retrieval behavior.

Required families:

- `tca_title_36`
- `tca_title_37`
- `tenn_rules_juvenile_practice_procedure`
- `tenn_rules_evidence`
- `dcs_policies_procedures`

Important TRE setting:

- `tenn_rules_evidence.answer_scope = limited_evidentiary_procedural`

### `authority_units`

The stable legal unit independent of version. A Tennessee Code section, juvenile rule, evidence rule, or DCS policy number should have one authority unit even if it has multiple effective versions.

Key fields:

- `authority_unit_id`
- `authority_family_id`
- `source_type`
- `canonical_citation`
- `normalized_citation`
- `title`
- `chapter`
- `part`
- `section`
- `rule_number`
- `policy_number`
- `policy_chapter`
- `document_type`
- `hierarchy_path`
- `answer_scope`

### `authority_versions`

The version-partitioning table. Current and future-effective text must never be collapsed into one row.

Key fields:

- `authority_version_id`
- `authority_unit_id`
- `source_file_id`
- `corpus_build_id`
- `source_version_label`
- `authority_version_label`
- `effective_label`
- `valid_from`
- `valid_to`
- `version_status`
- `supersedes_authority_version_id`
- `superseded_by_authority_version_id`
- `has_effective_date_warning`
- `requires_effectivity_qa`
- `version_text_hash`

Version statuses:

- `current`
- `future_effective`
- `superseded`
- `expired`
- `unknown_effectivity`

### `authority_chunks`

The retrievable text units. Each chunk points to exactly one authority version and one source file. It carries display, approval, traceability, FTS, and vector index fields.

Key fields:

- `authority_chunk_id`
- `source_chunk_id` from Phase C JSONL
- `authority_version_id`
- `source_file_id`
- `corpus_build_id`
- `chunk_type`
- `text`
- `text_sha256`
- `page_start`
- `page_end`
- `production_display_status`
- `retrieval_display_gate`
- `approval_status`
- `validation_status`
- `answer_scope`
- `tsv`
- `embedding`
- `metadata`

Chunk types must preserve the Phase C values, including:

- `black_letter_text`
- `history`
- `advisory_comment`
- `annotation_candidate`
- `case_note_candidate`
- `policy_text`
- `protocol`
- `guide`
- `work_aid`
- `manual`
- `metadata`
- `unknown`

### `citation_aliases`

Deterministic citation lookup. Every normalized citation variant should point to an authority unit and optionally a version or chunk.

Key fields:

- `citation_alias_id`
- `authority_unit_id`
- `authority_version_id`
- `alias_text`
- `normalized_alias`
- `alias_kind`

Examples of alias kinds:

- `canonical`
- `short`
- `source_export`
- `user_common`
- `legacy_app`

### `chunk_relationships`

Explicit relationships across chunks and authority units.

Examples:

- history chunk relates to black-letter chunk
- restricted case-note candidate relates to an authority unit but is not displayable
- DCS policy references another DCS policy
- statute references rule
- chunk supersedes another chunk

### Warnings And QA Tables

`extraction_warnings` captures source-file or run-level warnings. `chunk_warnings` captures warnings tied to specific chunks. Both support QA dashboards and blocking checks.

### Audit Tables

Required audit tables:

- `retrieval_logs`
- `answer_audit_records`
- `citation_verification_records`
- `refusal_records`

Retrieval logs should record strategy, filters, candidate chunks, accepted chunks, scores, reranking features, and corpus build. Answer audit records should preserve model, prompt package metadata, retrieved chunk IDs, displayed citation IDs, unsupported proposition flags, and refusal status.

## Separation Of Legal Text Classes

The schema must make these classes queryable and enforceable:

| Class | Storage | Default production use |
|---|---|---|
| Black-letter statutes and rules | `authority_chunks.chunk_type = black_letter_text` | Answerable only after approval and currentness filters pass |
| DCS policy text | DCS chunk types such as `policy_text`, `protocol`, `guide`, `manual`, `work_aid` | Staged answerable only after extraction QA and policy approval |
| History | `history` | Usually citation context, not answer proposition unless explicitly approved |
| Advisory comments | `advisory_comment` | Restricted until license/display approval |
| Lexis annotations | `annotation_candidate` | Restricted, production answer exclusion |
| Case notes | `case_note_candidate` | Restricted, production answer exclusion |
| Research references | covered by `annotation_candidate` or metadata | Restricted, production answer exclusion |

## Traceability Chain

Every answer chunk must trace to:

1. `corpus_builds.build_version`
2. `source_files.source_manifest_sha256`
3. `source_files.primary_source_path`
4. `source_files.sha256`
5. `source_file_memberships.source_path`
6. `authority_versions.source_version_label`
7. `authority_chunks.page_start` and `page_end`
8. `authority_chunks.text_sha256`
9. extraction pipeline version on `corpus_builds`

## RLS And Access Posture

Legal authority tables are not user-owned in the same way chat sessions are. Recommended policy:

- Authority read access: authenticated users only, filtered through display and approval views.
- Restricted chunks: service role and internal QA role only.
- Audit records: user-scoped where tied to a user, service role for full audit.
- Build and load tables: service role only for writes.

Production application code should query views or RPC functions that enforce display gates and effective-date filters, not raw chunk tables.

