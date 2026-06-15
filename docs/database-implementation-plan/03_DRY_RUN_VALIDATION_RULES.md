# Dry-Run Validation Rules

These rules define what the future loader must check before insert, during promotion, and after load.

## Required Fields By Row Type

### Source Manifest

Required:

- `relative_path`
- `source_root`
- `filename`
- `extension`
- `sha256`
- `size_bytes`
- `source_type`
- `authority_family`
- `approval_status`
- `storage_status`

Blockers:

- invalid SHA-256
- missing path
- unsupported source type
- selected source missing from expanded outputs

### Expanded Chunk

Required:

- `chunk_id`
- `source_manifest_sha256`
- `source_path`
- `source_type`
- `authority_family`
- `corpus_designation`
- `approval_status`
- `production_display_status`
- `chunk_type`
- `text`
- `text_sha256`

Conditional:

- statutes require section or canonical citation unless chunk is metadata
- rules require rule number or canonical citation unless chunk is metadata
- DCS policy chunks require policy number or document type review
- page span must be preserved when present

Blockers:

- missing body text
- text hash mismatch
- invalid source manifest hash
- missing source path
- unknown authority family
- invalid display status
- restricted chunk type with non-restricted display status
- duplicate chunk ID with different text hash

## Controlled Vocabulary Rules

Authority families must match the fixed list:

- `tca_title_36`
- `tca_title_37`
- `tenn_rules_juvenile_practice_procedure`
- `tenn_rules_evidence`
- `dcs_policies_procedures`

Known chunk types include:

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

Unknown chunk type is not automatically production-displayable.

## Display Gate Rules

Production display is allowed only when all are true:

- `approval_status = approved_for_production`
- `production_display_status in ('displayable_black_letter', 'displayable_policy_text')`
- authority version is valid as of the retrieval date
- answer scope allows the query
- retrieval mode allows the chunk type

Restricted classes must remain blocked:

- `annotation_candidate`
- `case_note_candidate`
- `advisory_comment`
- research reference metadata
- `restricted_pending_license_review`
- `internal_qa_only`
- `pending_extraction_qa`

## Effectivity Rules

Effective-dated chunks must be version-partitioned.

Rules:

- one stable `authority_units` row per citation or policy identity
- one `authority_versions` row per current, future, expired, superseded, or unknown-effective text variant
- `valid_to` is exclusive
- current-law retrieval requires an as-of date
- future-effective rows are excluded from current-law mode before `valid_from`
- high-risk sections require manual QA signoff before production promotion

Blockers:

- effective variants collapsed into one current row
- future-effective text returned as current law
- current and future pair not tied to same authority unit
- date overlap without approval

## TRE Rules

TRE rows must:

- map to `tenn_rules_evidence`
- carry `limited_evidentiary_procedural` or guardrail/reference answer scope
- be answerable only for evidence or procedure questions after approval
- be excluded as general juvenile-law authority

## DCS Rules

DCS rows must:

- dedupe by SHA-256
- preserve primary and alias paths in `source_file_memberships`
- preserve DCS chapter when detectable
- preserve document type when detectable
- remain pending extraction QA until approved

Blockers:

- alias path count fails reconciliation
- duplicate DCS source creates duplicate answer support
- selected DCS source has no source hash

## Warning Import Rules

Source-level warnings go to `extraction_warnings`.

Chunk-level warnings go to `chunk_warnings`.

Counts must reconcile:

- summary warning count
- warning JSON count
- per-code warning counts
- chunks with warnings

High-priority warning codes:

- `effective_dated_version_unit`
- `effective_dated_version_text`
- `duplicate_chunk_text`
- `unusually_large_chunk`
- `dcs_dates_undetected`
- `dcs_sections_undetected`
- `extraction_failed`

## Citation Alias Rules

Required checks:

- normalize citation variants
- create canonical alias where available
- create common user aliases where safe
- report collisions
- block unresolved collision where alias maps to conflicting units
- do not let exact citation bypass display gate

## Audit Rules

Every answerable package must be reconstructable from:

- `corpus_builds`
- `source_files`
- `source_file_memberships`
- `authority_units`
- `authority_versions`
- `authority_chunks`
- `citation_aliases`
- `retrieval_logs`
- `answer_audit_records`
- `citation_verification_records`
- `refusal_records` when applicable

Audit reconstruction must recover:

- build version
- pipeline version
- source path
- source hash
- page span when present
- chunk text hash
- version label
- as-of date
- retrieved chunk IDs
- displayed citation aliases
- refusal reason if generation did not proceed
