# Owner Approval Scope

## Approved for E9

Judge Eckel approved Phase E9 for preview corpus-load planning only.

Allowed in E9:

- Read repository files.
- Inspect local docs and local metadata.
- Run local Git/status/listing commands.
- Run local-only static validation.
- Create documentation under `docs/preview-corpus-load-planning/`.
- Use `/tmp` for runtime metadata outputs.

## Not approved for E9

E9 did not authorize:

- Supabase production access.
- Any access to `benchbook-ai-prod`.
- Remote write commands.
- Preview corpus loading.
- Source manifest upload.
- Expanded chunk upload.
- Extraction warning upload.
- Derivative legal text upload.
- Embeddings.
- App integration.
- Production corpus replacement.
- Display gate relaxation.
- Production display enablement.
- Source PDF changes.
- Titles 39, 40, or 55.
- Web retrieval.
- Staging or committing files.

## Approved target context for future planning

| Role | Target |
|---|---|
| Preview target | `benchbook-ai` |
| Preview project ref | `clerihqbjyczarqkiqnb` |
| Forbidden production target | `benchbook-ai-prod` |
| Forbidden production project ref | `suiylfayvjsjtbrsjrwx` |

## Required owner decision before E10

Before any E10 action, the owner approval must state whether remote writes are allowed. If the approval does not expressly allow remote writes, E10 must remain planning-only.

The approval must also state whether corpus rows may be loaded, whether restricted and pending QA rows may be loaded for gate testing, whether any row may become production-displayable, whether embeddings remain prohibited, whether app integration remains prohibited, and what rollback or cleanup is required.
