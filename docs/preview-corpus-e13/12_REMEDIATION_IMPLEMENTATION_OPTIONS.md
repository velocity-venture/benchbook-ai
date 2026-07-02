# Remediation Implementation Options

Date: 2026-06-29

## Options

| Option | Classification | Notes |
|---|---|---|
| Docs-only remediation queue review | Adopt | Lowest-risk next step. Uses existing queues and no data modification. |
| Local metadata overlay files | Needs further review | Useful if owner approves local implementation artifacts in a later phase. |
| Ingestion metadata patch map | Needs further review | Could make remediation repeatable but requires careful source provenance. |
| Database loader mapping changes | Needs further review | Potentially useful but not approved in E13-A. |
| Source manifest correction | Needs further review | Appropriate only when source identity evidence supports correction. |
| Defer until corpus administrator manual review | Adopt with revision | Safe for high-risk rows, but should not become indefinite drift. |

## E13-A boundary

E13-A did not implement data changes. Any overlay file, patch map, loader change, or source-manifest correction requires separate owner approval and must preserve V1 scope, zero display, no embeddings, and no remote writes unless a later approved phase explicitly changes that boundary.
