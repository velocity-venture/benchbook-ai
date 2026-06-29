# Next Phase Prompt

Use one of these prompts only after separate owner approval.

## Recommended E13-B

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

Owner approval is granted for Phase E13-B only: continued read-only preview retrieval and citation QA with expanded probes.

Authorized actions are limited to read-only remote SQL against `benchbook-ai / clerihqbjyczarqkiqnb` plus local documentation. Do not run remote writes. Do not load corpus rows. Do not generate embeddings. Do not modify app code. Do not connect the app to the preview corpus. Do not relax display gates. Do not enable production display. Do not contact production Supabase.

Objectives:

1. Expand count-only retrieval probes by family, scope, effectivity, and queue category.
2. Expand citation lookup safety probes without printing legal body text.
3. Confirm restricted, pending, DCS, TRE, effectivity, and signoff gates remain closed.
4. Compare E13-A queue metadata against retained preview counts.
5. Document any new blockers.

## Alternative E14

Owner approval is granted for Phase E14 only: local metadata remediation implementation.

Authorized actions may include local overlay files or local ingestion/load metadata artifacts only if separately approved in the owner prompt. Do not run remote writes. Do not contact production. Do not load remote corpus rows. Do not generate embeddings. Do not modify app code. Do not connect the app to the preview corpus. Do not relax display gates. Do not enable production display.

Objectives:

1. Implement owner-approved local metadata remediation artifacts for unresolved identity and effectivity blockers.
2. Preserve body-text exclusion in any queue or patch artifact.
3. Re-run local static validation and local disposable DB dry run.
4. Document exactly what remains blocked before app integration.
