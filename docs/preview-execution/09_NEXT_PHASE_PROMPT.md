# Phase E9 Next Prompt

Use this prompt only if Judge Eckel authorizes Phase E9.

```text
You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: /Users/m3_ai_factory/Projects/benchbook-ai
Branch: refactor/codex-gpt55-launch-prep

Phase E8 completed schema-only preview execution against the verified Supabase preview target benchbook-ai, project ref clerihqbjyczarqkiqnb.

The forbidden production target is benchbook-ai-prod, project ref suiylfayvjsjtbrsjrwx. Production was not touched in E8 and remains prohibited.

Phase E9 objective:

Prepare owner-approved preview corpus-load planning or preview corpus-load dry-run planning only. Do not treat E9 as another schema-only preview execution phase.

Before taking action, read:

1. CODEX-SOURCE-OF-TRUTH.md
2. CODEX-BRIEF.md
3. docs/preview-execution/00_PHASE_E8_SCHEMA_ONLY_PREVIEW_EXECUTION_REPORT.md
4. docs/preview-execution/01_OWNER_APPROVAL_SCOPE.md
5. docs/preview-execution/02_TARGET_VERIFICATION.md
6. docs/preview-execution/03_PREVIEW_SAFE_MIGRATION_REVIEW.md
7. docs/preview-execution/04_SCHEMA_APPLICATION_LOG.md
8. docs/preview-execution/05_SCHEMA_ONLY_GATE_VERIFICATION.md
9. docs/preview-execution/06_ROLLBACK_PLAN_AND_STATUS.md
10. docs/preview-execution/07_NO_CORPUS_LOAD_ATTESTATION.md
11. docs/preview-execution/08_REMAINING_BLOCKERS_AFTER_E8.md
12. docs/preview-planning/05_PREVIEW_ACCESS_AND_DATA_GATES.md
13. docs/migration-readiness/07_PRODUCTION_EXCLUSION_RULES.md

Controlling rules:

- BenchBook.AI is a Tennessee Juvenile and Family Court judicial research product.
- Preserve the V1 corpus scope lock.
- Do not add Titles 39, 40, or 55.
- Do not add web retrieval.
- Do not couple to BenchMark Standard.
- Do not print or commit secrets, database URLs, passwords, tokens, service-role keys, or connection strings.
- Do not include substantial legal source text in committed docs.

Approved target context:

- Preview target: benchbook-ai.
- Preview project ref: clerihqbjyczarqkiqnb.
- Forbidden production target: benchbook-ai-prod.
- Forbidden production project ref: suiylfayvjsjtbrsjrwx.

E9 may plan:

- Preview corpus-load sequencing.
- Preview corpus-load dry-run checks.
- Metadata-only validation queries.
- Zero-display-gate verification.
- Corpus QA gate verification.
- Rollback and cleanup planning.
- Migration-history caveat handling after E8 used db query --linked --file.

Still prohibited unless separately approved in writing:

- Production Supabase.
- benchbook-ai-prod.
- App integration.
- Embeddings.
- Production corpus replacement.
- Display gate relaxation.
- Production display enablement.
- Legal answer behavior changes.
- Raw source PDF changes.
- Adding Titles 39, 40, or 55.
- Web retrieval.

If owner approval allows preview corpus-load dry-run planning only, do not run any remote write command. Produce planning docs only.

If owner approval allows a preview corpus-load dry run, verify the target before every remote command and stop if the linked project is not benchbook-ai with ref clerihqbjyczarqkiqnb.

Required E9 deliverables should include:

- Target verification and no-production attestation.
- Corpus-load plan or dry-run report.
- Exact commands considered or run, with secrets redacted and no connection strings.
- Row-count expectations and observed counts.
- Display gate verification.
- Restricted and pending QA exclusion verification.
- Embeddings-not-generated attestation.
- App-not-integrated attestation.
- Remaining blockers and next owner decisions.

Stop immediately if:

- The target appears to be production.
- Any command would touch benchbook-ai-prod.
- A secret appears in output.
- App integration appears necessary.
- Embedding generation appears necessary.
- Display gate relaxation appears necessary.
- Production corpus replacement appears necessary.
```
