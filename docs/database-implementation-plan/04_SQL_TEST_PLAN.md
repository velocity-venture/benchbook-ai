# SQL Test Plan

This plan is for a later authorized test phase. Phase E1 did not run SQL against a database.

## 1. SQL Lint Or Parse Check

- Parse each future migration file in order.
- Use a disposable local PostgreSQL database with matching extensions where possible.
- Confirm every migration is idempotent where it claims to be.
- Confirm no migration edits older migrations.

## 2. Disposable Local Migration Dry Run

- Apply migrations to a local disposable database only.
- Confirm schemas, enum types, tables, indexes, views, RPCs, grants, and RLS policies exist.
- Drop the disposable database after the run.
- Do not use production Supabase without owner approval.

## 3. Load Dry Run From Ignored Expanded Chunks

- Read ignored expanded chunks and summaries.
- Load to staging only in disposable local database.
- Promote to target tables only inside dry-run transaction or disposable database.
- Roll back or drop after test.

## 4. Count Reconciliation

- Reconcile chunk count against `EXPANDED_CHUNK_SUMMARY.json`.
- Reconcile source count.
- Reconcile selected, extracted, duplicate, and failed source counts.
- Reconcile warning counts by code.
- Reconcile DCS duplicate groups and alias paths.

## 5. Effective-Date Partition Tests

- Query flagged effective-dated units.
- Confirm each variant maps to the same stable authority unit but separate authority versions.
- Confirm no future-effective row appears in current-law mode before its date.
- Confirm as-of date after future date selects successor version.
- Confirm high-risk rows require QA signoff.

## 6. Display-Gate Tests

- Production views return zero restricted chunks.
- Production views return zero pending extraction QA chunks.
- Exact citation lookup cannot bypass display gates.
- FTS cannot bypass display gates.
- Vector placeholder cannot bypass display gates.

## 7. TRE Scope Tests

- TRE rows have limited evidentiary or procedural answer scope.
- TRE rows are not returned as general juvenile-law authority.
- Evidence/procedure filters may include TRE after approval.

## 8. DCS Duplicate Membership Tests

- One `source_files` row per DCS SHA-256.
- All alias paths preserved in `source_file_memberships`.
- DCS chapter filter finds membership rows.
- Duplicate text is not returned as repeated answer support.

## 9. Citation Lookup Tests

- Canonical citation aliases resolve to authority units.
- Short user aliases resolve when unambiguous.
- Citation alias collisions are reported.
- Citation lookup applies as-of date and display filters.

## 10. Full-Text Index Tests

- GIN index exists after post-load index migration.
- `websearch_to_tsquery` and `plainto_tsquery` plans use allowed filters.
- FTS results reconcile with display, approval, effectivity, family, source type, chunk type, and corpus designation filters.

## 11. pgvector Placeholder Tests

- `embedding` column exists only if pgvector was approved.
- Embedding values remain null before embedding phase.
- Vector index does not exist before embeddings are approved and populated.

## 12. Retrieval-Filter Tests

- Filter by authority family.
- Filter by source type.
- Filter by corpus designation.
- Filter by approval status.
- Filter by display status.
- Filter by effective date.
- Filter by version status.
- Filter by chunk type.
- Filter by DCS chapter.
- Filter by citation alias.
- Filter by source hash.

## 13. Black-Letter-Only Retrieval Tests

- Includes approved current `black_letter_text` statutes and rules.
- Excludes history.
- Excludes advisory comments.
- Excludes annotations.
- Excludes case notes.
- Excludes DCS guides and unknown chunks.
- Excludes future-effective text before effective date.

## 14. Answer Audit Reconstruction Tests

- Given an answer audit row, reconstruct:
  - corpus build
  - source file
  - source membership paths
  - authority unit
  - authority version
  - page span
  - chunk text hash
  - citation aliases
  - retrieval log
  - citation verification records
- Confirm no legal text needs to be printed in audit reports.

## 15. Refusal Record Tests

- Out-of-scope request writes refusal record.
- Restricted-only retrieval writes `restricted_display_only`.
- No support writes `no_authority_support`.
- Future-effective-only support writes `future_effective_only`.
- Refusal records link to corpus build and retrieval log when available.

## Required Test Result Format

Future test reports should include:

- migration file order
- database target type
- pass/fail per check
- row counts only
- blocker list
- remediation recommendation
- confirmation that no production database was touched
