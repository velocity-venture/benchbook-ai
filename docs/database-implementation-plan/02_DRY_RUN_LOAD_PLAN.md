# Dry-Run Load Plan

This plan is for a later authorized dry run. Phase E1 did not connect to a database or load data.

## Inputs

- `data/source-manifest/SOURCE_MANIFEST.jsonl`
- `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl`
- `data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json`
- `data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json`
- `data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json`
- `data/ingestion-expanded/EXPANDED_SOURCE_SELECTION.json`
- `data/ingestion-expanded/EXPANDED_EXTRACTION_MANIFEST.json`

Ignored derivative files may be read for metadata and load validation. Do not write long legal source text to committed outputs.

## Dry-Run Outputs

A later dry run should write only metadata reports:

- load batch ID
- input file hashes
- table target counts
- rejected row counts by reason
- display gate counts
- version partition counts
- DCS duplicate membership reconciliation
- citation alias collision report
- warning reconciliation
- candidate blockers

Do not write chunk body text, extracted legal text, or large source excerpts.

## Load Sequence

1. Compute input file hashes.
2. Load source manifest rows into staging.
3. Load expanded chunk rows into staging.
4. Load extraction warning JSON into staging.
5. Load deduplication report into staging.
6. Create staged `corpus_builds` row with `validation_status = pending`.
7. Validate source manifest hash reconciliation.
8. Validate chunk text hash reconciliation.
9. Promote source files and source memberships.
10. Promote authority families from fixed seed.
11. Build authority units.
12. Build authority versions.
13. Build authority chunks.
14. Build citation aliases.
15. Load warning rows.
16. Run post-load reconciliation.
17. Mark build as dry-run validated or dry-run failed.

## Required Validation Coverage

### 1. Source Manifest Hash Reconciliation

- Every chunk `source_manifest_sha256` must match exactly one source manifest row.
- Every selected source expected by expanded summary must appear in manifest staging.
- Missing or duplicate manifest hashes are blockers.

### 2. Chunk Text Hash Reconciliation

- Recompute SHA-256 from each chunk text during dry run.
- Compare to `text_sha256`.
- Any mismatch is a blocker.
- Do not print text when reporting mismatch.

### 3. Corpus Build Version Assignment

- Create one dry-run `corpus_builds` row per input bundle.
- Store manifest hash, chunk JSONL hash, pipeline version, summary JSON, source selection metadata, and validation status.
- No retrieval should run without a build ID.

### 4. Authority Family Mapping

- Map Phase C families exactly:
  - `tca_title_36`
  - `tca_title_37`
  - `tenn_rules_juvenile_practice_procedure`
  - `tenn_rules_evidence`
  - `dcs_policies_procedures`
- Unknown family is a blocker.

### 5. Authority Unit And Version Creation

- Build stable units by normalized citation, rule number, or policy identity.
- Create at least one authority version per unit.
- Do not collapse current and future-effective text into one version.

### 6. Version Effectivity Partitioning

- Queue all `effective_dated_version_unit` and `effective_dated_version_text` rows for version QA.
- Split effective versions by unit, source file, effective label, version label, and version text hash.
- Require `valid_from`, `valid_to`, or `requires_effectivity_qa`.

### 7. Current, Future, And Superseded Status

- Assign `current`, `future_effective`, `superseded`, `expired`, or `unknown_effectivity`.
- Current-law views must exclude future-effective rows before their effective date.
- Superseded or expired rows are historical or QA only unless explicitly requested.

### 8. TRE Limited-Scope Handling

- TRE chunks must map to `tenn_rules_evidence`.
- TRE answer scope must be `limited_evidentiary_procedural` or guardrail/reference only.
- TRE cannot become general juvenile-law answer authority.

### 9. DCS SHA-256 Deduplication

- Use the deduplication report.
- Insert one source file per SHA-256.
- Insert primary and alias memberships.
- Preserve DCS chapter and document type where detected.
- Do not duplicate chunks for alias paths.

### 10. Display And License Gates

- `annotation_candidate`, `case_note_candidate`, advisory comments, and research references must stay restricted.
- `pending_extraction_qa` must not become production displayable by load default.
- Exact citation, FTS, and future vector retrieval must all enforce the same gate.

### 11. Annotation, Case-Note, And Editorial Restrictions

- Restricted chunks may be stored only if owner approves storage.
- Restricted chunks must be excluded from production views.
- Restricted chunks must be visible only in internal QA with audit logging.

### 12. Black-Letter-Only Retrieval Eligibility

- Eligible chunk types: `black_letter_text` for statutes and rules.
- Exclude history, advisory comments, annotations, case notes, research references, unknown chunks, and DCS non-policy materials.
- DCS requires separate approved mode.

### 13. Citation Alias Creation

- Insert canonical and common aliases.
- Normalize section symbols, punctuation, spacing, rule prefixes, and policy references.
- Report collisions where one alias maps to multiple units.

### 14. Page Span Preservation

- Preserve `page_start` and `page_end`.
- Validate `page_start <= page_end`.
- Missing pages are warnings unless page spans are expected for that source type.

### 15. Extraction And Chunk Warning Import

- Load source-level warnings into `extraction_warnings`.
- Load chunk-level warnings into `chunk_warnings`.
- Reconcile warning counts against summary and warning JSON.

### 16. Refusal And Audit Support Tables

- Validate that every retrieval path can write `retrieval_logs`.
- Validate that refusals can write `refusal_records`.
- Validate that answer audits can link retrieval, citations, chunks, model metadata, trust metadata, and corpus build.

### 17. No Unsupported Production Display

- Dry-run production-safe views must return zero restricted rows.
- Dry-run production-safe views must return zero pending extraction QA rows.
- If no rows are approved for production, production retrieval may legitimately return zero rows.

## Blocker Handling

Fail the dry run for:

- hash mismatch
- missing source traceability
- duplicate chunk ID with conflicting text hash
- restricted chunk in production display view
- future-effective text in current-law result
- DCS duplicate membership loss
- TRE scope not represented
- citation alias collision without review

Quarantine and report:

- missing optional chapter or part
- unknown DCS document type
- citation missing on metadata chunk
- source warning already captured by Phase C

## Dry-Run Success Criteria

- All counts reconcile or documented differences are owner-approved.
- No restricted or pending rows are production-displayable.
- All chunks have source, build, version, and text hash traceability.
- Effective-dated units are partitioned or blocked for QA.
- DCS duplicate memberships reconcile.
- TRE scope is limited.
- Audit reconstruction has a complete support path.
