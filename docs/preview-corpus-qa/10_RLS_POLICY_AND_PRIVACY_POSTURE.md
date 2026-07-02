# RLS Policy And Privacy Posture

Date: 2026-06-28

## Schema and RLS inventory

| Check | Count |
|---|---:|
| Legal authority and stage schemas present | 2 |
| Legal authority and stage base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| RLS-enabled legal authority and stage tables | 20 |
| RLS-disabled legal authority or stage tables | 0 |
| Broad `authority_chunks` policies | 0 |

## Policy inventory

| Table | Policy | Command | Roles |
|---|---|---|---|
| `answer_audit_records` | `legal_authority_user_answer_audits` | SELECT | public |
| `authority_families` | `legal_authority_read_families` | SELECT | public |
| `authority_units` | `legal_authority_read_units` | SELECT | public |
| `authority_versions` | `legal_authority_read_versions` | SELECT | public |
| `citation_aliases` | `legal_authority_read_citation_aliases` | SELECT | public |
| `corpus_builds` | `legal_authority_read_builds` | SELECT | public |
| `refusal_records` | `legal_authority_user_refusals` | SELECT | public |
| `retrieval_logs` | `legal_authority_user_retrieval_logs` | SELECT | public |

## Audit privacy checks

| Check | Count |
|---|---:|
| Answer text columns on `answer_audit_records` | 0 |
| Populated embeddings | 0 |
| Embedding column present | 1 |

## Local rules posture

No local juvenile court rules were loaded. Any later local-rules overlay must remain court-private, must distinguish statewide authority from local authority, and must keep absent local rules as a clean not-applicable state.

## Conclusion

The preview schema preserves the intended privacy posture for this phase. The main remaining privacy risk is future implementation risk: local rules and court-specific data must not be loaded into global tables or exposed through broad policies.
