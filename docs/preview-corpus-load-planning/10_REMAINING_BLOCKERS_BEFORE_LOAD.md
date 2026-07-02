# Remaining Blockers Before Load

These blockers do not prevent planning. They do block any unqualified preview load, production load, display-gate opening, embeddings, or app integration.

## Operational blockers

- E8 used `supabase db query --linked --file`, so migration history may not reflect preview-safe files as formal migrations.
- The current loader is local-only and should not be pointed directly at preview.
- A preview-safe loader adapter or SQL/COPY plan has not been implemented or reviewed.
- E10 owner approval has not yet authorized remote writes or corpus-row loading.
- Cleanup expectations for preview loaded rows are not yet approved.

## Corpus QA blockers

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

## Gate blockers

- DCS must remain guardrail/reference only.
- DCS production-eligible count must remain 0.
- TRE must remain limited-scope.
- Future-effective text must remain filtered by as-of date.
- Restricted Lexis annotation, case-note, and advisory chunks must remain non-displayable.
- Unknown-effectivity rows must remain QA-gated.
- Pending extraction QA rows must remain non-displayable.

## Strategic blocker

Preview loading should not be confused with launch readiness. A preview load may prove gates and row mappings, but it does not approve production corpus replacement, judge-facing display, or app retrieval integration.
