# Function Signature And Policy Recheck

Date: 2026-06-29

## Function signatures

| Function | Arguments | Security definer | Volatility |
|---|---|---|---|
| `lookup_citation_alias` | `p_normalized_alias text, p_as_of_date date DEFAULT CURRENT_DATE` | Yes | Stable |
| `search_displayable_chunks` | `p_query text, p_as_of_date date DEFAULT CURRENT_DATE, p_family_codes text[] DEFAULT NULL::text[], p_limit integer DEFAULT 20` | Yes | Stable |

## Policy and table posture

| Check | Result |
|---|---:|
| RLS-enabled legal authority and stage tables | 20 |
| RLS-disabled legal authority and stage tables | 0 |
| Broad `authority_chunks` policies | 0 |
| Public `authority_chunks` policies | 0 |
| Displayable view rows | 0 |
| Black-letter displayable view rows | 0 |
| Internal QA restricted view rows | 6,590 |
| Embedding column present | 1 |
| Populated embeddings | 0 |

## Conclusion

The two read-only retrieval functions remain stable security-definer functions. No broad raw `authority_chunks` read policy appeared.
