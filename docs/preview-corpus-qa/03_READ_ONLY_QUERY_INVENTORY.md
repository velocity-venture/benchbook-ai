# Read-Only Query Inventory

Date: 2026-06-28

## Query safety screen

Five SQL probes were created under `/tmp/benchbook_e11_sql/` and screened before execution.

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
- do
- execute
- repair
- reset

Screen result: passed.

## Remote query categories

| Temp SQL file | Category | Result file |
|---|---|---|
| `01_target_schema_metadata.sql` | schema, view, function, and RLS inventory | `/tmp/benchbook_e11_results/01_target_schema_metadata.json` |
| `02_row_family_source_counts.sql` | table counts, family counts, source-type counts, forbidden-title metadata counts | `/tmp/benchbook_e11_results/02_row_family_source_counts.json` |
| `03_gate_and_scope_counts.sql` | display views, retrieval probes, display status, answer scope, DCS and TRE checks | `/tmp/benchbook_e11_results/03_gate_and_scope_counts.json` |
| `04_effectivity_integrity_privacy.sql` | effectivity, duplicate checks, audit-column checks, embedding checks, policies | `/tmp/benchbook_e11_results/04_effectivity_integrity_privacy.json` |
| `05_blocker_metadata_counts.sql` | unresolved identity, document-anchored rows, restricted rows, pending QA blockers | `/tmp/benchbook_e11_results/05_blocker_metadata_counts.json` |

All remote SQL was count-only or metadata-only. No query selected `text`, `raw_json`, corpus body text, source text, or long excerpts.

## RPC handling

`search_displayable_chunks(...)` and `lookup_citation_alias(...)` were called only as count probes. Both returned zero rows because display gates remain closed.

`log_refusal_record(...)` was not called because it writes audit data.
