# Owner Approval Scope

Date: 2026-06-29

## Approved for E13-A

- Read repository files.
- Run local-only metadata analysis and validation.
- Inspect ignored local generated metadata under `data/ingestion-expanded/` without printing body text.
- Create local documentation under `docs/preview-corpus-e13/`.
- Create metadata-only review queues under `docs/preview-corpus-e13/review-queues/`.
- Write runtime outputs to `/tmp`.
- Leave all files unstaged and uncommitted.

## Not approved

- Remote Supabase commands.
- `supabase projects list`, `supabase db query`, `supabase db push`, `supabase link`, or Supabase migration commands.
- Remote `psql`.
- Database credentials, privileged role keys, tokens, or connection details.
- Contact with `benchbook-ai-prod` or project ref `suiylfayvjsjtbrsjrwx`.
- Remote writes, corpus row loading, embeddings, app integration, display-gate relaxation, or production display.
- App code changes, migration changes, existing loader script changes, source PDF changes, or corpus source changes.
- Titles 39, 40, or 55.
- Web retrieval.
- Secrets or legal body text in output.
- Staging or committing files.

## Scope conclusion

E13-A stayed inside the approved local-only metadata lane. It produced review materials and queues only.
