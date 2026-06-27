# Remaining Blockers After E8

E8 completed schema-only preview application against the verified preview target `benchbook-ai`.

The phase did not load corpus data and did not authorize app integration, embeddings, display gate relaxation, production corpus replacement, or production Supabase access.

## Operational Caveat

The preview-safe files were applied with:

```bash
supabase db query --linked --file <file>
```

`supabase db push` was not used because a dry run showed it would apply the default `supabase/migrations/` list, including older pending app migrations and E6 local-rehearsal migrations.

Because `db query --linked --file` was used, Supabase migration history may not record these preview-safe files as formal migrations. Before any future schema drift check, migration repair, preview reset, or production migration planning, the team must confirm the actual remote schema state instead of relying only on Supabase migration history.

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

## Ready For E9 Planning

E9 should not repeat preview schema execution. E9 should plan an owner-approved preview corpus-load dry run or preview corpus-load execution path, while preserving these gates:

- Preview only.
- No production Supabase.
- No embeddings unless separately approved.
- No app integration unless separately approved.
- No production corpus replacement.
- No production display gate relaxation.
- No restricted or pending QA rows made judge-facing.
