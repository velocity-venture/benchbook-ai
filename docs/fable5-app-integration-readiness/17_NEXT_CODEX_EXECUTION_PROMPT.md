# 17 - Next Codex Execution Prompt

Copy the block below into the next Codex session on the Mac Studio.

---

You are Codex operating in the BenchBook.AI repository at `~/Projects/benchbook-ai`, branch `refactor/codex-gpt55-launch-prep`.

A Claude Fable 5 pass (F5-02, 2026-07-02) created the app-integration readiness package:

- `docs/fable5-app-integration-readiness/` (20 docs, `contracts/` 6 JSON, `mock-harness/` 6 JSON, `manifests/` 5 JSON, `dashboards/` 5 md)
- `scripts/launch_readiness/validate_fable5_app_integration_readiness.py`

## Part 1: Verify the F5-02 package

1. Pre-checks: `git branch --show-current` = `refactor/codex-gpt55-launch-prep`; HEAD descends from `2a8cc66`; note whether the F5-02 files arrive committed (cloud-session persistence) or uncommitted; if uncommitted, verify then commit them as `Add Fable 5 app integration readiness package (F5-02)` with nothing else in the commit.
2. Run, require PASS:
   - `python3 scripts/metadata_qa/validate_e13a_review_queues.py`
   - `python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py`
   - `python3 scripts/metadata_qa/validate_e14b_candidate_artifacts.py`
   - `python3 scripts/launch_readiness/validate_fable5_launch_acceleration.py`
   - `python3 scripts/launch_readiness/validate_fable5_app_integration_readiness.py`
   - `python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_f502_static.json` (must pass on this machine)
   - `python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_f502_dryrun.json` (confirm dropped_database true)
3. Guardrail scan (pattern assembled from parts so this file stays clean):

   ```bash
   PAT='BEG''IN RSA|PRIV''ATE KEY|SUPABASE_ACC''ESS_TOKEN|serv''ice_role|postgre''sql://|postgr''es://|pass''word[[:space:]]*=|Bea''rer|j''wt|ey''J|COPY .*autho''rity_chunks|\\co''py'
   grep -RniE "$PAT" docs/fable5-app-integration-readiness scripts/launch_readiness && echo "GUARDRAIL HITS" || echo "clean"
   ```

## Part 2 (only if Part 1 green and the owner has approved P2): execute F5-03 support work

F5-03 is design-led; if a Fable session runs it, your part is the mechanical support:

1. Build `scripts/launch_readiness/verify_preview_objects_spec.md` implementation: `scripts/database_load/verify_legal_authority_objects.py` per F5-01 S2 (object-verification: schemas, tables, views, functions with security-definer status, RLS enabled, no broad chunk policy). It must accept `--local` (runs against a local disposable DB created by the existing dry-run tooling) and refuse remote targets exactly like the dry-run loader. Do NOT point it at preview in this phase.
2. Validate it against a local disposable database; include `--json` output.
3. Commit as `Add local object verification tooling` only if green.

## Prohibitions (unchanged, absolute)

No Supabase commands, no remote psql, no preview or production contact, no reload, no embeddings, no app code changes, no migration changes, no edits to existing ingestion/loader scripts, no source PDF changes, no legal body text or secrets in committed files.

Stop immediately and report if any step appears to require a prohibited action.

Final response: git status, validators run with results, whether Part 2 was attempted, confirmation no remote/Supabase command ran.
