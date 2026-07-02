# Phase D Database Design Report

Date: 2026-06-13
Branch inspected: `refactor/codex-gpt55-launch-prep`
Scope: design only. No database connection, migration application, embedding generation, corpus load, app-code edit, staging, or commit was performed.

## Executive Summary

Phase D should add a separate legal authority database beside the existing product and chat schema. The current Supabase schema handles users, chat persistence, rate limits, waitlist, and research analytics. It does not contain authority tables, source-file traceability, effective-version partitioning, full-text search, vector search, retrieval logs, answer audits, citation verification records, or refusal records.

The recommended design is an additive PostgreSQL schema named `legal_authority`. It preserves the pipeline chain:

`source PDF -> cleaned text -> structured Markdown or HTML -> JSONL authority chunks -> PostgreSQL authority database -> PostgreSQL full-text search -> pgvector semantic index`

PDFs remain archival source of record. PostgreSQL becomes the working legal authority database.

## Required Pre-Design Inspection

The requested commands and checks were run before file edits.

| Check | Result |
|---|---|
| `pwd` | `/Users/m3_ai_factory/Projects/benchbook-ai` |
| `git branch --show-current` | `refactor/codex-gpt55-launch-prep` |
| `git status --short` before edits | clean output |
| `git log --oneline -5` | `c9634ba Add Phase C expanded ingestion pipeline`; `452bc4e Add Phase C ingestion pilot pipeline`; `f090e7c Add historical test coverage audit`; `8b945ce Harden excluded-title citation and scope guards`; `9c2e518 Add source manifest audit and architecture review` |
| Expanded chunks ignored | `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl` is ignored by `.gitignore:55:data/ingestion-expanded/` |
| Existing Supabase structure | `supabase/config.toml`, `.gitignore`, seven migrations, and `seed-demo-data.sql` |
| Existing migrations | Product and chat tables only. No legal authority schema, FTS corpus tables, pgvector tables, retrieval logs, or answer audit tables. |
| Expanded summary inspected | Metadata counts only, no long legal text printed into this report. |
| Warning summary inspected | Warning codes and counts only. |
| JSONL metadata samples inspected | Body text fields were removed from samples. |

## Existing Supabase Files Inspected

- `supabase/migrations/20260204_initial_schema.sql`
- `supabase/migrations/20260206_waitlist.sql`
- `supabase/migrations/20260209003525_init_chat_persistence.sql`
- `supabase/migrations/20260214_research_patterns.sql`
- `supabase/migrations/20260404_rate_limiting.sql`
- `supabase/migrations/20260430_plan_seat_guardrails.sql`
- `supabase/migrations/20260501_chat_trust_metadata.sql`
- `supabase/seed-demo-data.sql`

Existing app compatibility was reviewed through persistence and Supabase helper files. The legal corpus is currently not loaded from Supabase.

## Phase C Corpus Metadata Observed

From `data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json`:

| Metric | Value |
|---|---:|
| Total chunks | 6,587 |
| Sources selected | 246 |
| Sources extracted | 232 |
| DCS sources skipped as duplicates | 13 |
| Sources failed or OCR-blocked | 1 |
| Chunks with warnings | 338 |
| Warning count | 862 |
| Median chunk size | 520 characters |
| Maximum chunk size | 169,583 characters |

Chunks by authority family:

| Authority family | Chunks |
|---|---:|
| `tca_title_36` | 2,197 |
| `tca_title_37` | 1,644 |
| `tenn_rules_juvenile_practice_procedure` | 202 |
| `tenn_rules_evidence` | 533 |
| `dcs_policies_procedures` | 2,011 |

Chunks by display status:

| Display status | Chunks |
|---|---:|
| `pending_extraction_qa` | 4,195 |
| `restricted_pending_license_review` | 2,392 |

Chunks by corpus designation:

| Corpus designation | Chunks |
|---|---:|
| `core_v1_candidate` | 4,043 |
| `evidence_guardrail_and_limited_answer_candidate` | 533 |
| `staged_dcs_candidate` | 2,011 |

Warning counts by code:

| Warning code | Count |
|---|---:|
| `effective_dated_version_unit` | 298 |
| `duplicate_chunk_text` | 201 |
| `dcs_dates_undetected` | 99 |
| `unusually_large_chunk` | 90 |
| `dcs_sections_undetected` | 65 |
| `stub_chunk_suppressed` | 44 |
| `dcs_sections_undetected_page_split` | 18 |
| `dcs_doc_type_unmapped_chunktype` | 15 |
| `suspiciously_short_page` | 10 |
| `dcs_doc_type_undetected` | 9 |
| `effective_dated_version_text` | 7 |
| `missing_section_heading` | 3 |
| `citation_undetected` | 2 |
| `extraction_failed` | 1 |

## Design Decisions

1. Use a separate `legal_authority` schema to avoid colliding with existing product tables.
2. Treat `source_files.sha256` as the canonical source-file identity. Preserve every source path and DCS chapter membership through `source_file_memberships`.
3. Model the legal hierarchy in `authority_units`, and model every current, future, expired, or superseded text as an `authority_versions` row.
4. Store answerable text in `authority_chunks`, with hard display and approval gates.
5. Keep Lexis annotations, case notes, research references, and advisory comments in the database only as restricted material until display approval changes.
6. Represent Tennessee Rules of Evidence as a separately scoped authority family with `answer_scope = limited_evidentiary_procedural`.
7. Make exact citation lookup deterministic through `citation_aliases`; full-text and vector retrieval are secondary recall paths.
8. Require retrieval to filter by approval, display, effective date, authority family, source type, corpus designation, version status, chunk type, DCS chapter, citation, and source hash.
9. Add audit tables for corpus builds, warnings, retrieval logs, answer audit records, citation verification, and refusals.
10. Preserve black-letter-only retrieval as a first-class query mode.

## Deliverables

- [01 Authority Schema Design](01_AUTHORITY_SCHEMA_DESIGN.md)
- [02 Draft Schema SQL](02_DRAFT_SCHEMA_SQL.sql)
- [03 Corpus Load Design](03_CORPUS_LOAD_DESIGN.md)
- [04 Version Effectivity Design](04_VERSION_EFFECTIVITY_DESIGN.md)
- [05 Display and License Gate Design](05_DISPLAY_AND_LICENSE_GATE_DESIGN.md)
- [06 Retrieval Index Design](06_RETRIEVAL_INDEX_DESIGN.md)
- [07 Existing Supabase Impact Review](07_EXISTING_SUPABASE_IMPACT_REVIEW.md)
- [08 QA Acceptance Criteria](08_QA_ACCEPTANCE_CRITERIA.md)
- [09 Next Phase Prompt](09_NEXT_PHASE_PROMPT.md)
- [Metadata Analyzer README](../../scripts/database_design/README.md)

## Non-Actions

No migration file was created under `supabase/migrations/`. No existing migration was modified. No database was contacted. No JSONL was loaded. No embeddings were generated. No app source file was modified. No source PDF was moved, renamed, deleted, or altered. Nothing was staged or committed.

