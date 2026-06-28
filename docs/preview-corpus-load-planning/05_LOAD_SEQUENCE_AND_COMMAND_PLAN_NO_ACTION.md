# Load Sequence And Command Plan, No Action

No command in this file was run in E9. This is a plan for a future owner-approved E10 only.

## Recommended future approach

Do not point `scripts/database_load/dry_run_load_legal_authority.py` directly at preview. It is a local dry-run loader. It applies draft migrations, stages JSON, promotes target rows, and refuses non-local database targets.

Recommended E10 path:

1. Run local static validation.
2. Verify preview target with read-only Supabase CLI or approved read-only checks.
3. Confirm the E8 schema baseline and migration-history caveat.
4. Use a preview-safe loader adapter or SQL/COPY staging plan reviewed before execution.
5. Load staging rows only if owner approval permits remote writes and corpus loading.
6. Promote target rows with the same mapping rules proven locally.
7. Keep every display gate closed.
8. Verify counts and gates.
9. Document rollback or cleanup status.

## Loader path options

| Option | Description | Tradeoff |
|---|---|---|
| Reuse local loader logic through a preview adapter | Extract or wrap the validated staging and promotion mapping without applying migrations or allowing non-local accidents. | Best continuity with E4/E5/E6 proofs, but requires new reviewed code in a future phase. |
| Create a new preview-only loader script | Purpose-built for preview target verification, staging, promotion, gate checks, and cleanup. | Cleanest safety boundary, but more code to review. |
| SQL/COPY staging plan | Generate explicit SQL/COPY artifacts and run them against preview under approval. | Transparent and auditable, but more operationally manual and easier to mis-order. |
| Avoid remote loading until QA progresses | Keep preview schema empty until identity/effectivity/restricted-content QA improves. | Lowest risk, but delays retrieval and gate testing. |

## E9 recommendation

The strongest E10 plan is a new preview-only adapter that reuses the proven local validation and row-mapping logic but removes local-only migration application and refuses to run unless:

- target is exactly `benchbook-ai`;
- project ref is exactly `clerihqbjyczarqkiqnb`;
- production target is not linked;
- owner approval permits remote writes;
- row-count baseline is confirmed;
- display gates are closed before and after load.

## Command categories for E10 planning

Future E10 may consider command categories only after written approval:

- read-only target verification;
- local static validation;
- preview staging load;
- preview target promotion;
- count verification;
- gate verification;
- rollback or cleanup.

E9 ran none of the remote command categories.
