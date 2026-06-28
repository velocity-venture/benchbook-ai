# Owner Approvals Required For E10

E10 must not execute unless Judge Eckel provides separate written approval.

## E10 phase type

The approval must state which one applies:

1. E10 preview corpus-load planning only.
2. E10 preview corpus-load dry run with remote writes to `benchbook-ai`.
3. E10 preview corpus-load execution into `benchbook-ai`.

If the approval does not expressly allow remote writes, E10 remains planning-only.

## Required target language

The approval must name:

- target: `benchbook-ai`;
- project ref: `clerihqbjyczarqkiqnb`;
- forbidden target: `benchbook-ai-prod`;
- forbidden project ref: `suiylfayvjsjtbrsjrwx`.

## Required scope decisions

The approval must answer:

1. Are remote writes allowed?
2. May corpus rows be loaded?
3. May source manifest rows be loaded?
4. May expanded chunk rows be loaded?
5. May extraction warning rows be loaded?
6. May restricted and pending QA rows be loaded to test gates?
7. May any rows become production-displayable?
8. Do embeddings remain prohibited?
9. Does app integration remain prohibited?
10. What rollback or cleanup is required?
11. How should the E8 migration-history caveat be handled?

## Recommended default answers

- Remote writes: no, unless E10 is explicitly approved for them.
- Corpus rows: no, unless E10 is explicitly approved for them.
- Restricted and pending QA rows: load only if needed for gate testing and expressly approved.
- Production-displayable rows: no.
- Embeddings: prohibited.
- App integration: prohibited.
- Production corpus replacement: prohibited.
- Production Supabase: prohibited.

## Required E10 verification if remote writes are approved

E10 must verify:

- target before every remote command;
- no production project;
- before and after row counts;
- source files count;
- source memberships count;
- authority units count;
- authority versions count;
- authority chunks count;
- citation aliases count;
- warning counts;
- displayable view count remains 0;
- restricted chunks do not appear in displayable views;
- pending QA chunks do not appear in displayable views;
- DCS production-eligible count remains 0;
- TRE limited-scope check;
- future-effective visibility check;
- unknown-effectivity QA gate check;
- RLS and policy checks;
- no embeddings;
- no app integration;
- rollback or cleanup plan;
- audit trail of commands without secrets.
