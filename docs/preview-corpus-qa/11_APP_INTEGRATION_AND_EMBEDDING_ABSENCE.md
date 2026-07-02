# App Integration And Embedding Absence

Date: 2026-06-28

## App integration check

A local repo grep was run against app source and app configuration files for:

- `legal_authority`
- `authority_chunks`
- `v_current_displayable_chunks`
- `search_displayable_chunks`
- `lookup_citation_alias`

Result: no matches in app source or app configuration files.

The preview corpus is not connected to the app.

## Embedding check

| Check | Count |
|---|---:|
| Embedding column present | 1 |
| Populated embeddings | 0 |

No embeddings were generated in Phase E11.

## File-change check

Phase E11 did not modify:

- app files;
- migrations;
- scripts;
- source PDFs;
- generated corpus data;
- Supabase project configuration.

Only this documentation package was created.
