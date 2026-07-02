# 18 - Next Session Start Here

Date of this package: 2026-07-01
Branch: `refactor/codex-gpt55-launch-prep`
Baseline HEAD when written: `660967a`. The package was committed on top of that baseline at session close because the pass ran in an ephemeral cloud container where uncommitted work does not survive (see 00 report, compliance section). Only the package files are in that commit.

## What happened in the 2026-07-01 Fable 5 pass

A local-only launch acceleration pass created `docs/fable5-launch-acceleration/` (19 docs, 5 manifests, 5 dashboards) and `scripts/launch_readiness/validate_fable5_launch_acceleration.py`. Nothing was staged or committed. No database was contacted. No prohibited action occurred. The pass ran in a cloud clone; the gitignored corpus data files were absent there, so the two data-dependent validators must be re-proven on the Mac Studio (the Codex prompt, doc 16, does exactly that).

## State of the world (one paragraph)

Preview corpus: 6,590 chunks, 647 source files, 3,598 aliases, 0 displayable, 0 embeddings, all gates closed, production untouched. E14B candidate remediation artifacts (8,275 rows across 7 queues) are complete, validated, and awaiting human review. The app has never been connected to the corpus. The full blocker list lives in `manifests/launch_blocker_manifest.json`; the readiness picture in `08_INTERNAL_QA_LAUNCH_READINESS_SCORECARD.md`; the plan in `14_PHASED_LAUNCH_RUNWAY_TO_INTERNAL_QA.md`.

## Reading order for a new session

1. This file.
2. `00_FABLE5_LAUNCH_ACCELERATION_REPORT.md` (the whole picture).
3. `15_OWNER_DECISION_PACKET.md` (if you are the owner: O1 is the decision that unblocks everything).
4. `dashboards/owner_launch_dashboard.md` or `dashboards/technical_launch_dashboard.md` depending on your role.
5. The doc matching your task (02-14).

## Who does what next

| Actor | Next action | Where it is specified |
|---|---|---|
| Owner (Judge Eckel) | Decide O1 (approve E14C review); skim O2-O5 recommended defaults | `15_OWNER_DECISION_PACKET.md` |
| Codex (Mac Studio) | Verify and commit this package; optionally build patch tooling | `16_NEXT_CODEX_EXECUTION_PROMPT.md` |
| Claude Fable 5 (before 2026-07-07) | App-integration readiness design and QA harness plan (design only) | `17_NEXT_CLAUDE_FABLE5_PROMPT.md` |
| Corpus admin | Prepare for E14C review sessions; start authoring golden queries | `05_METADATA_REMEDIATION_STATUS_AND_NEXT_ACTIONS.md`, `11_GOLDEN_QUERY_AND_CITATION_QA_PLAN.md` |

## Validation quickstart (any session, any machine)

```bash
python3 scripts/metadata_qa/validate_e13a_review_queues.py
python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py
python3 scripts/metadata_qa/validate_e14b_candidate_artifacts.py
python3 scripts/launch_readiness/validate_fable5_launch_acceleration.py
```

On the Mac Studio only (requires gitignored data files and local Postgres):

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_static_validation.json
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_local_dry_run.json
```

## Standing prohibitions (apply to every future session until the owner changes them in writing)

No Supabase commands, no remote database contact, no preview reload execution without O6, no production contact ever (separate launch approval required), no embeddings, no app-code changes without O7, no migration changes, no edits to existing ingestion/loader scripts, no legal body text or secrets in committed artifacts, no Titles 39/40/55, no web retrieval, no display-gate changes without O2.
