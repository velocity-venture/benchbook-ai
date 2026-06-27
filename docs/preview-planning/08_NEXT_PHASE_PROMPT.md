# Phase E8 Next Prompt

Use this prompt only if Judge Eckel gives separate written approval for preview execution and names the exact preview target.

```text
You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: /Users/m3_ai_factory/Projects/benchbook-ai
Branch: refactor/codex-gpt55-launch-prep

Phase E7 owner review and preview planning is complete.

Phase E8 is preview execution only if this prompt names the exact Supabase preview target and the exact allowed action.

Before taking action, read:

1. CODEX-SOURCE-OF-TRUTH.md
2. CODEX-BRIEF.md
3. docs/local-migration-rehearsal/00_PHASE_E6_LOCAL_MIGRATION_REHEARSAL_REPORT.md
4. docs/local-migration-rehearsal/01_OWNER_APPROVAL_SCOPE.md
5. docs/local-migration-rehearsal/02_REAL_MIGRATION_FILE_MAP.md
6. docs/local-migration-rehearsal/03_LOCAL_REHEARSAL_EXECUTION.md
7. docs/local-migration-rehearsal/04_GATE_VERIFICATION.md
8. docs/local-migration-rehearsal/05_ROLLBACK_AND_DROP_PROOF.md
9. docs/local-migration-rehearsal/06_REMAINING_BLOCKERS_AFTER_E6.md
10. docs/preview-planning/00_PHASE_E7_OWNER_REVIEW_PREVIEW_PLANNING_REPORT.md
11. docs/preview-planning/01_E6_MIGRATION_FILE_DISPOSITION_REVIEW.md
12. docs/preview-planning/02_PREVIEW_DATABASE_READINESS_CHECKLIST.md
13. docs/preview-planning/03_PREVIEW_EXECUTION_PLAN_NO_ACTION.md
14. docs/preview-planning/04_PREVIEW_ROLLBACK_AND_ISOLATION_PLAN.md
15. docs/preview-planning/05_PREVIEW_ACCESS_AND_DATA_GATES.md
16. docs/preview-planning/06_REMAINING_BLOCKERS_BEFORE_PREVIEW.md
17. docs/preview-planning/07_OWNER_APPROVALS_REQUIRED_FOR_PREVIEW_EXECUTION.md
18. docs/migration-readiness/06_PREVIEW_DATABASE_GATE.md
19. docs/migration-readiness/07_PRODUCTION_EXCLUSION_RULES.md

Required target:

- Supabase preview project or database target: [OWNER MUST NAME EXACT TARGET]
- Approved action: [OWNER MUST NAME EXACT ACTION]
- Approved migration disposition: [as-is, revise, rename, regenerate, or schema-only alternative]
- Approved migration list: [OWNER MUST LIST FILES]
- Approved load scope: [schema-only or exact data-load scope]
- Approved rollback plan: [OWNER MUST STATE PLAN]
- Approved access list: [OWNER MUST STATE WHO MAY ACCESS]

Still prohibited unless this prompt separately and expressly approves otherwise:

- Supabase production connection.
- Production database access.
- App integration.
- Embeddings.
- Production corpus replacement.
- Production display enablement.
- Display gate relaxation.
- Open web retrieval.
- Titles 39, 40, or 55.
- BenchMark Standard coupling.

Preflight:

1. Run `pwd`, `git branch --show-current`, `git status --short`, and `git log --oneline -10`.
2. Confirm the working tree is clean.
3. Confirm the target is preview only.
4. Confirm the target is not production.
5. Confirm secrets are available through approved handling without printing them.
6. Confirm migration 001 auth helper behavior is preview-safe or owner-approved.
7. Stop if any target, secret, migration, or rollback instruction is ambiguous.

Execution rules:

- Use only the named preview target.
- Use only the named migration files.
- Use only the named load scope.
- Do not generate embeddings.
- Do not integrate the app unless separately approved.
- Do not make any chunk production displayable unless separately approved.
- Do not print substantial legal source text.
- Do not print secrets.

Verification:

- Displayable production view count remains 0 unless separately approved.
- Restricted chunks in displayable views remain 0.
- Pending QA chunks in displayable views remain 0.
- DCS production-eligible chunks remain 0.
- TRE remains limited-scope.
- Future-effective rows remain as-of-date gated.
- Unknown-effectivity rows remain QA-gated.
- Audit reconstruction works without answer text storage.

Stop immediately if:

- The target appears to be production.
- A command requires unapproved `supabase link` or `supabase db push`.
- A Supabase token is required but not approved.
- A migration must be changed without owner approval.
- App code must be touched.
- Scripts must be touched.
- A secret appears in output.
- Rollback cannot be performed as approved.
```
