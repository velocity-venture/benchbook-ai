# 01 - Repo and Phase Baseline

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration (local-only, read-plus-new-docs, nothing staged or committed)
Branch: `refactor/codex-gpt55-launch-prep`
HEAD at start of pass: `660967a Add Phase E14 metadata remediation artifacts`

## 1. Verified starting state

| Check | Result |
|---|---|
| Branch | `refactor/codex-gpt55-launch-prep` (confirmed) |
| HEAD | `660967a` (confirmed, matches expected) |
| Working tree before pass | Clean (no modified, no staged files) |
| Staged files | None |
| Remote commands run | None |
| Supabase commands run | None |

## 2. Execution environment note (important)

This pass ran in a cloud Linux container clone of the repository, not on the owner's Mac Studio at `~/Projects/benchbook-ai`. The git content is identical (same branch, same HEAD), but two classes of local-only artifacts that exist on the Mac Studio are intentionally absent here because they are gitignored or untracked:

1. `data/ingestion-expanded/` (EXPANDED_AUTHORITY_CHUNKS.jsonl, EXPANDED_CHUNK_SUMMARY.json, warnings, dedupe report). Gitignored because it contains legal body text.
2. `Benchbook.ai Database Files/` (source-of-record PDFs). Untracked by design.

Consequences for this pass, all documented rather than worked around:

- `scripts/database_load/validate_expanded_chunks_for_load.py` cannot run to completion here (its inputs are the gitignored chunk artifacts). It was invoked; it failed on the missing `EXPANDED_CHUNK_SUMMARY.json` input exactly as expected. The last committed evidence of it passing is recorded in `docs/preview-corpus-e14b/12_LOCAL_DRY_RUN_AND_GATE_BASELINE.md` and `docs/preview-corpus-e14b/manifests/validation_manifest.json`.
- `scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after` cannot run here for the same reason (its first step is the same static validation over the absent chunk files). The E14B-recorded local dry-run baseline stands: created_database=true, draft_migrations_applied=10, target_promotion_executed=true, dropped_database=true, remote_database_connection=false, body_text_printed=false, embeddings_generated=false.
- `data/source-manifest/` IS present in the clone (SOURCE_MANIFEST.jsonl plus summary, duplicates, unknown-files reports). Manifest-level checks in this pass ran against it.
- The three metadata QA validators run cleanly here because their inputs are committed metadata-only artifacts. All three passed in this pass (see 08 scorecard and the validation log in `00_FABLE5_LAUNCH_ACCELERATION_REPORT.md`).

Nothing about this environment difference changes any conclusion in this package. It only changes which validators could be re-executed live during this pass. Re-running the two data-dependent validators on the Mac Studio is listed as a step in `14_PHASED_LAUNCH_RUNWAY_TO_INTERNAL_QA.md`.

## 3. Phase history at a glance

| Phase | What it produced | Status |
|---|---|---|
| Architecture review (2026-06-10) | 14-doc review; NO-GO gate decision on the 2021 flat-string corpus; component classification; rebuild plan | Complete, adopted as direction |
| Phase A/B | Source-of-record manifest (`data/source-manifest/`, 677 manifest rows hashed and classified; 647 distinct source files reached the preview corpus) | Complete |
| Phase C (pilot plus expansion) | PDF-to-structured-chunk ingestion; EXPANDED_AUTHORITY_CHUNKS.jsonl (local-only); extraction QA reports | Complete, extraction QA pending on 4,198 chunks |
| Phase D | Authority schema design (units, versions, chunks, aliases, warnings, audit tables, gates) | Complete |
| E1-E4 | Implementation plan, local disposable dry run, target promotion logic, blocker remediation | Complete |
| E5-E6 | Migration readiness, local migration rehearsal (10 files) | Complete |
| E7-E8 | Preview planning, schema-only preview execution on project ref `clerihqbjyczarqkiqnb` (no corpus rows) | Complete; migration-history caveat opened |
| E9-E10B | Preview corpus load planning plus load dry run | Complete |
| E11 | Preview corpus QA (6,590 chunks loaded gated; 0 displayable) | Complete |
| E12A/E12B | Blocker triage; retrieval and citation QA (read-only) | Complete |
| E13A | Metadata remediation review queues (9 CSVs, 8,275 queue rows across 7 categories) | Complete, validated |
| E13B | Expanded read-only retrieval/citation QA; all gates verified closed | Complete |
| E14A | Draft remediation artifact templates and checklists | Complete, validated |
| E14B | Populated candidate remediation artifacts (7 CSVs plus manifests) | Complete, validated, pending corpus-admin review |
| E14C or E15A | Not started; this is the pending owner decision | Pending |

## 4. Confirmed preview corpus posture (from E13B/E14B, read-only evidence)

| Item | Value |
|---|---|
| Preview project ref | `clerihqbjyczarqkiqnb` (preview, not production) |
| Authority chunks | 6,590 |
| Source files | 647 |
| Citation aliases | 3,598 |
| Displayable chunks | 0 |
| Black-letter displayable chunks | 0 |
| Internal-QA restricted chunks | 6,590 |
| Populated embeddings | 0 |
| DCS chunks (all guardrail/reference only) | 2,014 |
| DCS production-eligible chunks | 0 |
| TRE chunks (all limited-scope) | 533 |
| TRE non-limited-scope chunks | 0 |
| Future-effective versions | 16 |
| Unknown-effectivity versions | 15 |
| QA-signoff-required versions | 439 |
| Production lookup probe rows | 0 for every family and scope |

## 5. Remediation queue baseline (E13A queues, E14B candidates)

| Category | Queue rows | E14B candidate rows | Candidate disposition |
|---|---:|---:|---|
| Unresolved identity | 38 (17 units, 21 chunks) | 38 | pending_corpus_admin_review |
| Unknown effectivity | 54 (15 versions, 39 chunks) | 54 | pending_effectivity_review |
| QA signoff required | 439 versions | 439 | pending_qa_signoff |
| DCS document-anchored | 1,146 chunks | 1,146 | guardrail_reference_only_pending_mapping |
| Restricted Lexis | 2,392 chunks | 2,392 | restricted_internal_qa_only |
| Pending extraction QA | 4,198 chunks | 4,198 | pending_extraction_qa |
| DCS handbook reconciliation | 8 checklist rows (1 historical issue) | 8 | evidence_required |

## 6. Standing prohibitions confirmed intact at baseline

- No app integration with the preview corpus exists (verified: no app code references `legal_authority`).
- No embeddings generated (0 populated; embedding column is a nullable placeholder).
- Display gates closed (0 displayable through both view and RPC probes).
- DCS is guardrail/reference only; production-answer authority prohibited.
- TRE is limited-scope only.
- Restricted Lexis content is internal-QA only and non-displayable.
- Production is untouched.
- Titles 39, 40, 55 and web retrieval remain excluded.
- Migration-history caveat remains open (preview schema applied via `db query --file`, not recorded in the migration ledger).

## 7. What this pass adds

Only new local files under `docs/fable5-launch-acceleration/` and `scripts/launch_readiness/`. No existing file is modified. Nothing is staged or committed.
