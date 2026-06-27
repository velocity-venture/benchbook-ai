# Preview Rollback And Isolation Plan

## Isolation Requirements

Any future preview work must be isolated from production.

Required isolation:

- Preview target must be named and confirmed as non-production.
- Production Supabase must not be connected.
- Production corpus must not be replaced.
- App source must not be integrated with preview unless separately approved.
- Preview users must be owner-approved.
- No public access.
- No embeddings.
- No display gate relaxation.

## Recommended Rollback Model

Preferred order:

1. Use a disposable or resettable preview database.
2. Take or confirm a preview snapshot before migration.
3. Apply schema migrations only.
4. Verify schema and gates.
5. If corpus load is approved, tag rows with a preview build id.
6. Roll back by dropping preview schema, restoring preview snapshot, or deleting rows by build id.

## Schema Rollback

Schema rollback options require owner approval:

- Drop `legal_authority` and `legal_authority_stage` schemas in preview.
- Restore preview database from snapshot.
- Apply approved reverse migration files.

Do not run destructive rollback commands without written approval for the exact preview target.

## Data Rollback

If a preview corpus load is approved, every loaded row should be traceable to:

- Corpus build id.
- Load batch id.
- Source manifest hash.
- Chunk JSONL hash.

Rollback should remove staged and promoted rows by build or batch identifiers where possible.

## Verification After Rollback

After rollback, verify:

- Preview schema state matches the approved rollback target.
- No preview corpus rows remain if full cleanup was required.
- Displayable production view count is 0.
- Restricted rows are not displayable.
- Pending rows are not displayable.
- Audit rows do not expose answer text.
- No production database was touched.

## Proof To Document

A future preview execution report should document:

- Target name.
- Migration list.
- Migration hashes.
- Load scope.
- Gate counts.
- Rollback command or restore action.
- Final preview state.
- Confirmation that production was untouched.

Committed reports must not include substantial legal source text or secrets.
