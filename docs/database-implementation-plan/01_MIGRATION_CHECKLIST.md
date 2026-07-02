# Migration Checklist

This checklist is for a later authorized phase. Do not execute it during Phase E1.

## Pre-Migration Approval

- Confirm database target: local disposable database, Supabase preview, or production.
- Confirm `legal_authority` is the approved schema name.
- Confirm whether `legal_authority_stage` is approved for staging tables.
- Confirm whether pgvector should be enabled immediately or deferred.
- Confirm no existing migration will be edited retroactively.
- Confirm no app code will point at the new schema until retrieval RPCs and gates pass tests.
- Confirm restricted material storage policy.
- Confirm whether the encrypted or OCR-blocked DCS handbook is skipped in first load.

## Migration 1: Extensions And Schemas

Future file: `YYYYMMDDHHMMSS_legal_authority_extensions_and_schemas.sql`

- Enable `pgcrypto`.
- Enable `pg_trgm`.
- Enable `vector` only if approved.
- Create `legal_authority`.
- Create `legal_authority_stage`.
- Add comments stating PDFs remain archival source-of-record.

Acceptance:

- Extensions parse and install in disposable database.
- Schemas exist.
- No production table is changed.

## Migration 2: Enums And Reference Data

Future file: `YYYYMMDDHHMMSS_legal_authority_enums_and_reference_data.sql`

- Add enum types.
- Create and seed `authority_families`.
- Verify TRE default answer scope is `limited_evidentiary_procedural`.
- Verify DCS default approval remains staged, not production.

Acceptance:

- Reference rows are idempotent.
- Family codes match Phase C values exactly.

## Migration 3: Builds, Sources, And Staging

Future file: `YYYYMMDDHHMMSS_legal_authority_builds_sources_and_staging.sql`

- Create `corpus_builds`.
- Create `source_files`.
- Create `source_file_memberships`.
- Create staging tables.
- Create `load_errors`.
- Add hash and path checks.

Acceptance:

- Source files are unique by SHA-256.
- Memberships can preserve DCS alias paths.
- Staging rows can store raw JSONB without legal text being printed in logs.

## Migration 4: Units, Versions, And Chunks

Future file: `YYYYMMDDHHMMSS_legal_authority_units_versions_chunks.sql`

- Create `authority_units`.
- Create `authority_versions`.
- Create `authority_chunks`.
- Add date range, page span, text hash, and display gate checks.
- Add embedding placeholder only if approved.

Acceptance:

- Current and future-effective versions can coexist for one authority unit.
- Restricted display status cannot accidentally use an open retrieval gate.
- Chunk text hash is required.

## Migration 5: Citations, Relationships, And Warnings

Future file: `YYYYMMDDHHMMSS_legal_authority_citations_warnings_relationships.sql`

- Create `citation_aliases`.
- Create `chunk_relationships`.
- Create `extraction_warnings`.
- Create `chunk_warnings`.
- Add alias uniqueness rules.

Acceptance:

- Exact citation lookup is deterministic.
- Warning imports can reconcile source-level and chunk-level warnings.
- Restricted chunks can relate to authority units without being displayable.

## Migration 6: Audit Tables

Future file: `YYYYMMDDHHMMSS_legal_authority_audit_tables.sql`

- Create `retrieval_logs`.
- Create `answer_audit_records`.
- Create `citation_verification_records`.
- Create `refusal_records`.
- Add answer audit refusal FK.

Acceptance:

- Every future answer can point to one `corpus_build_id`.
- Every refusal can be reconstructed without answer text leakage.
- Citation verification records can preserve support chunk IDs.

## Migration 7: Core Integrity Indexes

Future file: `YYYYMMDDHHMMSS_legal_authority_core_integrity_indexes.sql`

- Add indexes needed for load integrity and FK performance.
- Add source, unit, version, chunk, alias, warning, and audit lookup indexes.
- Avoid costly search indexes until load timing is known.

Acceptance:

- Dry-run load can enforce identity, uniqueness, and traceability.
- Indexes do not hide constraint defects.

## Migration 8: Views And RPC Contracts

Future file: `YYYYMMDDHHMMSS_legal_authority_views_and_rpc_contracts.sql`

- Create `v_current_displayable_chunks`.
- Create `v_black_letter_current_chunks`.
- Create `v_internal_qa_restricted_chunks`.
- Create retrieval RPC contracts.
- Create refusal and audit write RPC contracts.

Acceptance:

- Production views exclude restricted and pending rows.
- RPC contracts require `as_of_date`.
- Exact citation lookup cannot bypass display gates.

## Migration 9: RLS And Grants

Future file: `YYYYMMDDHHMMSS_legal_authority_rls_and_grants.sql`

- Enable RLS on all legal authority tables.
- Restrict staging and load writes to service role.
- Scope audit records by user.
- Grant production reads only through safe views or RPCs.
- Keep raw chunks inaccessible to normal app clients.

Acceptance:

- Authenticated users cannot read raw restricted chunks.
- Internal QA access is explicit and auditable.
- Service role can perform approved load operations.

## Migration 10: Post-Load Search Indexes

Future file: `YYYYMMDDHHMMSS_legal_authority_post_load_search_indexes.sql`

- Add GIN FTS indexes after load dry-run performance review.
- Add trigram indexes after query plan review.
- Add vector index only after embeddings are approved and populated.

Acceptance:

- FTS count matches eligible chunks.
- No vector index exists without approved embeddings.

## Required Stop Points

Stop and ask before:

- using production Supabase
- applying any migration
- modifying any existing migration
- loading any corpus data
- writing legal source text to a committed file
- generating embeddings
- making app source changes
- promoting any restricted content
