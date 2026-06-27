# Schema Application Log

## Remote Application Status

Remote schema application did not occur.

Reason: target `benchbook-ai` could not be positively verified through an approved local mechanism. The Supabase CLI was not available, no project-local CLI package was available, and no approved remote connection string or credential path was available without needing secrets.

## Remote Commands Not Run

- No `supabase link`.
- No `supabase db push`.
- No Supabase CLI project command.
- No remote `psql` command.
- No command requiring a Supabase access token.

## Local Smoke Application

A disposable local PostgreSQL database was used only to smoke-test the preview-safe migration set.

| Item | Result |
|---|---|
| Local smoke database | `benchbook_e8_preview_safe_local_smoke_20260627_083851` |
| Temporary auth shim | supplied outside migration files for local test only |
| Preview migrations applied locally | 10 |
| Corpus rows loaded | 0 |
| Database dropped | yes |
| Remaining local smoke database | no |

## Local Smoke Counts

| Check | Result |
|---|---:|
| Legal authority and stage base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| Displayable view count | 0 |
| Authority chunk rows | 0 |
| RLS-enabled table count | 20 |
| `authority_chunks` policy count | 0 |
| Embedding column count | 0 |

## Schema Application Decision

No remote schema migration may be applied until a later run can verify the exact preview target `benchbook-ai` and avoid `benchbook-ai-prod`.
