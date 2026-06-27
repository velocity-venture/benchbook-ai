# Remaining Blockers After E6

Phase E6 proves local migration execution. It does not resolve preview or production blockers.

## Remaining blocker counts

| Blocker | Count or status |
|---|---:|
| Unresolved authority units | 17 |
| Unresolved chunks | 21 |
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Versions requiring QA signoff | 439 |
| DCS document-anchored units | 130 |
| DCS document-anchored chunks | 1,146 |
| Restricted pending license review chunks | 2,392 |
| Pending extraction QA chunks | 4,198 |
| DCS policy or protocol identity gaps | 292 |
| Historical encrypted or OCR-blocked DCS handbook item | still requires reconciliation |

## Static validation blockers

- Some non-metadata chunks lack citation, section, rule, or policy identity.
- Effective-dated rows require version partitioning and QA signoff before production.
- Pending extraction QA chunks cannot be production-displayable by default.
- Restricted chunks require Judge or delegated corpus administrator display approval before production use.
- Some DCS policy or protocol chunks lack policy identity metadata.

## Owner decisions still required

- Whether the E6 real migration files should remain in `supabase/migrations/`, be renamed, be revised, or be removed before any later preview phase.
- Whether `legal_authority` and `legal_authority_stage` remain approved schema names.
- Whether restricted chunks remain stored but non-displayable.
- Whether DCS document-anchored rows remain guardrail-only.
- Whether TRE remains limited answer authority plus guardrail/reference authority.
- Whether unknown-effectivity rows remain excluded from production eligibility.
- Whether any category, row set, build, or policy is approved for production display.
- Whether a separate later prompt authorizes preview Supabase.

Default status: no preview, no production, no embeddings, no app integration, no production corpus replacement, and all production display and retrieval gates remain closed.

