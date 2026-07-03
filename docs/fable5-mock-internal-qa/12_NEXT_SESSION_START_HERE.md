# 12 - Next Session Start Here (post-F5-05)

Date: 2026-07-02

## State at the end of F5-05

- Branch `feature/qa-research-mock-only` carries: F5-04 mock implementation (`c3eef92`) plus this phase's QA acceptance package under `docs/fable5-mock-internal-qa/` and `scripts/launch_readiness/validate_f5_05_mock_internal_qa.py`. App implementation code UNCHANGED in F5-05.
- QA verdicts: all ten phase questions answered (doc 00); 20/20 golden-query categories exercised (19 pass, 1 assertion gap G1); 21/21 templates reviewed (15 accept, 4 revise, 2 owner decisions, 0 reject); no app-code defect found.
- PR #4: draft, classified ready-for-review / not-ready-for-merge; gate = owner template sign-off + branch policy (pr-acceptance/pr4_do_not_merge_until.md). PR #3 untouched.
- Corpus side unchanged: preview gated (0 displayable, 0 embeddings), production untouched, O1/E14-C still the critical path.
- Owner actions pending: the three decisions in doc 10 (template sign-off, PR #4 policy, next phase).

## First commands of the next session

```bash
git fetch origin feature/qa-research-mock-only
git switch feature/qa-research-mock-only
git log --oneline -5
cd app && npm test && cd ..
python3 scripts/launch_readiness/validate_f5_04_mock_app_implementation.py
python3 scripts/launch_readiness/validate_f5_05_mock_internal_qa.py
```

## Read in this order

1. `00_F5_05_MOCK_INTERNAL_QA_REPORT.md` (ten answers + findings register)
2. `10_OWNER_REVIEW_PACKET.md` (whether the owner has decided; if not, stop and wait)
3. `11_NEXT_PHASE_PROMPT.md` (the two prompt blocks; use only after doc 10 decisions exist)

## Do-not list (unchanged)

No Supabase commands; no preview/production contact; no live bindings; no embeddings; no display-gate changes; no migration/loader/ingestion/PDF/generated-corpus edits; no legal body text; no secrets; no new dependencies; PR #3 and PR #4 stay draft; sessions never merge.

## Environmental notes for cloud clones

`validate_expanded_chunks_for_load.py` and the disposable-DB dry run need gitignored Mac-Studio-only inputs and fail with FileNotFoundError in cloud clones (expected). Two pre-existing typecheck errors live in legacy test files (G2); do not fix them in a mock-phase session without owner instruction.
