# Next Phase Prompt

Use one of these prompts only after separate owner approval.

## Recommended E13-A

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

Owner approval is granted for Phase E13-A only: local metadata remediation planning and implementation, no remote writes.

Authorized actions are limited to local metadata remediation planning, local-only scripts or documentation if explicitly approved by the owner, and local verification. Do not run remote Supabase commands. Do not contact production. Do not load remote corpus rows. Do not generate embeddings. Do not modify app code. Do not connect the app to the preview corpus. Do not relax display gates. Do not enable production display.

Read first:

1. `CODEX-SOURCE-OF-TRUTH.md`
2. `CODEX-BRIEF.md`
3. `docs/preview-retrieval-citation-qa/00_PHASE_E12B_RETRIEVAL_CITATION_QA_REPORT.md`
4. `docs/preview-retrieval-citation-qa/10_REMAINING_BLOCKERS_FOR_APP_INTEGRATION.md`
5. `docs/preview-corpus-e12/03_UNRESOLVED_IDENTITY_TRIAGE_PLAN.md`
6. `docs/preview-corpus-e12/04_EFFECTIVITY_QA_TRIAGE_PLAN.md`

Objectives:

1. Remediate or plan remediation for unresolved identity rows.
2. Remediate or plan remediation for unknown-effectivity rows.
3. Prepare corpus-admin signoff workflow for 439 QA-signoff-required versions.
4. Preserve zero display, no embeddings, and no app integration.

## Alternative E13-B

Owner approval is granted for Phase E13-B only: continued read-only preview retrieval and citation QA with specific query expansions.

Authorized actions are limited to read-only remote SQL against `benchbook-ai / clerihqbjyczarqkiqnb` plus local documentation. Do not run remote writes. Do not load corpus rows. Do not generate embeddings. Do not modify app code. Do not connect the app to the preview corpus. Do not relax display gates. Do not enable production display. Do not contact production Supabase.

Objectives:

1. Expand count-only retrieval probes by family and scope.
2. Expand citation lookup safety probes without printing legal body text.
3. Confirm restricted, pending, DCS, TRE, effectivity, and signoff gates remain closed.
4. Document any new blockers.
