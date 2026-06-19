# Owner Approval Decisions

No item below is approved by default. Written owner approval is required before any local real migration rehearsal, migration promotion, preview database connection, production database connection, app integration, embeddings, or production corpus replacement.

## Decisions for Judge Eckel

1. Whether to proceed to a local E6 real-migration rehearsal.
   - Current default: not approved.
   - Recommended E5 posture: approve only if the rehearsal remains disposable and local-only.

2. Whether draft migrations may be copied into `supabase/migrations/` for local-only rehearsal.
   - Current default: not approved.
   - Required limit: copy only for E6 local rehearsal after written approval. Do not push or use against preview or production.

3. Whether `legal_authority` and `legal_authority_stage` remain approved schema names.
   - Current default: pending owner approval.
   - E5 observation: the names are clear and tested locally.

4. Whether restricted chunks remain stored but non-displayable.
   - Current default: stored locally behind gates only.
   - Required limit: no production display or retrieval unless separately approved.

5. Whether DCS document-anchored rows remain guardrail-only.
   - Current default: guardrail-only and non-displayable.
   - Required limit: do not treat document-anchored rows as policy-citation authority.

6. Whether TRE remains limited answer authority plus guardrail/reference authority.
   - Current default: limited evidentiary/procedural scope.
   - Required limit: TRE must not become broad substantive juvenile or family-law answer authority.

7. Whether unknown-effectivity rows are excluded from production eligibility.
   - Current default: exclude all unknown-effectivity rows.
   - Required limit: no production eligibility until effectivity QA is complete.

8. Whether all production-display gates remain closed by default.
   - Current default: all production gates closed.
   - Required limit: explicit approval must be row, category, build, or policy based.

9. Whether any preview database connection remains prohibited until after E6.
   - Current default: prohibited.
   - Required limit: no preview Supabase connection during E5 or E6 unless a later written prompt expressly authorizes it.

10. Whether no production Supabase connection is permitted without a separate written prompt.
    - Current default: prohibited.
    - Required limit: a production connection requires a separate written owner prompt that names the database target and allowed action.

## Commercial and privacy confirmation

The migration plan must not weaken BenchBook.AI launch guardrails:

- V1 corpus remains Title 36, Title 37, TRJPP, selected DCS policies and procedures, TRE only as limited evidence/procedure authority, and optional private local juvenile rules later.
- No Titles 39, 40, or 55.
- No web retrieval.
- No BenchMark Standard coupling.
- No broad case-management expansion.
- No court-private local rules stored globally.
- No production answer path from restricted or pending QA chunks.
