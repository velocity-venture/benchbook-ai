# Phase E1 Implementation Plan

Date: 2026-06-14
Branch: `refactor/codex-gpt55-launch-prep`
Scope: planning and validation design only.

## Guardrails

Phase E1 did not create Supabase migrations, modify existing migrations, connect to a database, load corpus data, generate embeddings, modify app source, replace production corpus output, stage files, or commit files.

BenchBook.AI remains a closed-universe Tennessee judicial bench book AI. This plan does not couple BenchBook.AI to The BenchMark Standard.

PDFs remain archival source-of-record. PostgreSQL will become the working legal authority database only after owner approval and a later migration/load phase.

Target chain:

`source PDF -> cleaned text -> structured Markdown/HTML -> JSONL authority chunks -> PostgreSQL legal authority database -> PostgreSQL full-text search -> pgvector semantic index`

## Pre-Change Checks Run

| Check | Result |
|---|---|
| `pwd` | `/Users/m3_ai_factory/Projects/benchbook-ai` |
| `git branch --show-current` | `refactor/codex-gpt55-launch-prep` |
| `git status --short` | clean output |
| `git log --oneline -5` | `ef2778b Add Phase D legal authority database design`; `c9634ba Add Phase C expanded ingestion pipeline`; `452bc4e Add Phase C ingestion pilot pipeline`; `f090e7c Add historical test coverage audit`; `8b945ce Harden excluded-title citation and scope guards` |
| Ignored expanded chunks | `.gitignore:55:data/ingestion-expanded/` ignores `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl` |
| Existing migrations | No legal authority schema exists. Existing migrations cover product tables, chat, feedback, research tracking, rate limits, seat guardrails, and chat trust metadata. |

## Metadata Snapshot

Metadata-only inspection reported:

| Metric | Count |
|---|---:|
| Source manifest rows | 677 |
| Expanded chunks | 6,587 |
| Sources selected for expanded ingestion | 246 |
| Sources extracted | 232 |
| DCS duplicate sources skipped | 13 |
| Sources failed or OCR-blocked | 1 |
| Chunks with warnings | 338 |
| Total warnings | 862 |
| Restricted pending license review chunks | 2,392 |
| Pending extraction QA chunks | 4,195 |
| DCS duplicate groups | 12 |
| DCS alias paths | 13 |

Top load blockers observed from metadata:

- 298 `effective_dated_version_unit` warnings and 7 `effective_dated_version_text` warnings require version partitioning and QA.
- 2,392 restricted chunks must not be production displayable.
- 4,195 chunks remain `pending_extraction_qa`.
- 201 duplicate text groups require deduplication review.
- One DCS handbook source failed or was OCR-blocked.
- DCS date and section warnings require staged QA before production promotion.

## Future Migration Order

Do not create these files until a later phase is explicitly approved. The names below are proposed migration filenames and order only.

1. `YYYYMMDDHHMMSS_legal_authority_extensions_and_schemas.sql`
   - Enable `pgcrypto` and `pg_trgm`.
   - Enable `vector` only if owner approves pgvector in the first migration.
   - Create `legal_authority` and `legal_authority_stage` schemas.
   - Add schema comments and ownership notes.

2. `YYYYMMDDHHMMSS_legal_authority_enums_and_reference_data.sql`
   - Create enum types from Phase D:
     - `source_type`
     - `approval_status`
     - `validation_status`
     - `production_display_status`
     - `version_status`
     - `answer_scope`
     - `retrieval_mode`
   - Seed `authority_families` for T.C.A. Title 36, T.C.A. Title 37, TRJPP, TRE, and DCS.
   - Set TRE default scope to `limited_evidentiary_procedural`.

3. `YYYYMMDDHHMMSS_legal_authority_builds_sources_and_staging.sql`
   - Create `corpus_builds`.
   - Create `source_files`.
   - Create `source_file_memberships`.
   - Create staging tables:
     - `raw_source_manifest`
     - `raw_expanded_chunks`
     - `raw_extraction_warnings`
     - `raw_deduplication_groups`
     - `load_errors`
   - Add hash checks, source path constraints, and load batch tracking.

4. `YYYYMMDDHHMMSS_legal_authority_units_versions_chunks.sql`
   - Create `authority_units`.
   - Create `authority_versions`.
   - Create `authority_chunks`.
   - Include version range checks, text hash checks, page span checks, and display gate checks.
   - Include the `embedding vector(1536)` column only if pgvector was approved. Leave it null.

5. `YYYYMMDDHHMMSS_legal_authority_citations_warnings_relationships.sql`
   - Create `citation_aliases`.
   - Create `chunk_relationships`.
   - Create `extraction_warnings`.
   - Create `chunk_warnings`.
   - Add collision-safe unique indexes for citation aliases.

6. `YYYYMMDDHHMMSS_legal_authority_audit_tables.sql`
   - Create `retrieval_logs`.
   - Create `answer_audit_records`.
   - Create `citation_verification_records`.
   - Create `refusal_records`.
   - Add the answer audit to refusal foreign key after both tables exist.

7. `YYYYMMDDHHMMSS_legal_authority_core_integrity_indexes.sql`
   - Add indexes required for loader integrity and foreign key performance.
   - Include source hash, source manifest hash, source path membership, unit identity, version status, chunk source hash, display status, approval status, answer scope, citation alias, warning code, and audit ownership indexes.
   - Do not add expensive post-load search indexes until load dry-run timing is reviewed.

8. `YYYYMMDDHHMMSS_legal_authority_views_and_rpc_contracts.sql`
   - Create production-safe display views.
   - Create black-letter current view.
   - Create internal QA restricted view.
   - Define SECURITY DEFINER RPC contracts for exact citation lookup, filtered FTS retrieval, black-letter-only retrieval, refusal logging, and answer audit reconstruction.
   - RPCs must enforce display gates and as-of date filters. Raw `authority_chunks` should not be used by app code.

