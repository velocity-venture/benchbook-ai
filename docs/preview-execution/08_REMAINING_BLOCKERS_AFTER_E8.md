# Remaining Blockers After E8

E8 did not complete remote preview schema application because target verification could not be completed.

## Execution Blockers

- Supabase CLI is not available on `PATH`.
- No project-local Supabase CLI package is available.
- No Supabase-related environment variable names are present.
- Doppler CLI is not available.
- No approved remote connection string or database password is available through a safe local mechanism.
- `supabase/config.toml` names `benchbook-ai`, but local config alone does not prove the remote target.

## Corpus And QA Blockers Carried Forward

| Blocker | Count or status |
|---|---:|
| Unresolved authority units | 17 |
| Unresolved chunks | 21 |
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Versions requiring QA signoff | 439 |
| DCS document-anchored chunks | 1,146 |
| Restricted Lexis annotation, case-note, and advisory chunks | 2,392 |
| Pending extraction QA chunks | 4,198 |
| Historical encrypted or OCR-blocked DCS handbook item | 1 item requiring reconciliation |

## Still Prohibited

- Any access to `benchbook-ai-prod`.
- Production Supabase access.
- Corpus load.
- Derivative legal text upload.
- Embeddings.
- App integration.
- Production corpus replacement.
- Display gate relaxation.
- Production display enablement.
- Legal answer behavior changes.
- Raw source PDF changes.

## Ready For A Later Retry

The preview-safe migration set is ready for a later verified-target retry:

- Migration 001 no longer creates a local `auth` schema or `auth.uid()` stub.
- Migrations 002 through 010 preserve legal authority schema substance with preview comments only.
- Local schema-only smoke test passed with 0 corpus rows.
