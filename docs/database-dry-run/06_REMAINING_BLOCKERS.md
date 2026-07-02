# Remaining Blockers

## Production Blockers

1. Authority unit identity gaps

   Static validation found 80 non-metadata chunks without citation, section, rule, or policy identity inputs.

2. DCS policy identity gaps

   Static validation found 292 DCS policy or protocol chunks without policy identity metadata.

3. Effective-dated version partitioning

   Effective-dated rows must be partitioned into current, future-effective, superseded, expired, or unknown-effectivity versions. All effective-dated sections require QA signoff before production.

4. Pending extraction QA

   4,195 chunks remain `pending_extraction_qa`. These cannot be production-displayable by default.

5. Restricted material

   2,392 chunks are `restricted_pending_license_review`. These may be stored behind gates, but cannot be used in production answers unless the Judge or delegated corpus administrator approves a display-status change.

6. DCS handbook skipped

   One encrypted or OCR-blocked DCS handbook remains skipped for the first load.

7. Target-table promotion not yet implemented

   Phase E2 staged raw JSON locally. It did not promote rows into `source_files`, `source_file_memberships`, `authority_units`, `authority_versions`, `authority_chunks`, or `citation_aliases`.

8. pgvector unavailable locally

   The local database did not have pgvector installed. This is not a load blocker because embeddings are not authorized, but semantic retrieval remains deferred.

## Beta/Production Policy Blockers

- Retention policy still needs privacy review.
- Internal QA role mapping needs approval.
- SECURITY DEFINER RPC ownership needs review.
- Production display-status approval workflow needs implementation.
- Local juvenile court rules must later be handled as court-private authority families with tenant or court scoping.

## Recommended Resolution Order

1. Add local target-table promotion logic for source files and memberships.
2. Add authority unit and version construction with effectivity partitioning.
3. Add chunk promotion behind gates.
4. Add citation alias promotion and collision report.
5. Add warning import into warning tables.
6. Add retrieval/display-gate SQL tests against promoted rows.
7. Add answer audit reconstruction tests.
8. Re-run local disposable database dry run.
