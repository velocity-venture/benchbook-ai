# Query Inventory And Safety Review

Date: 2026-06-29

## SQL safety screen

Five SQL probe files were created under `/tmp/benchbook_e12b_sql/` and screened before execution.

Screening required every file to begin with `select` or `with`, and rejected any prohibited write statement start:

- insert
- update
- delete
- truncate
- create
- alter
- drop
- grant
- revoke
- copy
- call
- execute
- repair
- push
- pull
- reset
- migrate

Screen result: passed.

## Remote query inventory

| Temp SQL file | Category | Remote result file |
|---|---|---|
| `01_policy_function_embedding.sql` | schema, RLS, policies, functions, audit privacy, embedding checks | `/tmp/benchbook_e12b_results/01_policy_function_embedding.json` |
| `02_production_retrieval_gates.sql` | display views, search probes, display exclusions, DCS display gates | `/tmp/benchbook_e12b_results/02_production_retrieval_gates.json` |
| `03_citation_alias_lookup.sql` | citation alias counts, alias collision checks, lookup probes, forbidden-title metadata checks | `/tmp/benchbook_e12b_results/03_citation_alias_lookup.json` |
| `04_internal_qa_metadata.sql` | internal QA view, display status, answer scope, family counts, review metadata columns | `/tmp/benchbook_e12b_results/04_internal_qa_metadata.json` |
| `05_scope_effectivity.sql` | DCS, TRE, effectivity, QA signoff, unresolved identity counts | `/tmp/benchbook_e12b_results/05_scope_effectivity.json` |

## Output limits

The remote queries returned counts, booleans, function signatures, policy metadata, IDs only where needed internally, and grouped metadata. They did not select chunk text, source text, legal body text, or long excerpts.

`log_refusal_record(...)` was not called because it writes audit data.
