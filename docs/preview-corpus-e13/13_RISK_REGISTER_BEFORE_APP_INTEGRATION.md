# Risk Register Before App Integration

Date: 2026-06-29

| Risk | Current status | Launch impact | Required before app integration |
|---|---|---|---|
| Displayable rows remain zero | Intentional | App retrieval would return no approved sources | Complete remediation and separate display-gate approval |
| Unresolved identity | 17 units and 21 chunks | Could misidentify authority | Corpus-admin identity review |
| Unknown effectivity | 15 versions and 39 chunks | Could misstate current law | Effectivity review and signoff |
| QA signoff required | 439 versions | Blocks production display | Corpus-admin workflow execution |
| DCS document anchored | 1146 chunks | Could overstate DCS authority | Keep guardrail/reference only pending mapping |
| Restricted Lexis material | 2392 chunks | License and display risk | Keep internal QA only unless approved |
| Pending extraction QA | 4198 chunks | Unreviewed extraction risk | Extraction QA workflow execution |
| DCS handbook historical blocker | 1 checklist item | Provenance narrative risk | Evidence reconciliation |
| App retrieval path | Not implemented | No production answer path | Later app integration phase only |
| Embeddings | 0 populated | Semantic retrieval not ready | Later approved embedding phase only |

## Conclusion

BenchBook.AI should not connect the preview corpus to the app yet. The next work should remain metadata remediation or read-only QA.
