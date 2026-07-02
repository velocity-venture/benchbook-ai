# Load Path Engineering Review

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E9 planning only

No remote command was run for this review. No Supabase project was contacted, no corpus rows were loaded, no embeddings were generated, and no app files, migrations, loader scripts, source PDFs, or corpus data files were changed.

## Review purpose

This file evaluates possible future paths for an owner-approved E10 preview corpus-load dry run. It does not authorize E10, remote writes, corpus loading, or any production action.

The controlling assumptions remain:

- target preview project, if ever approved: `benchbook-ai`;
- target preview project ref, if ever approved: `clerihqbjyczarqkiqnb`;
- forbidden project: `benchbook-ai-prod`;
- forbidden production project ref: `suiylfayvjsjtbrsjrwx`;
- V1 corpus scope remains locked;
- no Titles 39, 40, or 55;
- no web retrieval;
- no embeddings;
- no app integration;
- all display gates remain closed.

## Option summary

| Option | What it would do | Required controls | Secrets risk | Production target risk | Display gate handling | Migration-history risk | Disposition |
|---|---|---|---|---|---|---|---|
| Reuse existing local dry-run loader directly against preview | Point `scripts/database_load/dry_run_load_legal_authority.py` at preview after bypassing local-only checks | Would require bypassing protections and changing execution assumptions | medium | high | logic is useful, but execution path is unsafe | high, because it applies draft migrations | reject |
| Preview-only loader adapter | Reuse local validation and mapping logic, but remove migration application and add preview target checks | hard target allowlist, batch id, metadata-only logging, preflight counts, post-load gates, no embeddings | low to medium | low if checks are hard failures | strongest path if gates are asserted before and after | low if it refuses migration actions | adopt with revision |
| SQL/COPY staging plan | Generate explicit staging artifacts and promotion SQL for reviewed E10 execution | transaction plan, artifact review, row-count checks, cleanup plan, no legal body text in committed docs | medium | medium | strong if SQL includes gate assertions and stop checks | medium, because schema history remains separate | adopt with revision |
| Supabase CLI `db query --linked --file` with generated SQL batches | Execute reviewed SQL files through the linked preview project | verified link before every command, no secrets in logs, small batches, no source-text commits | medium | medium | possible, but operationally brittle for large corpus loads | medium to high because E8 history caveat remains | needs further review |
| Remote `psql` with explicit connection string | Connect directly to preview and run staging or promotion SQL | would require handling a database URL or password | high | medium to high | technically possible, operationally unsafe for this phase | medium | reject |
| Defer remote loading until more QA is complete | Keep preview schema empty and continue planning, QA, and adapter design | none beyond current local-only boundary | low | low | gates remain empty | low | adopt as safest delay option |

## Existing local loader review

The existing loader is valuable as an engineering proof, but it should not be promoted into a remote execution tool without a separate adapter. It currently proves that the extracted corpus metadata can be staged, mapped, promoted, reconciled, and checked in a disposable local database.

The loader is not a safe direct E10 preview executor because:

- it is intentionally local-first;
- it applies draft migrations as part of local database setup;
- it depends on local `psql` execution assumptions;
- it refuses non-local targets, which is a protection that should not be weakened;
- it was built to validate mapping and gates, not to operate a shared preview database;
- its rollback model is disposable local database deletion, not remote row cleanup.

The mapping and gate logic should be reused. The remote execution shell should be new, narrow, and target-aware.

## Recommended E10 load path

If the owner approves a remote-write E10 dry run, the recommended path is a preview-only loader adapter with these properties:

1. Refuse to run unless the approved preview project and project ref are independently verified.
2. Refuse to run if the target appears to be `benchbook-ai-prod` or project ref `suiylfayvjsjtbrsjrwx`.
3. Refuse to apply migrations.
4. Refuse to generate embeddings.
5. Refuse to relax display gates.
6. Refuse to load app-facing production corpus rows.
7. Create one E10 batch id and attach it to all inserted rows where schema permits.
8. Log only metadata, counts, table names, and identifiers.
9. Assert pre-load row counts before inserting.
10. Stage raw manifest, chunks, warnings, and deduplication groups first.
11. Promote through the same table order validated locally.
12. Verify displayable views remain empty after promotion.
13. Verify restricted and pending QA rows remain internal only.
14. Verify DCS remains guardrail-only and not production-answerable.
15. Verify TRE remains limited evidentiary and procedural scope.
16. Verify future-effective and unknown-effectivity restrictions.
17. Produce a rollback or cleanup report.

## Required refusal points for an E10 adapter

An E10 adapter should stop immediately if any of these conditions is true:

- owner approval does not explicitly allow remote writes;
- target identity is not proven;
- target identity points to production;
- migration application appears necessary;
- source text would be printed to logs;
- secrets would be printed or committed;
- embeddings would be generated;
- app configuration would need to be changed;
- displayable view count would be greater than zero;
- restricted chunks would become displayable;
- pending QA chunks would become displayable;
- DCS chunks would become production-answerable;
- TRE chunks would exceed limited evidentiary and procedural scope;
- future-effective chunks would become visible before their effective date;
- unknown-effectivity chunks would become generally visible.

## E9 conclusion

The local dry-run proof supports a future preview load, but only through a preview-specific execution boundary. The safest next step is either:

1. continue planning and write the adapter without remote execution; or
2. after explicit owner approval, run a preview corpus-load dry run with remote writes, zero display, no embeddings, no app integration, and full rollback documentation.
