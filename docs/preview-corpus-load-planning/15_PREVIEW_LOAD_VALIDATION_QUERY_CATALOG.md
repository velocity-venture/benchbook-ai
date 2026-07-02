# Preview Load Validation Query Catalog

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E9 planning only

No query in this file was run against any remote database in E9. This is a catalog for a future owner-approved E10 only.

Do not paste secrets, database URLs, passwords, tokens, or service-role keys into commands, logs, docs, or commit messages. Do not run these checks against production.

## Use rules

These snippets are intended to be adapted by a future E10 executor after target verification. They are not an execution transcript.

Target identity cannot be proven by SQL alone. A database name, role name, or schema inventory can support verification, but the E10 operator must separately verify the Supabase project name and project ref before any remote command.

## Schema presence

```sql
select schema_name
from information_schema.schemata
where schema_name in ('legal_authority', 'legal_authority_stage')
order by schema_name;
```

Expected result: both schemas are present.

## Table inventory

```sql
select table_schema, table_name
from information_schema.tables
where table_schema in ('legal_authority', 'legal_authority_stage')
  and table_type = 'BASE TABLE'
order by table_schema, table_name;
```

Expected result: 20 base tables.

## View inventory

```sql
select table_schema, table_name
from information_schema.views
where table_schema = 'legal_authority'
order by table_name;
```

Expected result: `v_black_letter_current_chunks`, `v_current_displayable_chunks`, and `v_internal_qa_restricted_chunks`.

## Function inventory

```sql
select n.nspname as schema_name, p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'legal_authority'
order by p.proname;
```

Expected result: `log_refusal_record`, `lookup_citation_alias`, and `search_displayable_chunks`.

## Pre-load row counts

```sql
select 'source_files' as table_name, count(*) from legal_authority.source_files
union all select 'authority_units', count(*) from legal_authority.authority_units
union all select 'authority_versions', count(*) from legal_authority.authority_versions
union all select 'authority_chunks', count(*) from legal_authority.authority_chunks
union all select 'citation_aliases', count(*) from legal_authority.citation_aliases
union all select 'retrieval_logs', count(*) from legal_authority.retrieval_logs
union all select 'answer_audit_records', count(*) from legal_authority.answer_audit_records
union all select 'citation_verification_records', count(*) from legal_authority.citation_verification_records;
```

Expected pre-load result for a clean preview baseline: zero for corpus and audit rows, except seeded family rows in `authority_families`.

## Post-load target row counts

```sql
select 'source_files' as table_name, count(*) from legal_authority.source_files
union all select 'source_file_memberships', count(*) from legal_authority.source_file_memberships
union all select 'authority_units', count(*) from legal_authority.authority_units
union all select 'authority_versions', count(*) from legal_authority.authority_versions
union all select 'authority_chunks', count(*) from legal_authority.authority_chunks
union all select 'citation_aliases', count(*) from legal_authority.citation_aliases
union all select 'chunk_warnings', count(*) from legal_authority.chunk_warnings
union all select 'extraction_warnings', count(*) from legal_authority.extraction_warnings;
```

Expected post-load counts from local proof:

| Table | Expected count |
|---|---:|
| `source_files` | 647 |
| `source_file_memberships` | 677 |
| `authority_units` | 1,321 |
| `authority_versions` | 1,343 |
| `authority_chunks` | 6,590 |
| `citation_aliases` | 3,598 |
| `chunk_warnings` | 359 |
| `extraction_warnings` | 864 |

## Staging row counts

```sql
select 'raw_source_manifest' as table_name, count(*) from legal_authority_stage.raw_source_manifest
union all select 'raw_expanded_chunks', count(*) from legal_authority_stage.raw_expanded_chunks
union all select 'raw_extraction_warnings', count(*) from legal_authority_stage.raw_extraction_warnings
union all select 'raw_deduplication_groups', count(*) from legal_authority_stage.raw_deduplication_groups;
```

Expected post-stage counts from local proof:

| Table | Expected count |
|---|---:|
| `raw_source_manifest` | 677 |
| `raw_expanded_chunks` | 6,590 |
| `raw_extraction_warnings` | 864 |
| `raw_deduplication_groups` | 12 |

## Duplicate source chunk IDs

```sql
select source_chunk_id, count(*) as row_count
from legal_authority.authority_chunks
group by source_chunk_id
having count(*) > 1
order by row_count desc, source_chunk_id;
```

Expected result: zero rows.

## Citation alias collision check

