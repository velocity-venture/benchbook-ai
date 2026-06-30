# Implementation Options And Dispositions

Date: 2026-06-29

## Disposition table

| Option | Classification | E14-A disposition |
|---|---|---|
| Docs-only templates and manual review | Adopt | Safest immediate path. Creates review structure without applying changes. |
| Local patch-map files applied by future script | Adopt with revision | Useful after owner approval. Must remain metadata-only and must not apply automatically. |
| Ingestion metadata augmentation | Needs further review | Could fix upstream metadata, but it would touch existing ingestion behavior and is outside E14-A. |
| Loader mapping enhancement | Needs further review | Could reduce manual mapping but would edit active loader logic and is outside E14-A. |
| Preview reload after patch-map application | Needs further review | Appropriate only after completed patch maps, owner approval, and a separate reload plan. |
| Defer implementation until manual review complete | Adopt with revision | Safest for high-risk legal rows, but should include a review schedule and owner decision points. |

## Rejected for E14-A

| Option | Classification | Reason |
|---|---|---|
| Direct remote patching | Reject | Remote writes are prohibited. |
| Production display enablement | Reject | Display gates must remain closed. |
| Embedding generation | Reject | Embeddings are prohibited in E14-A. |
| App integration | Reject | App code and preview connection are prohibited in E14-A. |
| Restricted Lexis display approval | Reject | License and owner approval would be required separately. |
| DCS production-answer promotion | Reject | DCS remains guardrail/reference only. |

## Practical path

E14-A should stop at validated templates and planning docs. E14-B should fill local draft artifacts if approved. E15 should only plan a preview reload after owner review of completed patch maps and decision registers.
