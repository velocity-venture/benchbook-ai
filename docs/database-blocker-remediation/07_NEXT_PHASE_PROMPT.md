# Next Phase Prompt

You are working in the BenchBook.AI repository at `/Users/m3_ai_factory/Projects/benchbook-ai`.

Continue on branch `refactor/codex-gpt55-launch-prep` unless instructed otherwise.

## Required reading

Read these first:

- `CODEX-SOURCE-OF-TRUTH.md`
- `CODEX-BRIEF.md`
- `docs/database-blocker-remediation/00_PHASE_E4_BLOCKER_REMEDIATION_REPORT.md`
- `docs/database-blocker-remediation/06_REMAINING_BLOCKERS.md`
- `scripts/ingestion/run_expanded_ingestion.py`
- `scripts/database_load/dry_run_load_legal_authority.py`

## Guardrails

- BenchBook.AI is a Tennessee Juvenile and Family Court judicial research product.
- Preserve the V1 corpus scope lock.
- Do not add Titles 39, 40, or 55 to V1.
- Do not introduce web retrieval into V1 legal answers.
- Do not couple this project to BenchMark Standard.
- Do not touch Supabase production or preview databases.
- Do not create real migrations under `supabase/migrations/` without owner approval.
- Do not modify app source code unless the owner expressly changes scope.
- Do not commit ignored derivative legal text.
- Do not print extracted legal body text in reports.

## Phase E5 objective

Prepare an owner-review migration readiness package.

Priority tasks:

1. Review the 17 unresolved units and 21 unresolved chunks by metadata only.
2. Review the 15 unknown-effectivity versions and 39 unknown-effectivity chunks.
3. Decide whether document-anchored DCS rows should remain guardrail-only, be excluded, or receive manual corpus administrator mappings.
4. Confirm all production display and answer gates remain closed until approval is explicit.
5. Produce a migration-readiness memo that separates remediated blockers, remaining QA blockers, and required owner approvals.

## Required verification

Run:

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_phase_e5_static_validation.json
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e5_target_promotion.json
```

Report whether any remote database was touched, whether the local database was dropped, and whether any production corpus or embeddings were generated.
