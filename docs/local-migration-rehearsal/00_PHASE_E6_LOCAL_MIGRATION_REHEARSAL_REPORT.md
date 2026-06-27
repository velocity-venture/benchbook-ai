# Phase E6 Local Migration Rehearsal Report

Date: 2026-06-26
Branch: `refactor/codex-gpt55-launch-prep`
Scope: local-only real migration rehearsal for the legal authority schema

## Result

Phase E6 passed as a local-only rehearsal in the current verification run.

The reviewed draft legal authority migrations are present byte-for-byte in `supabase/migrations/` as E6 local rehearsal migration files. They were already present as untracked files at the current pre-check, so this run verified and reused them rather than overwriting them. The E6 migration set applied cleanly to a disposable local PostgreSQL database. The database was dropped, and no E6 local database remains.

The required static validation and target-promotion dry run also completed locally. All production display and retrieval gates remain closed.

## Pre-checks

| Check | Result |
|---|---|
| Working directory | `/Users/m3_ai_factory/Projects/benchbook-ai` |
| Branch | `refactor/codex-gpt55-launch-prep` |
| E5 baseline working tree | clean at committed restart bookmark |
| Current pre-check working tree | not clean, with untracked E6 migration and documentation files already present |
| Starting HEAD | `e70dce3 Add BenchBook restart bookmark after Phase E5` |
| Local PostgreSQL tools | `psql`, `createdb`, and `dropdb` available |
| PostgreSQL client | `psql (PostgreSQL) 18.3` |
| Expanded chunk JSONL ignored | yes, via `.gitignore` |
| Remote database connection | not used |
| Supabase preview | not used |
| Supabase production | not used |
| Supabase token command | not used |

## Real migration directory status

The E5 baseline for `supabase/migrations/` contained these app migrations:

- `supabase/migrations/20260204_initial_schema.sql`
- `supabase/migrations/20260206_waitlist.sql`
- `supabase/migrations/20260209003525_init_chat_persistence.sql`
- `supabase/migrations/20260214_research_patterns.sql`
- `supabase/migrations/20260404_rate_limiting.sql`
- `supabase/migrations/20260430_plan_seat_guardrails.sql`
- `supabase/migrations/20260501_chat_trust_metadata.sql`

Those files were not changed.

At the current pre-check, the 10 E6 legal authority files below were already present as untracked files. They were compared to `supabase/migrations_draft/` and matched byte-for-byte.

## E6 migration files created

- `supabase/migrations/20260619090000_e6_local_rehearsal_legal_authority_001_extensions_schemas.sql`
- `supabase/migrations/20260619090100_e6_local_rehearsal_legal_authority_002_enums_reference.sql`
- `supabase/migrations/20260619090200_e6_local_rehearsal_legal_authority_003_builds_sources_staging.sql`
- `supabase/migrations/20260619090300_e6_local_rehearsal_legal_authority_004_units_versions_chunks.sql`
- `supabase/migrations/20260619090400_e6_local_rehearsal_legal_authority_005_citations_warnings_relationships.sql`
- `supabase/migrations/20260619090500_e6_local_rehearsal_legal_authority_006_audit_tables.sql`
- `supabase/migrations/20260619090600_e6_local_rehearsal_legal_authority_007_core_integrity_indexes.sql`
- `supabase/migrations/20260619090700_e6_local_rehearsal_legal_authority_008_views_rpcs.sql`
- `supabase/migrations/20260619090800_e6_local_rehearsal_legal_authority_009_rls_grants.sql`
- `supabase/migrations/20260619090900_e6_local_rehearsal_legal_authority_010_post_load_search_and_vector.sql`

Copy status: all 10 files match their draft sources byte-for-byte.

SQL changed during copy: no.

## Real migration application

Disposable local database:

`benchbook_e6_real_migration_rehearsal_20260626_201716`

Applied migration files:

