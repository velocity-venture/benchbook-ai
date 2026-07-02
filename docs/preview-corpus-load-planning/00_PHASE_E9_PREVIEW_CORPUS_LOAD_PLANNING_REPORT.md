# Phase E9 Preview Corpus-load Planning Report

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: docs-only preview corpus-load planning

## Result

Phase E9 produced a planning package only. No remote database command was run, no Supabase project was contacted, no corpus rows were loaded, no embeddings were generated, no app files were changed, no migrations were changed, and no scripts were changed.

The package plans how a future owner-approved E10 could safely load a gated preview corpus into the verified preview project `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`, while preserving the closed-universe V1 scope, all display gates, restricted-content rules, zero embeddings, and no app integration.

## Pre-check summary

| Check | Result |
|---|---|
| Working directory | `/Users/m3_ai_factory/Projects/benchbook-ai` |
| Branch | `refactor/codex-gpt55-launch-prep` |
| Starting working tree | clean |
| Current HEAD | `b8dd611 Update Phase E8 preview execution record` |
| Remote command planned or run in E9 | no |
| Corpus load planned or run in E9 | no load run |
| Files staged or committed in E9 | no |

## E8 baseline carried into E9

| Item | E8 verified result |
|---|---:|
| `legal_authority` schema exists | true |
| `legal_authority_stage` schema exists | true |
| Base tables | 20 |
| Views | 3 |
| Functions | 3 |
| RLS-enabled tables | 20 |
| `source_files` rows | 0 |
| `authority_units` rows | 0 |
| `authority_versions` rows | 0 |
| `authority_chunks` rows | 0 |
| Display gate view rows | 0 |
| Embeddings generated | no |
| App integration | no |

## Corpus-load planning baseline

Local metadata-only validation in E9 confirmed:

| Metric | Count |
|---|---:|
| Source manifest rows | 677 |
| Unique source SHA-256 values | 647 |
| Expanded chunks | 6,590 |
| Pending extraction QA chunks | 4,198 |
| Restricted pending license review chunks | 2,392 |
| DCS chunks | 2,014 |
| TRE chunks | 533 |
| Duplicate chunk ID groups | 0 |
| Citation alias collision groups | 0 |
| Static non-metadata identity gaps | 81 |
| DCS policy or protocol identity gaps | 292 |
| Effective-warning rows | 268 |

## Recommended E10 posture

E10 should not proceed automatically. It requires separate written owner approval that states whether E10 is:

1. preview corpus-load planning only;
2. preview corpus-load dry run with remote writes to `benchbook-ai`; or
3. preview corpus-load execution into `benchbook-ai`.

Recommended default: E10 should be a preview corpus-load dry-run planning phase unless Judge Eckel expressly approves remote writes and corpus-row loading.

## Preferred future load approach

The existing local loader should not be pointed directly at preview. It is designed as a local dry-run tool, applies draft migrations, expects local `psql`, and refuses non-local database targets.

Recommended future path: reuse its validation and promotion mapping logic through a new preview-safe adapter or a SQL/COPY staging plan that is written and reviewed before execution. The adapter should never apply migrations, should never open display gates, should never generate embeddings, and should log only metadata and counts.
