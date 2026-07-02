# Schema-only Gate Verification

## Remote Gate Verification

Remote schema-only gate verification was completed after the preview-safe files were applied to the verified preview target `benchbook-ai`.

## Schema Presence

| Check | Result |
|---|---:|
| `legal_authority` schema exists | true |
| `legal_authority_stage` schema exists | true |
| Legal authority and stage base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |

Created views:

- `v_black_letter_current_chunks`
- `v_current_displayable_chunks`
- `v_internal_qa_restricted_chunks`

## Corpus Row Counts

| Table | Row count |
|---|---:|
| `legal_authority.source_files` | 0 |
| `legal_authority.authority_units` | 0 |
| `legal_authority.authority_versions` | 0 |
| `legal_authority.authority_chunks` | 0 |

## Display Gate Counts

| View | Row count |
|---|---:|
| `legal_authority.v_current_displayable_chunks` | 0 |
| `legal_authority.v_black_letter_current_chunks` | 0 |
| `legal_authority.v_internal_qa_restricted_chunks` | 0 |

## RLS And Policy Verification

| Check | Result |
|---|---:|
| RLS-enabled tables | 20 |
| Broad `authority_chunks` read policy shown | no |

Policies shown:

- `legal_authority_user_answer_audits`
- `legal_authority_read_families`
- `legal_authority_read_units`
- `legal_authority_read_versions`
- `legal_authority_read_citation_aliases`
- `legal_authority_read_builds`
- `legal_authority_user_refusals`
- `legal_authority_user_retrieval_logs`

No `authority_chunks` policy was shown.

## Gate Interpretation

- The preview legal authority schemas exist.
- The schema is empty of corpus data.
- Production display views return 0 rows.
- No broad raw `authority_chunks` read policy was verified.
- No source manifest, expanded chunks, extraction warnings, or embeddings were loaded.
- Display gates remain closed.
