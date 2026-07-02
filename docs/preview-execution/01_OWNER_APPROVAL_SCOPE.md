# Owner Approval Scope

Phase E8 approval was limited to schema-only Supabase preview execution against the exact target `benchbook-ai`.

## Approved Target

| Item | Approved value |
|---|---|
| Project name | `benchbook-ai` |
| Dashboard display | `AWS | us-east-1` |
| Organization | `velocity-venture` |

## Forbidden Target

`benchbook-ai-prod` is production-looking and was expressly prohibited.

## Approved Actions

- Review E7 preview-planning docs.
- Review existing E6 legal-authority migration files.
- Create preview-safe replacement migration files if needed.
- Connect only to the named Supabase preview target `benchbook-ai`.
- Apply schema migrations only if all preflight checks pass.
- Verify schema and gates at schema-only level.
- Document rollback and results.

## Not Approved

- Supabase production access.
- Any access to `benchbook-ai-prod`.
- Any corpus load.
- Any derivative legal text upload.
- Embeddings.
- App integration.
- Production corpus replacement.
- Display gate relaxation.
- Production display enablement.
- Legal answer behavior changes.
- Raw source PDF changes.

## Scope Result

E8 stayed within scope. The preview-specific migration files were created, but no remote schema execution occurred because target verification could not be completed with the available local tooling.
