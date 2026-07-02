# Owner Approvals Required For Preview Execution

Phase E7 does not approve preview execution. The owner must separately approve every item below before Phase E8 can touch a preview database.

## Required Approvals

1. Exact preview target.
   - Name the Supabase project reference or preview database target.
   - Confirm it is not production.

2. Connection method.
   - State whether Supabase CLI, direct PostgreSQL, or another method is approved.
   - State whether `supabase link` is approved or still prohibited.
   - State whether `supabase db push` is approved or still prohibited.

3. Credential handling.
   - Identify which credentials are needed without printing them.
   - Require Doppler for API keys, tokens, service keys, and programmatic secrets.
   - Use Bitwarden only for usernames and passwords if needed.

4. Migration disposition.
   - Apply E6 files as-is.
   - Revise E6 files for preview.
   - Rename E6 files for preview.
   - Remove and regenerate a preview-specific migration set.

5. Migration list.
   - Name the exact migration files authorized for preview.

6. Load scope.
   - Schema only.
   - Schema plus staged derivative corpus.
   - Schema plus staged and promoted corpus.
   - State whether restricted and pending QA rows may be loaded for preview QA.

7. Access rules.
   - Name who may access preview.
   - Confirm no public access.
   - Confirm no production app integration unless separately approved.

8. Data gates.
   - Confirm production displayable count must remain 0 unless separately approved.
   - Confirm restricted and pending QA chunks remain non-displayable.
   - Confirm DCS remains guardrail/reference only.
   - Confirm TRE remains limited-scope.
   - Confirm unknown-effectivity rows remain QA-gated.
   - Confirm future-effective rows remain as-of-date gated.

9. Rollback plan.
   - Approve snapshot, schema drop, row cleanup by build id, or another exact rollback plan.

10. Reporting requirements.
    - Require migration hashes.
    - Require gate counts.
    - Require rollback proof.
    - Prohibit substantial legal source text and secrets in reports.

## Still Not Approved By E7

- Supabase preview connection.
- Supabase production connection.
- Any remote database access.
- `supabase link`.
- `supabase db push`.
- Commands requiring a Supabase access token.
- Embeddings.
- App integration.
- Production corpus replacement.
- Production display enablement.
- Display gate relaxation.