- E6 legal authority real migration files only
- Applied in filename order
- Applied with `psql -v ON_ERROR_STOP=1`

Result:

| Metric | Result |
|---|---:|
| E6 migrations applied | 10 |
| Legal authority and staging base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| Displayable count before load | 0 |
| Embedding column count | 0 |

The local machine did not have pgvector available, so the optional embedding column stayed deferred. No embeddings were generated.

## Existing validation commands

Static validation:

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_phase_e6_static_validation.json
```

Target promotion dry run:

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e6_target_promotion.json
```

The target-promotion command used the existing loader pathway. The loader still applies `supabase/migrations_draft/` internally and names disposable databases with a `benchbook_e4_dry_run_*` prefix, so the real-migration application proof and the corpus load proof were run as separate local-only checks.

## Static validation summary

| Metric | Result |
|---|---:|
| Metadata only | true |
| Body text printed | false |
| Expanded chunks | 6,590 |
| Duplicate chunk ID groups | 0 |
| Citation alias collision groups | 0 |
| Production-eligible chunks | 0 |
| Restricted production violations | 0 |
| Pending production violations | 0 |
| Pending extraction QA chunks | 4,198 |
| Restricted pending license review chunks | 2,392 |
| Draft migration count | 10 |

## Target promotion summary

| Metric | Result |
|---|---:|
| Local database executed | true |
| Local database target | `benchbook_e4_dry_run_8ad59af777` |
| Local database created | true |
| Draft migrations applied by existing loader | 10 |
| Local database dropped | true |
| Raw source manifest rows staged | 677 |
| Raw expanded chunks staged | 6,590 |
| Raw extraction warnings staged | 864 |
| Raw deduplication groups staged | 12 |
| Source files promoted | 647 |
| Source file memberships promoted | 677 |
| Authority units promoted | 1,321 |
| Authority versions promoted | 1,343 |
| Authority chunks promoted | 6,590 |
| Citation aliases promoted | 3,598 |
| Chunk warnings promoted | 359 |
| Extraction warnings promoted | 864 |
| Retrieval logs inserted for audit proof | 1 |
| Answer audit records inserted for audit proof | 1 |
| Citation verification records inserted for audit proof | 1 |

## Gate verification

| Gate | Result |
|---|---:|
| Displayable production view count | 0 |
| Restricted chunks in displayable view | 0 |
| Pending chunks in displayable view | 0 |
| Internal QA restricted view count | 6,590 |
| Production-visible black-letter chunks | 0 |
| TRE chunks | 533 |
| TRE limited-scope chunks | 533 |
| TRE non-limited chunks | 0 |
| DCS chunks | 2,014 |
| DCS guardrail-scope chunks | 2,014 |
| DCS production-eligible chunks | 0 |
| Future-effective versions | 16 |
| Future-effective versions visible before 2026-07-01 | 0 |
| Versions requiring QA signoff | 439 |
| Citation alias production lookup count | 0 |
| Audit reconstruction join count | 1 |
| Answer text columns in audit table | 0 |

## No-touch audit

| Item | Result |
|---|---|
| Remote database touched | no |
| Supabase preview touched | no |
| Supabase production touched | no |
| `supabase db push` run | no |
| `supabase link` run | no |
| Commands requiring Supabase token run | no |
| App source files changed | no |
| Ingestion scripts changed | no |
| Database-load scripts changed | no |
| Draft migrations changed | no |
| Real migrations created | yes, 10 E6 local rehearsal files |
| Embeddings generated | no |
| Production corpus replaced | no |
| Production display gates opened | no |
| Source PDFs changed | no |
| Files staged or committed | no |

## Conclusion

Phase E6 proves that the reviewed legal authority draft SQL can be represented as real migration files and executed in order against a disposable local PostgreSQL database. It does not authorize preview Supabase, production Supabase, app integration, embedding generation, production corpus replacement, or production display enablement.
