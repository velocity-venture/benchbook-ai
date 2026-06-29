# RLS Policy And Function Signature QA

Date: 2026-06-29

## Schema and RLS

| Check | Count |
|---|---:|
| Legal authority and stage schemas present | 2 |
| Legal authority and stage base tables | 20 |
| Legal authority views | 3 |
| RLS-enabled legal authority and stage tables | 20 |
| RLS-disabled legal authority and stage tables | 0 |
| Broad `authority_chunks` policies | 0 |

## Functions

| Function | Arguments | Security definer | Volatility | E12-B treatment |
|---|---|---|---|---|
| `lookup_citation_alias` | `p_normalized_alias text, p_as_of_date date` | true | stable | Count-only lookup probes were run. |
| `search_displayable_chunks` | `p_query text, p_as_of_date date, p_family_codes text[], p_limit integer` | true | stable | Count-only search probes were run. |
| `log_refusal_record` | `p_corpus_build_id uuid, p_query_hash text, p_refusal_kind text, p_reason text, p_filters jsonb` | true | volatile | Not called because it writes audit data. |

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

## Privacy checks

| Check | Count |
|---|---:|
| Answer text columns on `answer_audit_records` | 0 |
| Embedding column present | 1 |
| Populated embeddings | 0 |

## Conclusion

No broad public read policy exists for `authority_chunks`. Production app access should remain limited to gated server-side paths or security-definer RPCs that enforce display, scope, and as-of-date rules.
