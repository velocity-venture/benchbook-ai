# Next Phase Prompt

Use one of these prompts only after separate owner approval.

## Recommended E14-B

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

Owner approval is granted for Phase E14-B only: local metadata remediation artifact implementation.

Authorized actions are limited to local-only work. You may fill finalized local patch maps or decision registers from E13-A queues using metadata-only fields. You may validate those local artifacts. You may write docs under `docs/preview-corpus-e14/` or a later E14-B subdirectory.

Do not run Supabase commands. Do not run remote SQL or remote psql. Do not use database URLs, database credentials, tokens, privileged role keys, or connection strings. Do not contact `benchbook-ai-prod`, project ref `suiylfayvjsjtbrsjrwx`. Do not contact preview unless a later prompt separately authorizes it.

Do not modify app code, migrations, existing loader scripts, existing ingestion scripts, source PDFs, or generated corpus source files under `data/ingestion-expanded/`. Do not load corpus rows. Do not generate embeddings. Do not connect the app to preview. Do not replace production corpus. Do not relax display gates. Do not enable production display.

Preserve the V1 closed universe. Do not add Titles 39, 40, or 55. Do not add web retrieval. Keep DCS guardrail/reference only. Keep TRE limited-scope. Keep restricted Lexis internal QA only unless license and owner approval are separately recorded. Keep future-effective and unknown-effectivity rows gated.

Required work:

1. Re-read CODEX-SOURCE-OF-TRUTH.md, CODEX-BRIEF.md, E13-A docs, E13-B docs, and E14-A docs.
2. Validate E13-A queues and E14-A draft artifacts.
3. Fill local metadata-only patch maps and decision registers from E13-A queues where safe.
4. Do not include legal body text, chunk text, source text, page text, OCR text, or long excerpts.
5. Run local-only validators.
6. Document what remains unresolved and what owner decisions are needed before E15.

## Alternative E15

Owner approval is granted for Phase E15 only: preview reload planning after completed local patch maps have been reviewed.

Authorized actions are limited to local planning. Do not execute a preview reload without separate approval. Do not run remote writes. Do not load corpus rows. Do not generate embeddings. Do not modify app code. Do not relax display gates. Do not enable production display.

Objectives:

1. Convert reviewed patch maps into a gated preview reload plan.
2. Define rollback, retained-batch, and gate-verification checks.
3. Preserve zero display until a separate owner-approved execution phase.
