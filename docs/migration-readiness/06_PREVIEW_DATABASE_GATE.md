# Preview Database Gate

Current gate status: closed.

No Supabase preview database connection is approved in E5. No Supabase production database connection is approved in E5.

## Preview remains prohibited until after E6

A preview database connection should remain prohibited until all of the following are true:

1. Owner gives written approval for E6 local real-migration rehearsal.
2. E6 applies the migration files against a disposable local database.
3. E6 drops the disposable local database after the run.
4. E6 documents migration application, rollback, RLS, RPC, display gates, effectivity gates, and audit reconstruction.
5. Owner separately approves a preview Supabase connection in a later written prompt.

## Conditions for any later preview prompt

A later preview prompt should identify:

- The exact Supabase project or connection target.
- Whether it is preview only.
- Which migration files are authorized.
- Whether the load is schema-only or includes derivative corpus rows.
- Whether any restricted or pending QA rows are allowed into preview.
- Whether retrieval logs use query hashes only.
- Whether local juvenile rules are excluded or handled as court-private data.
- Who may access preview data.
- The rollback plan.

## Privacy requirements

Preview must preserve the FERPA-sensitive posture of the product:

- No court-specific local rules may be treated as global corpus material.
- No juvenile or court-specific data may be exposed without authentication and tenant or court scoping.
- Production answers may not retrieve restricted Lexis rows.
- Production answers may not retrieve pending extraction QA rows.
- Retrieval and answer audit records should avoid storing generated answer text.
- Query excerpts should remain disabled unless the owner approves a redacted local or preview QA workflow.

## Current E5 confirmation

| Item | Result |
|---|---|
| Remote database connection | false |
| Supabase preview connection | not used |
| Supabase production connection | not used |
| Local disposable database used | yes |
| Local disposable database dropped | yes |
| Embeddings generated | false |
| Production corpus replaced | false |
