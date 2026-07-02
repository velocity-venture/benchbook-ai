# Query Inventory And Safety Review

Date: 2026-06-29

## Local SQL files

| SQL file | Category | Output |
|---|---|---|
| `/tmp/benchbook_e13b_sql/01_function_policy_recheck.sql` | Function, RLS, policy, views, embeddings | Metadata counts and signatures |
| `/tmp/benchbook_e13b_sql/02_family_retrieval_probes.sql` | Family retrieval gates | Counts by authority family |
| `/tmp/benchbook_e13b_sql/03_scope_retrieval_probes.sql` | Scope retrieval gates | Counts by answer scope |
| `/tmp/benchbook_e13b_sql/04_citation_alias_family_probes.sql` | Citation alias family probes | Alias counts and lookup counts |
| `/tmp/benchbook_e13b_sql/05_gate_effectivity_probes.sql` | Restricted, pending, DCS, TRE, effectivity gates | Gate counts |
| `/tmp/benchbook_e13b_sql/06_queue_risk_reconciliation.sql` | E13-A queue to remote count reconciliation | Blocker counts |

## Safety screening

All SQL files were screened before remote execution. Each query began with `select` or `with`. No prohibited remote write statement start was present. No forbidden production target identifier was present in the SQL files.

## Remote execution

Each query was run with `supabase db query --linked --output-format json` after target verification. Raw JSON outputs are stored under `/tmp/benchbook_e13b_results/`.

## Body-passage exclusion

The queries did not select chunk body fields, source passages, page text, OCR text, or long excerpts.
