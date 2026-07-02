# 13 - Production Prohibition and Target Control Plan

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration

## 1. Standing rule

Production (`benchbook-ai-prod`, ref `suiylfayvjsjtbrsjrwx`) is untouched and remains untouchable by every corpus, schema, retrieval, and integration activity described in this package. Nothing in the internal QA launch definition uses production. This rule has held through fourteen phases and is re-affirmed unchanged.

## 2. Target registry

| Target | Identifier | Permitted operations | Approval state |
|---|---|---|---|
| Local disposable databases | `benchbook_e4_dry_run_*` (generated names) | Create, migrate, load, verify, drop; local-only by construction (loader refuses non-local hosts) | Standing approval for local-only QA |
| Preview | project `benchbook-ai`, ref `clerihqbjyczarqkiqnb` | Read-only QA anytime a phase authorizes it; schema/load writes only with a phase-specific written owner approval naming the exact action | Currently: no writes approved; reload requires O6 |
| Production | project `benchbook-ai-prod`, ref `suiylfayvjsjtbrsjrwx` | None. No reads, no writes, no linking, no migration commands | Prohibited until a distinct production launch approval that does not exist yet |

## 3. Technical controls that exist (verified in repo)

1. `dry_run_load_legal_authority.py` hard-refuses non-local database targets (RuntimeError).
2. `build_preview_corpus_load_sql.py` encodes the approved preview target and the forbidden production identifiers, and refuses to write body-text SQL inside the repository.
3. Deny-by-default schema gates make accidental display impossible even after an accidental load.
4. The E10 object-verification catalog gives a pre-write target fingerprint procedure.
5. Metadata validators refuse artifacts containing connection strings or secret-shaped values.

## 4. Control gaps and the fence plan

| # | Gap | Plan |
|---|---|---|
| T1 | E6 rehearsal legal_authority migrations live in `supabase/migrations/` where a routine `supabase db push` would pick them up | Owner decision O5: fence them (move to `supabase/migrations_local_rehearsal/` or equivalent) in a small, separately-approved Codex commit. Until then: standing instruction that no one runs `db push` on any linked project |
| T2 | App deploy scripts (`deploy_supabase.sh`, `setup_supabase.sh`) push migrations without a target allowlist | Integration-era revision: add explicit project-ref allowlist checks and refuse unknown refs. Not modified in this pass (prohibited) |
| T3 | No single TARGETS.md registry; target facts are spread across phase docs | Section 2 of this document now serves as the registry; next Codex phase may lift it to a root-level doc if the owner wants |
| T4 | Human-procedure drift risk across sessions | Every future execution prompt (docs 16, 17) carries the prohibition block verbatim; validators check that no artifact claims prohibited actions occurred |

## 5. Session start ritual (for any future phase that touches a database)

1. State the intended target and operation in the session log before any command.
2. Read-only object verification against the intended target; abort on drift.
3. Confirm the owner approval document exists and names this exact action.
4. Execute only the approved action; log every command.
5. Re-verify gates after; record results in the phase package.

## 6. Prohibited permanently (independent of phase approvals)

- Loading corpus rows into production.
- Opening any display gate on production.
- Pointing the app's legal_authority path at production.
- Adding Titles 39/40/55 or web retrieval to any target.
- Migration history repair, reset, or `db push` against preview or production without a written owner approval naming that exact operation.
