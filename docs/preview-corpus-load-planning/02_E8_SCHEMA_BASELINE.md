# E8 Schema Baseline

Phase E8 completed schema-only preview execution against `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`.

## Schema baseline

| Item | Result |
|---|---:|
| `legal_authority` schema exists | true |
| `legal_authority_stage` schema exists | true |
| Legal authority and stage base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| RLS-enabled tables | 20 |

Created views:

- `v_black_letter_current_chunks`
- `v_current_displayable_chunks`
- `v_internal_qa_restricted_chunks`

## Zero corpus baseline

| Table or view | Row count |
|---|---:|
| `legal_authority.source_files` | 0 |
| `legal_authority.authority_units` | 0 |
| `legal_authority.authority_versions` | 0 |
| `legal_authority.authority_chunks` | 0 |
| `legal_authority.v_current_displayable_chunks` | 0 |
| `legal_authority.v_black_letter_current_chunks` | 0 |
| `legal_authority.v_internal_qa_restricted_chunks` | 0 |

## RLS posture

Policies shown in E8:

- `legal_authority_user_answer_audits`
- `legal_authority_read_families`
- `legal_authority_read_units`
- `legal_authority_read_versions`
- `legal_authority_read_citation_aliases`
- `legal_authority_read_builds`
- `legal_authority_user_refusals`
- `legal_authority_user_retrieval_logs`

No broad raw `authority_chunks` read policy was shown.

## No-integration baseline

- No app integration occurred.
- No embeddings were generated.
- No production corpus was replaced.
- No production display gate was relaxed.
- No production Supabase access occurred.
- `benchbook-ai-prod` was not touched.
