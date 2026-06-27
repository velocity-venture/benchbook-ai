# Remaining Blockers Before Preview

Phase E7 does not resolve corpus, schema, or preview-access blockers. It carries them forward for owner review.

## Corpus And QA Blockers

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

## Preview Execution Blockers

- Exact Supabase preview target has not been named.
- No preview connection is approved.
- No preview credential use is approved.
- E6 migration 001 contains local-only auth helper stub logic that must be reviewed before Supabase preview application.
- The owner has not approved whether preview should be schema-only or include derivative corpus rows.
- The owner has not approved who may access preview data.
- The owner has not approved a rollback plan for a named preview target.
- The owner has not approved any production displayable rows.

## Non-blockers For Planning Only

These items are sufficient for planning but not execution:

- E6 migrations applied cleanly to local PostgreSQL.
- E6 files match reviewed draft migrations byte-for-byte.
- E6 local target promotion succeeded with closed gates.
- Production displayable count remained 0.
- No embeddings were generated.
- No remote database was touched.

## Default Posture

Until a later owner prompt changes it:

- No preview Supabase.
- No production Supabase.
- No remote database.
- No embeddings.
- No app integration.
- No production corpus replacement.
- No display gate relaxation.
- No production answer path from restricted or pending QA chunks.
