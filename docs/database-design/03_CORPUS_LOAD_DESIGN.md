# Corpus Load Design

## Scope

This is a design for a future load phase. It is not permission to load a database, apply migrations, generate embeddings, replace the production corpus, or modify app code.

Input files:

- `data/source-manifest/SOURCE_MANIFEST.jsonl`
- `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl`
- `data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json`
- `data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json`
- `data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json`
- `data/ingestion-expanded/EXPANDED_SOURCE_SELECTION.json`
- `data/ingestion-expanded/EXPANDED_EXTRACTION_MANIFEST.json`

## Load Principles

1. Load into staging tables first.
2. Reject or quarantine rows that lack required traceability fields.
3. Create a `corpus_builds` row before inserting authority rows.
4. Upsert `authority_families` from a fixed seed.
5. Upsert `source_files` by source SHA-256.
6. Insert `source_file_memberships` for primary and alias paths.
7. Build `authority_units` from normalized citation or policy identity.
8. Build `authority_versions` from effective labels, source version labels, date parsing, and warning flags.
9. Insert `authority_chunks` only after their authority unit, version, source file, and build are present.
10. Insert citation aliases after authority units exist.
11. Insert warning rows last, linking to source files and chunks where possible.
12. Do not populate embeddings during the load. Embeddings require a separate approved phase.

## Staging Tables

Recommended temporary or durable staging tables:

- `legal_authority_stage.raw_source_manifest`
- `legal_authority_stage.raw_expanded_chunks`
- `legal_authority_stage.raw_extraction_warnings`
- `legal_authority_stage.raw_deduplication_groups`
- `legal_authority_stage.load_errors`

Store the raw JSONB row and parsed columns. The staging layer should contain a `load_batch_id`, input file hash, source line number, and validation status.

## Required Validations Before Promotion

For each chunk row:

- `chunk_id` exists and is unique.
- `source_manifest_sha256` is a 64-character SHA-256.
- `source_path` is present.
- `source_type` is one of the expected source types.
- `authority_family` is one of the expected families.
- `corpus_designation` is present.
- `approval_status` is present.
- `production_display_status` is present.
- `chunk_type` is present.
- `text` is present.
- `text_sha256` matches the loaded text.
- `page_start <= page_end` when both exist.
- restricted chunk types have `production_display_status = restricted_pending_license_review`.
- TRE rows carry the limited-answer `answer_scope_note`.
- effective-dated rows are flagged for version partitioning.

## Source File Load

`source_files` should be loaded from the manifest first. The Phase C chunks carry `source_manifest_sha256`; the load should verify that hash against `SOURCE_MANIFEST.jsonl`.

For DCS duplicates:

- Use `EXPANDED_DEDUPLICATION_REPORT.json`.
- Insert one `source_files` row per SHA-256.
- Insert one `source_file_memberships` row for the primary path.
- Insert one membership row for each alias path.
- Preserve DCS chapter and document type on each membership when detectable.
- Do not duplicate authority chunks for alias paths.

## Authority Unit Construction

Statutes:

- Unit key: authority family plus normalized section citation.
- Preserve `chapter`, `part`, `section`, and `hierarchy_path`.

TRJPP and TRE:

- Unit key: authority family plus normalized rule number.
- TRE gets `answer_scope = limited_evidentiary_procedural`.

DCS:

- Unit key: authority family plus normalized policy number and policy chapter.
- Preserve document type when possible: `policy`, `protocol`, `guide`, `work_aid`, `manual`, `handbook`, `metadata`, `unknown`, and other observed values.

## Authority Version Construction

Every authority unit needs at least one version row. If the Phase C title or warning includes effective text, the loader must split current, future-effective, and unknown-effectivity variants into distinct version rows.

Suggested version key:

`authority_unit_id + source_file_id + effective_label + source_version_label + version_text_hash`

Do not use `canonical_citation` alone as a version key. Multiple effective versions can share the same citation.

## Chunk Load

Insert chunks only after the version is resolved.

Required mappings:

| Phase C field | Target |
|---|---|
| `chunk_id` | `authority_chunks.source_chunk_id` |
| `source_manifest_sha256` | `source_files.source_manifest_sha256` lookup |
| `source_path` | `source_file_memberships.source_path` |
| `source_type` | `authority_units.source_type` |
| `authority_family` | `authority_families.family_code` |
| `corpus_designation` | `authority_units.corpus_designation` |
| `approval_status` | `authority_chunks.approval_status` |
| `production_display_status` | `authority_chunks.production_display_status` |
| `canonical_citation` | `authority_units.canonical_citation` |
| `citation_aliases` | `citation_aliases` rows |
| `title` | `authority_units.title` and version metadata |
| `chapter`, `part`, `section`, `rule_number`, `policy_number`, `policy_chapter` | authority unit fields |
| `document_type` | authority unit and source membership metadata |
| `chunk_type` | `authority_chunks.chunk_type` |
| `page_start`, `page_end` | page span |
| `hierarchy_path` | authority unit array and metadata |
| `text` | `authority_chunks.text` |
| `text_sha256` | `authority_chunks.text_sha256` |
| `extraction_warnings` | `chunk_warnings` |
| `answer_scope_note` | answer scope metadata |

## Display Status Promotion

Phase C rows are not production-approved. A load phase may store them with the Phase C status, but production retrieval views must require:

- `authority_chunks.approval_status = approved_for_production`
- allowed `production_display_status`
- current or as-of valid version
- allowed answer scope

No Phase C row should become production-displayable by load default.

## Load Error Handling

The loader should fail the build, not silently patch data, when it finds:

- duplicate `chunk_id` with different text hash
- source hash mismatch
- restricted chunk type not marked restricted
- effective-dated pair collapsed into one version
- chunk without source file traceability
- chunk with missing body text
- invalid page span

The loader may quarantine but continue when it finds:

- missing optional chapter or part
- DCS document type unknown
- missing citation for metadata chunks
- source-level warning already recorded by Phase C

## Output Of A Future Dry Run

A future dry-run loader should produce:

- counts by table
- rejected rows with reason
- effective-version groups and pair status
- display gate counts
- warning counts
- DCS duplicate membership counts
- source hash verification count
- citation alias count and collision report
- FTS row count
- embedding column empty count

