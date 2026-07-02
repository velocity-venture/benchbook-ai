# Technical Launch Dashboard

Date: 2026-07-01 (Fable 5 launch acceleration pass)

## Pipeline state

| Stage | State | Evidence |
|---|---|---|
| Source manifest | GREEN | 677 hashed rows committed, dup groups reconciled |
| Ingestion (expanded) | GREEN | Chunks generated with restriction/QA tagging (local-only artifacts on Mac Studio) |
| Static chunk validation | GREEN (last run on Mac Studio, E14B baseline) / NOT RUNNABLE in cloud clones | Re-prove in X1 |
| Local disposable dry run | GREEN (E14B baseline: 10 migrations, promotion, drop verified) | Re-prove in X1 |
| Preview schema (E8) | GREEN | Object-verified; ledger caveat open (O5 fence pending) |
| Preview corpus load (E10B/E11) | GREEN, gated | 6,590 chunks, 0 displayable, probes all zero |
| Metadata queues (E13A) | GREEN | Validator PASS re-run 2026-07-01 |
| Candidate artifacts (E14B) | GREEN | Validator PASS re-run 2026-07-01 |
| Corpus-admin review (E14C) | NOT STARTED | Gate: O1 |
| Patch tooling (P3) | NOT BUILT | Spec in doc 16 Part 2 |
| Preview reload (E15) | NOT PLANNED-EXECUTABLE YET | Readiness audit: `../06_PREVIEW_RELOAD_READINESS_AUDIT.md` |
| App integration | NOT AUTHORIZED | Contract: `../07_APP_INTEGRATION_DEFERRAL_AND_REQUIRED_CONTRACT.md` |
| QA harness | DESIGNED ONLY | Docs 10 and 11 |

## Known technical debts and gaps

| ID | Item | Where |
|---|---|---|
| G1 | search RPC lacks answer_scope filter (TRE) | doc 03; O3 |
| G2 | No purpose-built internal-QA reference RPC | doc 03; contract C10 |
| G3 | Text-delivery path for app undefined | doc 03; design phase |
| G5 | query_excerpt must stay hash-only in production | doc 12 |
| T1 | E6 rehearsal migrations in default migrations dir (db-push hazard) | doc 13; O5 |
| T2 | Deploy scripts lack target allowlists | doc 13 |
| A2 | Alias coverage vs judge phrasing untested | doc 04; golden block GB6 |
| R7 | Shipping app still answers from 2021 corpus (demo-only discipline) | doc 08 |

## Validation commands (this pass, cloud clone)

| Command | Result |
|---|---|
| validate_e13a_review_queues.py | PASS |
| validate_e14a_draft_artifacts.py | PASS |
| validate_e14b_candidate_artifacts.py | PASS |
| validate_fable5_launch_acceleration.py | PASS (created this pass) |
| validate_expanded_chunks_for_load.py --json | NOT RUNNABLE HERE (gitignored inputs absent; expected; rerun on Mac Studio) |
| dry_run_load_legal_authority.py --create-local-db --drop-after | NOT RUNNABLE HERE (same reason) |
| Secret/body-text guardrail scans over new folders | CLEAN |
