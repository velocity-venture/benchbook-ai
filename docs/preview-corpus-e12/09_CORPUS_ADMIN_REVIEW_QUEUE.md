# Corpus Administrator Review Queue

Date: 2026-06-28

This queue is metadata-only and excludes legal body text.

| Category | Count | Priority | Reviewer role | Required source authority | Proposed disposition | Production impact | Stop condition |
|---|---:|---|---|---|---|---|---|
| Unresolved authority units | 17 | High | Corpus administrator | Source metadata, citation fields, file identity | Needs further review | Blocks display for affected rows | Cannot identify reliable authority unit |
| Unresolved chunks | 21 | High | Corpus administrator | Chunk metadata, source file, warning codes | Needs further review | Blocks production eligibility | Requires legal body text beyond approved QA workflow |
| Unknown-effectivity versions | 15 | High | Corpus administrator plus owner if ambiguous | Current source, effective-date metadata | Needs further review | Blocks display and retrieval | Effective date cannot be verified |
| Unknown-effectivity chunks | 39 | High | Corpus administrator | Version status and source metadata | Needs further review | Blocks display and retrieval | Version stays unknown |
| QA-signoff-required versions | 439 | High | Corpus administrator, owner for high-risk rows | Source metadata and current-law verification | Adopt with revision after signoff | Blocks production display until signed off | Current law cannot be confirmed |
| DCS document-anchored chunks | 1,146 | Medium | Corpus administrator | DCS source identity and document type | Adopt with revision as guardrail-only | No production-answer authority | Mapping requires inference instead of proof |
| Restricted annotation, case-note, advisory chunks | 2,392 | High | Owner plus license reviewer | License and display permission | Archive or internal QA-only | Blocks source-card display and answer authority | License/display approval absent |
| Pending extraction QA chunks | 4,198 | High | Corpus administrator | Extraction metadata and source hash | Needs further review | Blocks all production display | Extraction confidence remains pending |
| Historical DCS handbook reconciliation | 1 | Medium | Corpus administrator | Historical blocker record and current extraction manifest | Needs further review | Blocks clean provenance narrative | Source hash continuity cannot be shown |

## Review cadence

1. Resolve the 21 unresolved chunks first because they are small and concrete.
2. Resolve unknown effectivity before any production display discussion.
3. Work QA-signoff-required versions by high-risk category.
4. Keep DCS and restricted rows gated while statutory and rule rows are reviewed.
