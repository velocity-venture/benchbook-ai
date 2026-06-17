# Phase E4 Blocker Remediation Report

## Scope

Phase E4 remediated local blockers found in the Phase E3 target-table promotion dry run. This was local-only remediation work.

No Supabase production database, Supabase preview database, remote database, app source file, real migration, embedding job, or production corpus replacement was used.

## Required pre-checks

- Working directory: `/Users/m3_ai_factory/Projects/benchbook-ai`
- Branch: `refactor/codex-gpt55-launch-prep`
- E4 starting status: clean
- Recent commits included `c0bb636 Add Phase E3 target promotion dry run`
- `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl` is ignored by `.gitignore`
- `supabase/migrations/` status before work: no changes
- Local PostgreSQL: available
- Remote database connection: not used

## Remediation summary

- Upstream chunk ID generation now includes stable source, authority, chunk, page, sequence, and text-hash inputs.
- Exact duplicate ID bases get deterministic occurrence-based IDs.
- DCS non-policy documents with reliable source path and document type are now isolated as `document_anchored`, not treated as policy citations.
- Bare rule-number aliases were suppressed for TRE and TRJPP because those collide across rule families.
- Effectivity parsing now recognizes labels such as `Effective July 1, 2026`.
- All production display and answer gates remain closed.

## Before and after

| Metric | Phase E3 | Phase E4 |
|---|---:|---:|
| Expanded chunks | 6,587 | 6,590 |
| Duplicate source chunk ID groups | 117 | 0 |
| Duplicate source chunk rows | 234 | 0 |
| Unresolved authority units | 273 | 17 |
| Unresolved chunks | 1,164 | 21 |
| Document-anchored chunks | 0 | 1,146 |
| Citation alias collision groups | 12 | 0 |
| Alias candidates suppressed by collision | 24 | 0 |
| Unknown-effectivity chunks | 48 | 39 |
| Unknown-effectivity versions | 18 | 15 |

## E4 target promotion result

- Source files: 647
- Source file memberships: 677
- Authority units: 1,321
- Authority versions: 1,343
- Authority chunks: 6,590
- Citation aliases: 3,598
- Chunk warnings: 359
- Extraction warnings: 864
- Retrieval logs: 1
- Answer audit records: 1
- Citation verification records: 1

## Gate verification

- Displayable production view count: 0
- Restricted chunks in displayable view: 0
- Pending chunks in displayable view: 0
- Internal QA restricted view count: 6,590
- Black-letter eligible chunks: 1,059
- Production-visible black-letter chunks: 0
- TRE chunks: 533
- TRE limited-scope chunks: 533
- DCS chunks: 2,014
- DCS guardrail-reference chunks: 2,014
- DCS production-eligible chunks: 0
- Future versions visible before July 1, 2026: 0
- Audit reconstruction join count: 1
- Answer text columns in audit table: 0

## Local execution

- Regeneration command: `/tmp/gws-venv/bin/python scripts/ingestion/run_expanded_ingestion.py > /tmp/benchbook_phase_e4_ingestion_summary.json`
- Static validation command: `python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_phase_e4_static_validation.json`
- Target promotion command: `python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e4_target_promotion.json`
- Disposable local database: created and dropped
- Extracted legal body text in committed reports: no

## Result

Phase E4 remediated the highest-risk local blockers. The local corpus remains correctly gated and is still not authorized for production load until remaining QA blockers are reviewed.
