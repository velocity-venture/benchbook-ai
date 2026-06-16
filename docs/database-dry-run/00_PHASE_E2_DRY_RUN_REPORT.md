# Phase E2 Dry-Run Report

Date: 2026-06-15
Branch: `refactor/codex-gpt55-launch-prep`
Scope: local disposable database migration draft and dry-run staging only.

## Executive Summary

Phase E2 produced a local-disposable-database-ready draft migration set, static validation script, and local dry-run loader for the `legal_authority` schema.

No remote database connection occurred. No Supabase production or preview project was contacted. No embeddings were generated. No app source files were modified. No files under `supabase/migrations/` were created or modified. No files were staged or committed.

The local dry run succeeded:

- 10 draft migration files applied to a disposable local PostgreSQL database.
- 1 local `corpus_builds` row inserted.
- 677 source manifest rows staged.
- 6,587 expanded chunk rows staged.
- 862 extraction warning rows staged.
- 12 DCS duplicate-group rows staged.
- 5 authority family rows seeded.
- Disposable database was dropped after the run.

## Pre-Change Checks

| Check | Result |
|---|---|
| `pwd` | `/Users/m3_ai_factory/Projects/benchbook-ai` |
| `git branch --show-current` | `refactor/codex-gpt55-launch-prep` |
| `git status --short` before edits | clean output |
| `git log --oneline -5` | `ba2c22f Add Phase E1 database implementation plan`; `ef2778b Add Phase D legal authority database design`; `c9634ba Add Phase C expanded ingestion pipeline`; `452bc4e Add Phase C ingestion pilot pipeline`; `f090e7c Add historical test coverage audit` |
| Expanded chunks ignored | `.gitignore:55:data/ingestion-expanded/` |
| Existing real migrations | Seven existing files under `supabase/migrations/`; none changed |
| Draft migrations before E2 | none under `supabase/migrations_draft/` |
| Local tooling | `psql` available, local PostgreSQL accepting connections, Docker unavailable, Supabase CLI unavailable |

## Draft Migration Files

Draft migrations were created under `supabase/migrations_draft/`, not `supabase/migrations/`.

The draft set uses Supabase timestamp-style naming and is local-disposable ready. It includes schemas, enums, reference data, staging tables, core authority tables, warning and citation tables, audit tables, indexes, production-safe RPC/view contracts, RLS drafts, and deferred FTS/vector support.

## Static Validation Results

| Validation | Result |
|---|---|
| Source manifest hash reconciliation | passed |
| Chunk text hash reconciliation | passed |
| Corpus build version assignment inputs | passed |
| Authority family mapping | passed |
| Authority unit and version creation inputs | failed with known metadata gaps |
| Version effectivity partitioning required | true |
| TRE limited-scope designation | passed |
| DCS deduplication and alias membership | passed |
| Display and license gates | passed |
| Annotation, case-note, editorial restrictions | passed |
| Black-letter-only retrieval eligibility inputs | passed |
| Citation alias creation inputs | passed |
| Page span preservation | passed |
| Warning import inputs | passed |
| Audit support table drafts | passed |
| No unsupported production display | passed |

## Counts

| Metric | Count |
|---|---:|
| Source manifest rows | 677 |
| Unique source SHA-256 values | 647 |
| Expanded chunks | 6,587 |
| Text hash mismatches | 0 |
| Missing source manifest hash links | 0 |
| Unknown authority families | 0 |
| Restricted pending license review chunks | 2,392 |
| Pending extraction QA chunks | 4,195 |
| Production eligible chunks by Phase C status | 0 |
| Citation alias collisions detected | 0 |
| Invalid page spans | 0 |
| Chunk-embedded effective warning rows | 268 |
| Warning summary `effective_dated_version_unit` count | 298 |
| Warning summary `effective_dated_version_text` count | 7 |
| DCS duplicate groups | 12 |
| DCS alias paths | 13 |

## Local Database Dry Run

The loader created a disposable local database, applied draft migrations, staged raw JSON rows, inserted a local corpus build record, counted staged rows, and dropped the database.

No production corpus load occurred. This was local staging only.

## Remaining Blockers

1. 80 non-metadata chunks lack citation, section, rule, or policy identity inputs.
2. 292 DCS policy or protocol chunks lack policy identity metadata.
3. Effective-dated rows require version partitioning and QA signoff before production.
4. 4,195 pending extraction QA chunks cannot be production-displayable by default.
5. 2,392 restricted chunks require Judge or delegated corpus administrator approval before production use.
6. The encrypted or OCR-blocked DCS handbook remains skipped for the first load.

## Recommendation

Proceed next to Phase E3 only after owner approval. Phase E3 should add target-table promotion logic in the local loader, still against a disposable local database only, and should focus on resolving authority unit identity, effectivity partitioning, and DCS policy identity gaps before any production consideration.