9. `YYYYMMDDHHMMSS_legal_authority_rls_and_grants.sql`
   - Enable RLS on all legal authority and staging tables.
   - Restrict build/load/staging writes to service role.
   - Permit authenticated read only through approved views or RPCs.
   - Keep restricted chunks internal QA or service-role only.
   - Scope user-specific audit records to the user.

10. `YYYYMMDDHHMMSS_legal_authority_post_load_search_indexes.sql`
    - Add or validate GIN FTS indexes after dry-run load performance is measured.
    - Add trigram indexes needed for citation or source path lookup.
    - Defer HNSW or IVFFLAT vector indexes until embeddings are approved and populated.

## Prerequisites By Phase

Schema objects prerequisite to corpus loading:

- `legal_authority` schema
- `legal_authority_stage` schema
- enum types
- `authority_families`
- `corpus_builds`
- `source_files`
- `source_file_memberships`
- `authority_units`
- `authority_versions`
- `authority_chunks`
- `citation_aliases`
- `extraction_warnings`
- `chunk_warnings`
- staging tables and `load_errors`
- integrity indexes needed for uniqueness, identity, and FK performance

Schema objects prerequisite to retrieval:

- loaded and validated `corpus_builds`
- loaded authority families, units, versions, chunks, and citation aliases
- production-safe views or SECURITY DEFINER RPCs
- display and approval gates
- as-of date filter
- exact citation index
- FTS index after load
- vector column only as placeholder until embeddings are approved
- retrieval logging

Schema objects prerequisite to answer audit:

- `retrieval_logs`
- `answer_audit_records`
- `citation_verification_records`
- `refusal_records`
- `corpus_builds`
- source, version, chunk, citation alias, and warning tables needed to reconstruct support

## Index Timing

Required before load:

- primary keys and foreign key backing indexes
- `source_files.sha256`
- `source_files.source_manifest_sha256`
- `source_file_memberships` unique path membership
- `authority_units` unique family plus normalized citation
- `authority_versions` unit and status indexes
- `authority_chunks.source_chunk_id` unique constraint
- `authority_chunks.source_file_id, text_sha256`
- `citation_aliases.normalized_alias`
- warning code indexes if warnings are loaded during the same pass

Prefer after bulk load:

- `authority_chunks.tsv` GIN index
- trigram indexes on larger text fields if load timing suffers
- audit query performance indexes that are not needed for load integrity

Defer until embeddings are approved:

- vector index on `authority_chunks.embedding`
- embedding health checks
- semantic retrieval RPCs that require populated embeddings

## Database-Level Constraints

The later migration should enforce:

- valid 64-character SHA-256 values for manifest, source, chunk, and version hashes
- unique source files by SHA-256
- unique source chunk IDs
- source path membership uniqueness within build
- authority unit identity present through citation, rule number, section, or policy number
- version date range validity
- future-effective rows must have `valid_from` or require effectivity QA
- page spans must be ordered when both pages exist
- character spans must be ordered when both character offsets exist
- restricted chunks must have restricted or internal retrieval gates
- answer audit unsupported proposition count must be non-negative
- refusal kind must be controlled
- TRE family default answer scope must be limited

## Loader Pre-Insert Validations

Loader code should reject or quarantine before insert:

- source manifest hash mismatch
- invalid or missing `source_manifest_sha256`
- source path missing from manifest
- duplicate `chunk_id` with conflicting `text_sha256`
- chunk text hash mismatch
- missing text
- invalid page span
- unknown authority family
- unknown source type
- missing corpus designation
- missing production display status
- restricted chunk type not marked restricted
- TRE row without limited answer scope metadata
- DCS duplicate missing primary or alias membership
- effective-dated chunk not assigned to a version-partitioning queue
- citation alias collision that points to different authority units without review

## Post-Load Validations

After a dry-run load, validate:

- source manifest selected count reconciliation
- chunk count reconciliation against `EXPANDED_CHUNK_SUMMARY.json`
- warning count reconciliation against `EXPANDED_EXTRACTION_WARNINGS.json`
- DCS duplicate groups and alias path count reconciliation
- all chunks trace to source file, source path, source hash, corpus build, page span when present, and text hash
- restricted chunks do not appear in production-safe views
- no Phase C `pending_extraction_qa` row is production-displayable by default
- current and future-effective versions are separate
- no future-effective version appears in current-law mode before its effective date
- TRE rows carry limited scope
- DCS pending extraction QA remains excluded from production answers
- citation aliases are normalized and collision-reviewed
- FTS index row count matches eligible rows after index creation
- embedding column remains null until approved
- retrieval logs and answer audits can reconstruct support packages

## Operations Requiring Owner Approval

Owner approval is required before:

- creating or modifying any Supabase migration
- connecting to any database
- choosing production Supabase versus local disposable database
- applying migrations
- loading source manifest rows, chunks, warnings, or dedupe groups
- loading restricted annotation, case-note, advisory, or research-reference material
- deciding whether any restricted chunks should be excluded entirely
- enabling pgvector in the first migration
- generating embeddings
- enabling semantic retrieval
- promoting any corpus build to production
- exposing DCS material in production retrieval
- approving local rules overlay behavior in the authority schema
- modifying app source to use retrieval RPCs

## Phase E1 Conclusion

The Phase D design is migration-ready as a design artifact, but not load-ready for production. The next safest step is a later disposable local database migration dry run using copied draft SQL split into the migration order above, followed by a metadata-only dry-run loader that reads ignored expanded outputs and produces reconciliation reports without writing legal text to committed files.
