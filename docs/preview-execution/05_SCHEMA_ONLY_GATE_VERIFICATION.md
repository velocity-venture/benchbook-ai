# Schema-only Gate Verification

## Remote Gate Verification

Remote gate verification was not run because no remote schema migration was applied.

## Local Schema-only Smoke Gates

The local smoke test verified schema-only gates without loading corpus data.

| Gate | Result |
|---|---:|
| Preview migrations applied locally | 10 |
| Authority chunk rows | 0 |
| Displayable production view count | 0 |
| RLS-enabled table count | 20 |
| `authority_chunks` policy count | 0 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| Embedding column count | 0 |

## Gate Interpretation

- No corpus rows were present.
- `v_current_displayable_chunks` returned 0 rows.
- No broad raw `authority_chunks` read policy was created.
- The nullable embedding column was not created in the local smoke test because pgvector was unavailable.
- No embeddings were generated.

## Required Remote Verification After Target Access Exists

After a later approved remote run, verify:

- `legal_authority` schema exists.
- `legal_authority_stage` schema exists.
- Expected base tables, views, and functions exist.
- RLS is enabled on target tables.
- No broad raw `authority_chunks` read policy exists.
- `select count(*) from legal_authority.authority_chunks` returns 0 for schema-only E8.
- `select count(*) from legal_authority.v_current_displayable_chunks` returns 0.
- No corpus staging tables contain rows.
- No embeddings exist.
