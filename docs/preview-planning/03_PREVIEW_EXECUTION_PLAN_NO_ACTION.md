# Preview Execution Plan, No Action

This is a future plan only. E7 did not execute any preview step.

## Step 1: Preflight Checks

Run only after Phase E8 owner approval:

```bash
pwd
git branch --show-current
git status --short
git log --oneline -10
find supabase/migrations -type f | sort
find supabase/migrations_draft -type f | sort
```

Confirm:

- Branch is `refactor/codex-gpt55-launch-prep` or an owner-approved branch.
- Working tree is clean.
- Exact preview target is named in the prompt.
- No production target is configured.
- Secrets are available through approved secret handling.
- E6 migration file disposition is approved.

## Step 2: Target Confirmation

Before connecting, write down:

- Preview project reference.
- Preview database host or connection alias.
- Approved connection method.
- Approved migration list.
- Approved load scope.
- Approved rollback action.
- Approved access list.

Stop if the target is not explicit.

## Step 3: Migration Application Strategy

Preferred preview strategy:

1. Use a preview-specific migration list approved by the owner.
2. Apply schema migrations before any corpus load.
3. Verify that `legal_authority` and `legal_authority_stage` objects exist.
4. Verify displayable views return 0 rows before any load.
5. Verify RLS is enabled and no broad chunk read policy exists.

Decision required before execution:

- Apply E6 files as-is.
- Apply revised preview-safe versions.
- Rename or regenerate preview-specific files.

Migration 001 requires special review because local `auth.uid()` stub logic should not be applied blindly to Supabase preview.

## Step 4: Corpus Load Strategy

Recommended preview load path:

1. Schema-only first.
2. If owner approves data load, stage the current expanded corpus only into preview.
3. Load all rows with existing closed gates.
4. Keep production displayable count at 0 unless separately approved.
5. Keep restricted and pending rows out of displayable views.
6. Do not generate embeddings.
7. Do not replace any production corpus.

## Step 5: Gate Verification

Required preview checks after schema or load:

- Displayable production view count is 0.
- Restricted chunks in displayable view count is 0.
- Pending chunks in displayable view count is 0.
- DCS production-eligible count is 0.
- TRE limited-scope count is 533 of 533 if data is loaded.
- Future-effective versions are not visible before their effective date.
- Unknown-effectivity rows remain QA-gated.
- Citation alias production lookup returns 0 unless display approval is separately granted.
- Audit reconstruction works without storing answer text.

## Step 6: Rollback Strategy

Before execution, choose a rollback option:

- Drop the preview schema if the target is disposable and owner approved.
- Restore from a preview backup or snapshot.
- Apply reverse migration scripts only if written and approved.
- Remove staged corpus rows by preview build id if data load is approved.

No rollback step may touch production.

## Step 7: Access Restrictions

Preview access should be limited to named owner-approved users.

Minimum preview restrictions:

- No public access.
- No app integration unless separately approved.
- No production user traffic.
- No local court-private rules in the global preview corpus.
- Retrieval logs use query hashes by default.
- Answer audit records do not store generated answer text.

## Step 8: Audit Logging

Preview audit expectations:

- Record migration list and hashes.
- Record corpus build id if loaded.
- Record row counts and gate verification counts.
- Record rollback proof.
- Avoid legal body text in committed reports.
- Avoid secrets in logs.

## Step 9: Owner Acceptance Criteria

Preview execution is acceptable only if:

- The exact approved preview target was used.
- No production database was touched.
- Migration application completed or rolled back cleanly.
- Gates remained closed.
- No embeddings were generated.
- No app integration occurred.
- No production corpus was replaced.
- All reports avoid substantial legal source text and secrets.

## Step 10: Stop Conditions

Stop immediately if:

- The target is ambiguous.
- The connection appears to be production.
- A Supabase token is required but not approved for the phase.
- `supabase link` or `supabase db push` would be required without explicit approval.
- Migration 001 auth behavior is unresolved.
- Any script or app source change appears necessary.
- Any secret appears in output.
