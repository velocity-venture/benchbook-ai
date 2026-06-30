# Next Session Start Here

Date: 2026-06-29

## Current phase

E14-A local metadata remediation implementation planning.

## Repository posture

- Branch: `refactor/codex-gpt55-launch-prep`
- Latest expected commit before E14-A: `6fbf1e3 Add Phase E13B retrieval citation QA package`
- E14-A files are local-only draft artifacts and planning docs.
- No files should be staged or committed by E14-A unless a later owner instruction changes that.

## First commands for the next session

```bash
pwd
git branch --show-current
git status --short
git log --oneline -10
python3 scripts/metadata_qa/validate_e13a_review_queues.py
python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py
find docs/preview-corpus-e14 scripts/metadata_qa -type f | sort
```

## Read first

1. `CODEX-SOURCE-OF-TRUTH.md`
2. `CODEX-BRIEF.md`
3. `docs/preview-corpus-e14/00_PHASE_E14A_LOCAL_METADATA_REMEDIATION_IMPLEMENTATION_PLAN.md`
4. `docs/preview-corpus-e14/13_OWNER_DECISION_PACKET_FOR_E14B_OR_E15.md`
5. `docs/preview-corpus-e14/14_NEXT_PHASE_PROMPT.md`

## Baseline to preserve

- Displayable rows remain zero.
- Restricted and pending QA rows remain non-displayable.
- DCS remains guardrail/reference only and production eligible zero.
- TRE remains limited-scope.
- Unknown and future effectivity rows remain gated.
- No embeddings.
- No app integration.
- No production Supabase contact.
- No preview writes unless separately approved in a later phase.

## Recommended next owner decision

Approve E14-B local metadata remediation artifact implementation. Do not approve preview reload execution yet.
