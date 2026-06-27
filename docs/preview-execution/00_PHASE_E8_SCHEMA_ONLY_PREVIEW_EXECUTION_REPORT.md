# Phase E8 Schema-only Preview Execution Report

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: schema-only Supabase preview execution against `benchbook-ai`

## Result

Phase E8 had two parts.

First, Codex performed a safe stop because the local environment could not verify an authenticated Supabase preview target. That safe-stop package was committed as `c7ddf13 Add Phase E8 preview safe-stop package`.

Second, owner-approved schema-only preview execution resumed manually through Mac Terminal after Supabase CLI login and link were available. The preview-safe schema files from `supabase/migrations_preview/` were applied successfully to the verified preview target.

No corpus rows were loaded. No embeddings were generated. No app integration occurred. No production display gates were relaxed. The forbidden production project was not touched.

## Target verification

| Item | Result |
|---|---|
| Approved linked target | `benchbook-ai` |
| Approved project ref | `clerihqbjyczarqkiqnb` |
| Forbidden production target | `benchbook-ai-prod` |
| Forbidden production project ref | `suiylfayvjsjtbrsjrwx` |
| Production target touched | no |
| Target verification method | Supabase CLI project list and link verification |

## Execution method

The preview-safe files were applied with:

```bash
supabase db query --linked --file <file>
```

`supabase db push` was not used. A dry run showed `db push` would apply the default `supabase/migrations/` list, including older pending app migrations and E6 local-rehearsal migrations. The manual execution therefore used the preview-safe files directly.

Operational caveat: because `supabase db query --linked --file` was used, Supabase migration history may not record these preview-safe files as formal migrations. Future phases must account for that before relying on migration-history state.

## Applied files

- `supabase/migrations_preview/20260627090000_preview_legal_authority_001_extensions_schemas.sql`
- `supabase/migrations_preview/20260627090100_preview_legal_authority_002_enums_reference.sql`
- `supabase/migrations_preview/20260627090200_preview_legal_authority_003_builds_sources_staging.sql`
- `supabase/migrations_preview/20260627090300_preview_legal_authority_004_units_versions_chunks.sql`
- `supabase/migrations_preview/20260627090400_preview_legal_authority_005_citations_warnings_relationships.sql`
- `supabase/migrations_preview/20260627090500_preview_legal_authority_006_audit_tables.sql`
- `supabase/migrations_preview/20260627090600_preview_legal_authority_007_core_integrity_indexes.sql`
- `supabase/migrations_preview/20260627090700_preview_legal_authority_008_views_rpcs.sql`
- `supabase/migrations_preview/20260627090800_preview_legal_authority_009_rls_grants.sql`
- `supabase/migrations_preview/20260627090900_preview_legal_authority_010_post_load_search_and_vector.sql`

## Schema verification

| Check | Result |
|---|---:|
| `legal_authority` schema exists | true |
| `legal_authority_stage` schema exists | true |
| Legal authority and stage base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| RLS-enabled tables | 20 |

Created views:

- `v_black_letter_current_chunks`
- `v_current_displayable_chunks`
- `v_internal_qa_restricted_chunks`

## Schema-only row and gate verification

| Check | Result |
|---|---:|
| `source_files` rows | 0 |
| `authority_units` rows | 0 |
| `authority_versions` rows | 0 |
| `authority_chunks` rows | 0 |
| `v_current_displayable_chunks` rows | 0 |
| `v_black_letter_current_chunks` rows | 0 |
| `v_internal_qa_restricted_chunks` rows | 0 |

Policies shown during verification:

- `legal_authority_user_answer_audits`
- `legal_authority_read_families`
- `legal_authority_read_units`
- `legal_authority_read_versions`
- `legal_authority_read_citation_aliases`
- `legal_authority_read_builds`
- `legal_authority_user_refusals`
- `legal_authority_user_retrieval_logs`

No `authority_chunks` policy was shown.

## No-touch audit

| Item | Result |
|---|---|
| Corpus rows loaded | no |
| Source manifest loaded | no |
| Expanded chunks uploaded | no |
| Embeddings generated | no |
| App integration performed | no |
| Production corpus replaced | no |
| Production display gates relaxed | no |
| Production Supabase accessed | no |
| `benchbook-ai-prod` accessed | no |
| Final Terminal-verified Git status | clean |

## Conclusion

E8 schema-only preview execution completed successfully after the initial safe stop and manual owner-approved resume. The preview target now has the legal authority schema shell, but no corpus data. E9 should focus on owner-approved preview corpus-load planning or preview corpus-load dry-run planning, not another schema execution phase.
