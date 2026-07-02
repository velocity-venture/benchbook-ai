# Phase E10-B Retained Batch And Rollback Status

Date: 2026-06-28
Branch: `refactor/codex-gpt55-launch-prep`
Scope: retained preview batch documentation

## Retained batch

The E10-B dry run retained one gated preview batch:

| Item | Value |
|---|---|
| Load batch id | `e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Corpus build id | `7191eb09-8c7f-41c3-a0d9-740693c10799` |
| Build version | `phase-e10-preview-e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Target | `benchbook-ai` |
| Target ref | `clerihqbjyczarqkiqnb` |

The retained batch is gated for preview database QA. It is not app-connected and not production-displayable.

## Rollback artifact

Generated rollback SQL exists at:

- `/tmp/benchbook_e10_preview_load/rollback_retained_batch.sql`

The rollback artifact deletes the retained E10-B batch by:

- `corpus_build_id`;
- `load_batch_id`;
- associated stage rows;
- associated audit smoke-test rows;
- associated chunks, versions, units, aliases, warnings, source memberships, and source files.

Because the generated SQL contains operational identifiers and was built for this exact run, it should be regenerated or reviewed before any later cleanup.

## Rollback status

Rollback was tested operationally during the first failed remote attempt. That first attempt inserted only a corpus-build marker before Supabase rejected oversized load batches with `413 request entity too large`. The generated rollback artifact removed that marker successfully, and a count-only verification confirmed preview returned to zero corpus and stage rows before the successful smaller-batch load was attempted.

The final successful E10-B batch remains retained. It has not been rolled back.

## Stop conditions still in effect

Future work must stop and document if any of these occurs:

- displayable view count becomes greater than zero;
- restricted or pending QA rows appear in displayable views;
- DCS becomes production-eligible;
- TRE exceeds limited-scope handling;
- future-effective or unknown-effectivity rows become displayable;
- embeddings are populated without separate approval;
- app code is connected to the preview corpus without separate approval;
- production Supabase or project ref `suiylfayvjsjtbrsjrwx` appears in target metadata.

## Recommended next move

Do not treat the retained preview batch as production-ready. Recommended next work is:

1. run any additional count-only QA desired by the owner;
2. review unresolved identity and effectivity blockers;
3. decide whether to keep the retained batch for internal preview QA or approve cleanup;
4. do not connect the app to this corpus until a separate app-integration phase is approved.
