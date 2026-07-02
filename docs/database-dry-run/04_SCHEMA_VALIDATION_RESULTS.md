# Schema Validation Results

## Migration Application

All draft migration SQL files applied successfully to a disposable local PostgreSQL database.

| Area | Result |
|---|---|
| Schemas | `legal_authority` and `legal_authority_stage` created |
| Extensions | `pgcrypto` and `pg_trgm` enabled |
| pgvector | unavailable locally, deferred by notice |
| Enums | created |
| Authority families | 5 seeded |
| Corpus build table | created |
| Source tables | created |
| Staging tables | created |
| Authority unit/version/chunk tables | created |
| Citation and warning tables | created |
| Audit tables | created |
| Core indexes | created |
| Views and RPC contracts | created |
| RLS drafts | created |
| FTS index | created after load timing point |
| Vector index | deferred |

## Display Gate Structure

The schema includes:

- `approval_status`
- `production_display_status`
- `retrieval_display_gate`
- `answer_scope`
- `black_letter_eligible`
- production-safe current display view
- black-letter current view
- internal QA restricted view

No raw `authority_chunks` broad read policy is drafted.

## Audit Structure

The schema includes:

- `retrieval_logs`
- `answer_audit_records`
- `citation_verification_records`
- `refusal_records`

The audit tables keep nullable user and chat IDs for future app integration while remaining independent enough to run locally.

## Known Draft Limitations

- Local draft uses an `auth.uid()` stub solely so RLS policies parse outside Supabase.
- Local draft omits Supabase-specific foreign keys to `profiles`, `chat_sessions`, and `chat_messages`.
- pgvector is optional and was unavailable in the local server.
- SECURITY DEFINER RPC ownership must be reviewed before any production migration.
- Staging tables hold raw JSON, including chunk text, only in local disposable execution.
