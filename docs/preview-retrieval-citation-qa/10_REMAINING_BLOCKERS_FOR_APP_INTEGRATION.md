# Remaining Blockers For App Integration

Date: 2026-06-29

The preview corpus should not be connected to the app yet.

## Blockers

| Blocker | Count or status | Why it blocks app integration |
|---|---:|---|
| Displayable rows | 0 | The zero-display posture is intentional. A user-facing answer path would have no approved sources. |
| Pending extraction QA chunks | 4,198 | Unreviewed extraction cannot be judge-facing. |
| Restricted pending license review chunks | 2,392 | Restricted annotations, case notes, and advisory material cannot be displayed absent approval. |
| DCS production eligibility | 0 | DCS remains guardrail/reference only. |
| TRE scope | limited only | TRE may not be treated as broad juvenile-law authority. |
| Unknown-effectivity versions | 15 | Current-law status is unresolved. |
| Unknown-effectivity chunks | 39 | These remain excluded. |
| QA-signoff-required versions | 439 | Corpus-admin signoff is still required. |
| Unresolved authority units | 17 | Authority identity remains unresolved. |
| Unresolved chunks | 21 | Chunk identity remains unresolved. |
| Migration-history caveat from E8 | unresolved operational caveat | Promotion readiness should not rely on schema state alone. |
| App retrieval path | not implemented | The app has no current code path using the legal authority schema or RPCs. |
| Embeddings | 0 populated | Semantic retrieval is not ready and was not approved. |

## Conclusion

App integration remains premature. Continue metadata remediation and read-only retrieval QA before any user-facing corpus path is planned.