```sql
select normalized_alias, count(distinct authority_unit_id) as authority_unit_count
from legal_authority.citation_aliases
group by normalized_alias
having count(distinct authority_unit_id) > 1
order by authority_unit_count desc, normalized_alias;
```

Expected result: zero rows.

## Displayable gate count

```sql
select count(*) as displayable_chunk_count
from legal_authority.v_current_displayable_chunks;
```

Expected result after E10 dry run: 0.

## Black-letter display count

```sql
select count(*) as black_letter_displayable_count
from legal_authority.v_black_letter_current_chunks;
```

Expected result after E10 dry run: 0.

## Internal QA restricted count

```sql
select count(*) as internal_qa_restricted_count
from legal_authority.v_internal_qa_restricted_chunks;
```

Expected result after E10 dry run: 6,590.

## Pending QA and restricted rows excluded from display

```sql
select production_display_status, count(*) as row_count
from legal_authority.v_current_displayable_chunks
where production_display_status in (
  'pending_extraction_qa',
  'restricted_pending_license_review'
)
group by production_display_status
order by production_display_status;
```

Expected result: zero rows.

## DCS production-answerable exclusion

```sql
select count(*) as dcs_production_eligible_count
from legal_authority.authority_chunks c
join legal_authority.authority_versions v on v.id = c.authority_version_id
join legal_authority.authority_units u on u.id = v.authority_unit_id
join legal_authority.authority_families f on f.id = u.authority_family_id
where f.family_key = 'dcs_policies_procedures'
  and c.answer_scope = 'general_answer_authority';
```

Expected result after E10 dry run: 0.

## TRE limited-scope check

```sql
select
  count(*) filter (where c.answer_scope = 'limited_evidentiary_procedural') as tre_limited_scope_count,
  count(*) filter (where c.answer_scope <> 'limited_evidentiary_procedural') as tre_non_limited_scope_count
from legal_authority.authority_chunks c
join legal_authority.authority_versions v on v.id = c.authority_version_id
join legal_authority.authority_units u on u.id = v.authority_unit_id
join legal_authority.authority_families f on f.id = u.authority_family_id
where f.family_key = 'tennessee_rules_of_evidence';
```

Expected result after E10 dry run: 533 limited-scope rows and 0 non-limited rows.

## Future-effective visibility check

```sql
select count(*) as future_visible_before_effective_date_count
from legal_authority.v_current_displayable_chunks c
join legal_authority.authority_versions v on v.id = c.authority_version_id
where v.version_status = 'future_effective'
  and (v.effective_start_date is null or v.effective_start_date > current_date);
```

Expected result after E10 dry run: 0.

## Unknown-effectivity display check

```sql
select count(*) as unknown_effectivity_displayable_count
from legal_authority.v_current_displayable_chunks c
join legal_authority.authority_versions v on v.id = c.authority_version_id
where v.version_status = 'unknown_effectivity';
```

Expected result after E10 dry run: 0.

## RLS enabled table count

```sql
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('legal_authority', 'legal_authority_stage')
  and c.relkind = 'r'
order by n.nspname, c.relname;
```

Expected result: every base table has `relrowsecurity = true`.

## Policy inventory

```sql
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname in ('legal_authority', 'legal_authority_stage')
order by schemaname, tablename, policyname;
```

Expected result: public read policies remain limited to intended lookup/build objects and user-specific audit policies remain scoped.

## Authority-chunk direct read policy check

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'legal_authority'
  and tablename = 'authority_chunks'
order by policyname;
```

Expected result: no broad direct read policy for `authority_chunks`.

## Embedding column and populated value check

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'legal_authority'
  and table_name = 'authority_chunks'
  and column_name = 'embedding';
```

Expected result: if no embedding column exists, no embeddings can be populated. If an embedding column exists in a later phase, E10 must separately verify that no rows have non-null embedding values.

## App integration limitation

Database queries alone cannot prove that the application is not integrated with preview corpus rows. A future E10 must also verify repository config, environment config, and app code change history. The E9 baseline expectation is no app integration.

## Rollback verification

If E10 inserts rows and then rolls back or cleans up, expected verification should include:

```sql
select 'source_files' as table_name, count(*) from legal_authority.source_files
union all select 'authority_units', count(*) from legal_authority.authority_units
union all select 'authority_versions', count(*) from legal_authority.authority_versions
union all select 'authority_chunks', count(*) from legal_authority.authority_chunks
union all select 'citation_aliases', count(*) from legal_authority.citation_aliases;
```

Expected rollback result: either zero corpus rows or a documented retained gated dry-run batch with display count still zero.
