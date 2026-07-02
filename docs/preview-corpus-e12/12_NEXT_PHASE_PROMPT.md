# Next Phase Prompt

Use this prompt only after separate owner approval.

## Recommended E12-B prompt

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

Owner approval is granted for Phase E12-B only: read-only preview retrieval and citation QA.

Authorized actions are limited to read-only verification against the already-retained preview corpus batch, plus local documentation. Do not run remote writes. Do not load corpus rows. Do not generate embeddings. Do not modify app code. Do not connect the app to the preview corpus. Do not relax display gates. Do not enable production display. Do not touch production Supabase.

Read first:

1. `CODEX-SOURCE-OF-TRUTH.md`
2. `CODEX-BRIEF.md`
3. `docs/preview-corpus-qa/00_PHASE_E11_PREVIEW_CORPUS_QA_REPORT.md`
4. `docs/preview-corpus-e12/00_PHASE_E12A_BLOCKER_TRIAGE_REPORT.md`
5. `docs/preview-corpus-e12/09_CORPUS_ADMIN_REVIEW_QUEUE.md`
6. `docs/preview-corpus-e12/10_OWNER_DECISION_MATRIX.md`

Objectives:

1. Verify retrieval and citation behavior stays closed while display gates remain zero.
2. Test safe count-only citation and retrieval probes without printing legal body text.
3. Confirm restricted, pending QA, DCS guardrail-only, TRE limited-scope, future-effective, and unknown-effectivity rows stay gated.
4. Document any blocker that would prevent future app integration.

Stop immediately if a write command, app integration, embedding generation, display-gate relaxation, production access, secret exposure, or legal body text exposure appears necessary.

## Alternative E13 prompt

Owner approval is granted for Phase E13 only: local metadata QA remediation planning or implementation, no production.

Authorized actions are limited to local metadata work and documentation unless the owner explicitly approves code or data-file changes. Do not run remote commands. Do not touch production. Do not generate embeddings. Do not connect the app to the preview corpus. Do not relax display gates.

Objectives:

1. Prepare or implement local metadata remediation for unresolved identity rows.
2. Prepare or implement local effectivity QA cleanup.
3. Prepare DCS document-anchored disposition notes.
4. Preserve V1 scope and zero-display posture.
