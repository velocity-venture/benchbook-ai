# Phase E8 Schema-only Preview Execution Report

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: schema-only Supabase preview execution against `benchbook-ai`

## Result

Phase E8 stopped before any remote schema change.

The approved target was `benchbook-ai`. The forbidden target was `benchbook-ai-prod`.

Preflight confirmed the repo state and created a preview-safe migration set under `supabase/migrations_preview/`, but the local environment could not positively verify or connect to the Supabase preview target without additional tooling or credentials:

- `supabase` CLI was not available on `PATH`.
- No project-local Supabase CLI package was present.
- No Supabase-related environment variable names were present.
- No Doppler CLI was present.
- `supabase/config.toml` contains `project_id = "benchbook-ai"`, but that is local project metadata and is not enough to prove the remote target.

Because target verification could not be completed, no remote migration was applied.

## Pre-checks

| Check | Result |
|---|---|
| Working directory | `/Users/m3_ai_factory/Projects/benchbook-ai` |
| Branch | `refactor/codex-gpt55-launch-prep` |
| Working tree before E8 | clean |
| Current HEAD | `90c8068 Add Phase E7 preview planning package` |
| E6 local-rehearsal migrations present | yes |
| Draft migrations present | yes |
| Corpus data staged or loaded | no |
| Remote target verified | no |
| Remote schema migration applied | no |

## Preview-safe Migration Set

Created:

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

The migration 001 local `auth.uid()` stub issue was resolved in the preview-safe copy by removing the local-only `auth` schema and function creation. The E6 local-rehearsal files and draft files were not modified.

## Local Smoke Verification

A disposable local PostgreSQL smoke test applied the preview-safe migration set with a temporary auth shim supplied outside the migration files to mimic Supabase auth availability.

| Check | Result |
|---|---:|
| Preview migrations applied locally | 10 |
| Legal authority and stage base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| Displayable view count | 0 |
| Authority chunk rows | 0 |
| RLS-enabled table count | 20 |
| `authority_chunks` policy count | 0 |
| Embedding column count | 0 |
| Local smoke database dropped | yes |

## No-touch Audit

| Item | Result |
|---|---|
| Target `benchbook-ai` verified remotely | no |
| Target `benchbook-ai-prod` touched | no |
| Production database touched | no |
| Any remote database touched | no |
| Schema migration applied remotely | no |
| Corpus rows loaded | no |
| Source manifest loaded | no |
| Expanded chunks uploaded | no |
| Embeddings generated | no |
| App integration performed | no |
| Production corpus replaced | no |
| Production display gates relaxed | no |
| E6 real migrations changed | no |
| Draft migrations changed | no |
| Preview-specific migrations created | yes |
| Files staged or committed | no |

## Conclusion

E8 is safe but incomplete. The preview-safe migration set exists and passed local schema-only smoke verification, but remote preview execution did not occur because the target could not be positively verified through an approved local mechanism.

Next required owner direction: provide an approved safe connection method or make an authenticated Supabase CLI session available locally for the exact preview target `benchbook-ai`, without pasting secrets into Codex.
