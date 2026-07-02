# 19 - Next Session Start Here

Package date: 2026-07-02
Phase: F5-02 (app integration readiness contract and mock-only QA harness design)
Branch: `refactor/codex-gpt55-launch-prep`; baseline HEAD `2a8cc66`

## What F5-02 produced

`docs/fable5-app-integration-readiness/`: 20 docs, 6 JSON contracts, 6 mock-harness scenario files, 5 manifests, 5 dashboards, plus `scripts/launch_readiness/validate_fable5_app_integration_readiness.py`. All local-only; no app code, migrations, loaders, ingestion scripts, PDFs, or corpus sources touched; no database contact; preview still gated (0 displayable, 0 embeddings); production untouched.

## State of the world (one paragraph)

The app is fully disconnected from the legal authority database (verified again this pass: zero references in `app/src`). The contracts that will govern the connection are now written: retrieval (doc 03), citations (04), refusals (05), guardrails (06), DCS/TRE scope (07), restricted/pending/effectivity (08), audit (09), UI labeling (10), security/RLS (11). The mock-only harness that proves them without any database is designed (doc 12, 56 scenarios) and the golden suite is specified (doc 13). Stop conditions are fixed (doc 14). The phase plan (doc 15) makes F5-03 (design review, file-level plan) the next step, then F5-04 (feature-branch build, mock backend only), then E15-B (reload planning). Corpus-side, everything still queues behind owner decision O1 (approve E14C review) from the F5-01 packet.

## Who does what next

| Actor | Next action | Where |
|---|---|---|
| Owner | O1 (still); then P1 (ratify contracts) and P2 (approve F5-03) from this packet | `16_OWNER_DECISION_PACKET.md` |
| Fable 5 (before 2026-07-07) | F5-03 design pass | `18_NEXT_FABLE5_PROMPT.md` |
| Codex | Verify this package on the Mac Studio; optional object-verification tooling | `17_NEXT_CODEX_EXECUTION_PROMPT.md` |
| Corpus admin | E14C prep and golden-query authoring (unchanged) | F5-01 docs 05 and 11 |

## Validation quickstart

```bash
python3 scripts/metadata_qa/validate_e13a_review_queues.py
python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py
python3 scripts/metadata_qa/validate_e14b_candidate_artifacts.py
python3 scripts/launch_readiness/validate_fable5_launch_acceleration.py
python3 scripts/launch_readiness/validate_fable5_app_integration_readiness.py
```

Mac Studio only: `validate_expanded_chunks_for_load.py --json` and the disposable-DB dry run (inputs are gitignored local artifacts absent from cloud clones).

## Standing prohibitions

Unchanged from F5-01 doc 18: no Supabase commands, no remote contact, no reload without O6, no production ever without a distinct launch approval, no embeddings, no app-code changes without O7-design/O7, no migration or existing-script edits, no legal body text or secrets in artifacts, no Titles 39/40/55, no web retrieval, no display-gate changes without O2.
