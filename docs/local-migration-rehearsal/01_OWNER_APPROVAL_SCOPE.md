# Owner Approval Scope

Phase E6 was performed under narrow written owner approval for a local-only real migration rehearsal.

## Approved

- Create real local rehearsal migration files under `supabase/migrations/`.
- Copy or generate those files from reviewed drafts under `supabase/migrations_draft/`.
- Apply the E6 legal authority migration set only to disposable local PostgreSQL databases.
- Run existing local validation and loader commands.
- Write E6 documentation under `docs/local-migration-rehearsal/`.
- Write runtime JSON outputs only to `/tmp`.

## Not approved

- Supabase preview connection.
- Supabase production connection.
- Any remote database connection.
- `supabase db push`.
- `supabase link`.
- Commands requiring a Supabase access token.
- Production credentials.
- App integration with the legal authority database.
- App source code changes.
- Ingestion script changes.
- Database-load script changes.
- Draft migration mutation.
- Embedding generation.
- Production corpus replacement.
- Production chunk display enablement.
- Display gate relaxation.
- Source PDF changes.
- Staging or committing files.

## Scope confirmations

BenchBook.AI remains a closed-universe Tennessee judicial bench book AI.

The approved V1 source universe remains locked to:

- T.C.A. Title 36.
- T.C.A. Title 37.
- Tennessee Rules of Juvenile Practice and Procedure.
- Selected DCS policies and procedures.
- Tennessee Rules of Evidence only as limited evidentiary or procedural authority.
- Optional private local juvenile court rules only as a later court-private overlay.

E6 did not add Titles 39, 40, or 55. E6 did not add web retrieval. E6 did not use model memory or general legal knowledge as authority. E6 did not couple BenchBook.AI to The BenchMark Standard.

