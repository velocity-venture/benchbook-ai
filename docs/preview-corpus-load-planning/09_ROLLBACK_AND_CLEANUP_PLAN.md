# Rollback And Cleanup Plan

## E9 status

No rollback or cleanup was executed in E9 because no remote command was run and no corpus data was loaded.

## Future E10 cleanup planning

If E10 is approved for remote preview writes, the approval must state what cleanup is expected:

- leave preview corpus rows in place for later QA;
- delete only the load batch;
- truncate legal authority corpus tables;
- drop `legal_authority` and `legal_authority_stage`;
- or stop after planning with no remote writes.

## Preferred rollback model for preview load

A future preview loader should include a `load_batch_id` or equivalent marker for every staged and promoted row. Cleanup should prefer deleting only the approved preview load batch rather than dropping schemas, unless the owner approves a full schema reset.

## Destructive rollback requires owner approval

The E8 rollback SQL remains available only for the verified preview target and only with separate owner approval:

```sql
drop schema if exists legal_authority_stage cascade;
drop schema if exists legal_authority cascade;
```

Do not run that rollback against production. Do not run it against `benchbook-ai-prod`.

## Required verification before cleanup

Before any cleanup in E10 or later:

- verify target is `benchbook-ai`;
- verify project ref is `clerihqbjyczarqkiqnb`;
- verify target is not `benchbook-ai-prod`;
- verify project ref is not `suiylfayvjsjtbrsjrwx`;
- verify corpus row counts;
- verify whether any later approved work depends on the rows;
- document the exact cleanup command plan without secrets.

## Stop conditions

Stop before cleanup if:

- the target cannot be verified;
- production appears in any target, link, or project ref;
- cleanup would touch app schemas or app tables;
- cleanup would remove data outside `legal_authority` or `legal_authority_stage`;
- a secret appears in output;
- the owner approval does not clearly authorize cleanup.
