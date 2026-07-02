# 19 - Next Session Start Here

Package date: 2026-07-02
Phase: F5-03 (file-level app integration implementation plan and mock-backend feature-branch design)
Branch: `refactor/codex-gpt55-launch-prep`; baseline HEAD `a918f6b`

## What F5-03 produced

`docs/fable5-file-level-app-plan/`: 20 docs, 5 file maps, 7 mock-backend design JSONs, 8 test-plan JSONs, 5 manifests, 5 dashboards, plus `scripts/launch_readiness/validate_fable5_file_level_app_plan.py`. Everything is a PLAN: no app code, config, migration, script, PDF, or corpus file changed; no database contact; preview still gated; production untouched.

## The plan in one paragraph

A future owner-approved phase (F5-04/M1) creates 26 new files (route `api/qa-research`, page, 15 modules under `lib/qa-research/`, 9 test suites plus synced scenario copies) and touches exactly 3 existing files (sidebar nav block, optional package.json script, .env.example docs). The mock backend is the first binding of the real `LegalRetrievalAdapter` interface: synthetic SYNTHETIC-marked fixtures, contract-compliant envelopes, MOCK_ONLY labeling, structural production blocking, and 57 scenarios plus static-safety tests proving no general fallback, mandatory citations, excluded-title refusals, judicial guardrails, audit presence, and target controls. The 13-step commit sequence and stop conditions bind the implementer. Everything Supabase-side stays frozen; the real adapter arrives only in F5-05 behind the O6/O2/O7 gate chain.

## Who does what next

| Actor | Next action | Where |
|---|---|---|
| Owner | Sign M-1 (approve M1 implementation) and ratify M-2 defaults; O1 and P1/P2 remain from prior packets | `16_OWNER_DECISION_PACKET.md` |
| Codex | After M-1: execute M1 per the sequenced prompt | `17_NEXT_CODEX_MOCK_IMPLEMENTATION_PROMPT.md` |
| Fable 5 (before 2026-07-07) | Security and target-control review of app plus deployment model (read-only) | `18_NEXT_FABLE5_PROMPT.md` |
| Corpus admin | E14C prep and golden-query authoring (unchanged, still gated on O1) | F5-01 docs 05 and 11 |

## Validation quickstart

```bash
python3 scripts/metadata_qa/validate_e13a_review_queues.py
python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py
python3 scripts/metadata_qa/validate_e14b_candidate_artifacts.py
python3 scripts/launch_readiness/validate_fable5_launch_acceleration.py
python3 scripts/launch_readiness/validate_fable5_app_integration_readiness.py
python3 scripts/launch_readiness/validate_fable5_file_level_app_plan.py
```

Mac Studio only: the static chunk validator and disposable-DB dry run (gitignored inputs).

## Standing prohibitions

Unchanged: no Supabase commands, no remote contact, no reload without O6, no production ever without a distinct approval, no embeddings, no app-code changes without M-1/O7-chain, no migration or existing-script edits, no legal body text or secrets, no Titles 39/40/55, no web retrieval, no display-gate changes without O2. Draft PR #3 is tracking-only: never mark ready, never merge.
