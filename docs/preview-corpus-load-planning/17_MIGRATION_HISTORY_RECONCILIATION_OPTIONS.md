# Migration History Reconciliation Options

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E9 planning only

No Supabase migration-history command was run in E9. This file evaluates options only.

## Context

Phase E8 applied preview schema objects under a schema-only execution boundary. E8 verified the live object baseline, but it also carried a migration-history caveat. A future E10 must not rely on migration history alone as proof that the preview schema is correct.

The preview database should be treated as a controlled, disposable preview environment unless and until the owner authorizes a formal migration-history reconciliation.

## Options

| Option | Description | Pros | Cons | E10 suitability | Disposition |
|---|---|---|---|---|---|
| Leave as-is and document manual schema application | Continue using direct object verification instead of assuming migration ledger truth | low change, preserves E8 state, no remote repair risk | migration ledger remains less clean than object inventory | suitable for planning and preview dry-run if caveat is repeated | adopt for E9 and possible E10 dry run |
| Use a future migration repair action | Reconcile the Supabase migration ledger to match already-applied schema | could make future migration tooling cleaner | remote state mutation, easy to damage history if wrong version chosen | only after explicit owner approval and a written repair plan | needs further review |
| Create formal preview-only migration records later | Add a preview migration package that matches live schema and is replayable | improves documentation and repeatability | may duplicate or conflict with existing draft migrations | possible later, not required for zero-display dry run | needs further review |
| Reset preview and replay migrations cleanly | Drop or recreate preview schema and apply a clean ordered migration sequence | cleanest ledger if done correctly | high operational risk, data loss, requires full target certainty | not appropriate without explicit reset approval | reject for current path |
| Treat preview as disposable QA infrastructure | Keep object verification as source of truth and avoid treating preview as production-like | honest about preview status, lower ceremony, supports safe QA | does not solve long-term migration hygiene | suitable for E10 dry-run planning | adopt as operating assumption |

## Recommended posture

For Phase E10, do not repair, reset, or rely on migration history unless the owner separately approves that exact action.

A preview corpus-load dry run can proceed from object verification if:

- schemas, tables, views, functions, RLS, and policies are verified immediately before writes;
- row-count baselines are verified immediately before writes;
- the migration-history caveat is recorded in the E10 log;
- the load method does not apply migrations;
- rollback or cleanup is planned before insertion.

## Stop conditions

Future E10 should stop before loading if:

- schema objects are missing;
- views or functions differ from the E8 baseline;
- RLS is not enabled where expected;
- broad read policies exist on corpus tables;
- migration tooling tries to repair, reset, fetch, pull, push, or apply migrations without explicit owner approval;
- the operator cannot distinguish object verification from migration ledger verification.

## E9 conclusion

The safest near-term choice is to leave migration history untouched and make object verification the E10 gate. Migration repair may be valuable later, but it is not required for a zero-display preview dry run and should not be bundled into corpus loading.
