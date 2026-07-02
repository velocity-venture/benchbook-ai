# Phase E10-B Preview Corpus-load Dry Run Report

Date: 2026-06-28
Branch: `refactor/codex-gpt55-launch-prep`
Scope: owner-approved gated preview corpus-load dry run with remote writes

## Authorization

Judge Eckel approved Phase E10-B for remote writes to the Supabase preview project:

| Item | Value |
|---|---|
| Approved target | `benchbook-ai` |
| Approved project ref | `clerihqbjyczarqkiqnb` |
| Forbidden target | `benchbook-ai-prod` |
| Forbidden project ref | `suiylfayvjsjtbrsjrwx` |

Authorized work was limited to planning and executing a gated preview corpus-load dry run, verifying row counts and gates, documenting rollback or retained-batch status, and preserving the closed-universe V1 corpus scope.

## Result

Phase E10-B completed successfully after adapting the execution method to the Supabase Management API request-size limit.

The preview project now retains one gated E10-B corpus-load batch:

| Item | Value |
|---|---|
| Load batch id | `e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Corpus build id | `7191eb09-8c7f-41c3-a0d9-740693c10799` |
| Build version | `phase-e10-preview-e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Displayable chunks | 0 |
| Embeddings populated | 0 |
| App integration | none |
| Production Supabase touched | no |

The retained batch is not production-displayable. It is present for preview database QA only.

## Execution notes

The first remote load attempt used one 41 MB SQL artifact. Supabase rejected that request with `413 request entity too large`. That attempt did not load corpus rows. It inserted only the E10 corpus-build marker before the first oversized batch failed. The marker was rolled back successfully, and a follow-up verification confirmed corpus, stage, and displayable counts were back to zero.

The successful run used smaller generated SQL files:

- `000_preflight_and_build.sql`
- 48 load batch files, each under 900 KB
- `999_postflight.sql`

Every remote command was preceded by a local linked-project metadata check confirming:

- project name `benchbook-ai`;
- project ref `clerihqbjyczarqkiqnb`.

No project-list command was used, and no production ref was contacted.

## Generated artifacts

The generator script added in this phase is:

- `scripts/database_load/build_preview_corpus_load_sql.py`

It writes source-text SQL artifacts only outside the repository. The generated artifacts for this run were under:

- `/tmp/benchbook_e10_preview_load/`

The generated SQL files contain corpus text and must not be committed.

## Corpus scope

The loaded preview batch contains only V1 families:

| Family | Chunks |
|---|---:|
| DCS policies and procedures | 2,014 |
| T.C.A. Title 36 | 2,197 |
| T.C.A. Title 37 | 1,644 |
| Tennessee Rules of Evidence | 533 |
| Tennessee Rules of Juvenile Practice and Procedure | 202 |

No Titles 39, 40, or 55 were added. No web retrieval was added. No local-rules overlay data was loaded.

## Retained-batch posture

The batch is retained in preview, but all display and retrieval gates remain closed:

- `v_current_displayable_chunks`: 0
- `v_black_letter_current_chunks`: 0
- `v_internal_qa_restricted_chunks`: 6,590
- `search_displayable_chunks(...)`: 0
- `lookup_citation_alias(...)`: 0 for the E10 audit alias probe

Rollback SQL was generated at:

- `/tmp/benchbook_e10_preview_load/rollback_retained_batch.sql`

That rollback file is not an approval to clean up the retained batch. It is an operational artifact for a future owner-approved cleanup if needed.
