# 16 - Next Codex Execution Prompt

Copy the block below into the next Codex session on the Mac Studio.

---

You are Codex operating in the BenchBook.AI repository at `~/Projects/benchbook-ai`, branch `refactor/codex-gpt55-launch-prep`.

A Claude Fable 5 launch acceleration pass (2026-07-01) created these artifacts:

- `docs/fable5-launch-acceleration/` (19 docs, `manifests/` with 5 JSON files, `dashboards/` with 5 dashboards)
- `scripts/launch_readiness/validate_fable5_launch_acceleration.py`

The pass ran in an ephemeral cloud container, so the package was committed and pushed to `refactor/codex-gpt55-launch-prep` at session close to survive container reclamation (commit "Add Fable 5 launch acceleration package"). Your Part 1 is therefore verification of the committed package rather than committing it yourself.

Your job, in order:

## Part 1: Verify the committed Fable 5 package

1. Pre-checks: `git pull origin refactor/codex-gpt55-launch-prep`; `git branch --show-current` must print `refactor/codex-gpt55-launch-prep`; `git log --oneline -2` must show the Fable 5 package commit on top of `660967a`; `git status --short` should be clean (plus anything you know about from other authorized local work).
2. Run, and require PASS from each:
   - `python3 scripts/metadata_qa/validate_e13a_review_queues.py`
   - `python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py`
   - `python3 scripts/metadata_qa/validate_e14b_candidate_artifacts.py`
   - `python3 scripts/launch_readiness/validate_fable5_launch_acceleration.py`
   - `python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_x1_static_validation.json` (this machine has the gitignored `data/ingestion-expanded/` inputs; it must pass here)
   - `python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_x1_local_dry_run.json` (local disposable only; confirm `dropped_database: true` in the output)
3. Guardrail scans over the new folders (no secrets, no body-text columns). The pattern is assembled from parts so this prompt file does not itself contain the trigger strings; paste the block as-is:

   ```bash
   PAT='BEG''IN RSA|PRIV''ATE KEY|SUPABASE_ACC''ESS_TOKEN|serv''ice_role|postgre''sql://|postgr''es://|pass''word[[:space:]]*=|Bea''rer|j''wt|ey''J|COPY .*autho''rity_chunks|\\co''py'
   grep -RniE "$PAT" docs/fable5-launch-acceleration scripts/launch_readiness && echo "GUARDRAIL HITS FOUND" || echo "guardrail scan clean"
   ```

   Expect "guardrail scan clean". The Fable 5 validator (step 2) performs an equivalent scan internally; this grep is the independent double-check.
4. Read `docs/fable5-launch-acceleration/00_FABLE5_LAUNCH_ACCELERATION_REPORT.md` and confirm its claims match what you verified (note: the Fable pass ran in a cloud clone without the gitignored data files; your machine is where the two data-dependent validators must now prove green).
5. Record the verification results. If any check fails or any package statement is wrong, correct the affected package files in a follow-up commit `Fable 5 package verification corrections` on `refactor/codex-gpt55-launch-prep` only; otherwise no commit is needed for Part 1.

## Part 2 (optional, only if Part 1 is fully green): next safe local implementation phase

Build the patch-application tooling (readiness item P3 from `06_PREVIEW_RELOAD_READINESS_AUDIT.md`), strictly local:

1. Create `scripts/metadata_qa/apply_e14_candidate_decisions.py`: reads the E14B candidate CSVs, consumes only rows whose `decision_status` is an approved terminal state, and emits a patched metadata overlay (JSONL of chunk/unit/version metadata deltas) to `data/ingestion-expanded/PATCHED_METADATA_OVERLAY.jsonl` (gitignored path) plus a metadata-only summary JSON under `docs/` (counts only, no body text).
2. Do not modify existing ingestion or loader scripts. The overlay is a new input; wiring it into SQL generation happens in a later approved phase.
3. Validate: row counts reconcile with the candidate manifests; no body-text fields in any committed artifact; secret scans clean.
4. Add a validator `scripts/metadata_qa/validate_patch_overlay.py` mirroring the existing validator conventions (stdlib only, print-only, exit 1 on failure).
5. Commit as `Add E14 candidate decision application tooling (local-only)` if and only if all validators pass. Nothing else in the commit.

## Prohibitions (unchanged, absolute)

No Supabase commands of any kind, no remote psql, no preview or production contact, no reload execution, no embeddings, no app code changes, no migration changes, no edits to existing ingestion/loader scripts, no source PDF changes, no edits under `data/ingestion-expanded/` except the new overlay output file, no display-gate changes, no legal body text or secrets in any committed file.

Stop immediately and report if any step appears to require a prohibited action.

Final response must include: git status, validators run with results, files committed, confirmation that no remote/Supabase command ran, and whether Part 2 was attempted.
