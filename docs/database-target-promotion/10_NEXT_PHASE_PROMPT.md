# Next Phase Prompt

You are working in the BenchBook.AI repository at `/Users/m3_ai_factory/Projects/benchbook-ai`.

Continue on the current launch-prep branch unless instructed otherwise.

## Required reading

Read these files first:

- `CODEX-SOURCE-OF-TRUTH.md`
- `CODEX-BRIEF.md`
- `docs/database-target-promotion/00_PHASE_E3_TARGET_PROMOTION_REPORT.md`
- `docs/database-target-promotion/09_REMAINING_BLOCKERS.md`

## Guardrails

- BenchBook.AI is a Tennessee Juvenile and Family Court judicial research product.
- Preserve the V1 corpus scope lock.
- Do not add Titles 39, 40, or 55 to V1.
- Do not introduce web retrieval into V1 legal answers.
- Do not couple this project to BenchMark Standard.
- Do not touch Supabase production or preview databases.
- Do not create real migrations under `supabase/migrations/` without owner approval.
- Do not commit ignored derivative legal text.
- Do not print extracted legal body text in reports.

## Phase E4 objective

Prepare the corpus and draft schema for an owner-reviewed production migration plan by resolving or isolating Phase E3 blockers.

Priority tasks:

1. Fix duplicate source chunk ID generation upstream and rerun the local target promotion.
2. Review unresolved DCS and authority identities. Keep unresolved rows controlled. Do not invent citations.
3. Review normalized citation alias collisions and decide whether to remove, narrow, or manually map aliases.
4. Review unknown-effectivity rows and require human signoff for any production use.
5. Keep DCS policy material guardrail-only unless owner approval changes the corpus designation.
6. Keep all production display and answer gates closed until approval, display, and effectivity checks pass.
7. Produce an owner-ready migration readiness memo that separates local proof, remaining blockers, and required approvals.

## Required verification

Run the local disposable target-promotion loader again after changes:

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e4_target_promotion.json
```

Report whether the local database was dropped, whether any remote database was touched, and whether any production corpus or embeddings were generated.
