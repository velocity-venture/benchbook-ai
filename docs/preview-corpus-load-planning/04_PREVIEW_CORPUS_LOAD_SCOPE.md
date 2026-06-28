# Preview Corpus-load Scope

## Conservative default scope

A future E10 should consider loading metadata and target-table corpus rows into the preview project only if separately approved in writing.

Default recommendation:

- Preview only.
- Load corpus rows only if E10 approval expressly permits remote writes.
- Keep all production display gates closed.
- Load restricted and pending QA rows only if needed to test gates.
- Do not make restricted or pending QA rows displayable.
- Do not generate embeddings.
- Do not integrate the app.
- Do not replace the production corpus.
- Do not open display gates.

## Corpus families inside V1 scope

Allowed V1 families:

- T.C.A. Title 36.
- T.C.A. Title 37.
- Tennessee Rules of Juvenile Practice and Procedure.
- Selected DCS policies and procedures.
- Tennessee Rules of Evidence only as limited evidentiary or procedural authority.

Still excluded:

- T.C.A. Title 39.
- T.C.A. Title 40.
- T.C.A. Title 55.
- Open web retrieval.
- Broad external legal research.
- BenchMark Standard content or coupling.
- Global loading of court-private local juvenile rules.

## Expected load volume if approved

| Category | Expected count |
|---|---:|
| Source manifest rows | 677 |
| Unique source SHA-256 values / source files | 647 |
| Source memberships | 677 |
| Authority units | 1,321 |
| Authority versions | 1,343 |
| Authority chunks | 6,590 |
| Citation aliases | 3,598 |
| Chunk warnings | 359 |
| Extraction warnings | 864 |
| DCS chunks | 2,014 |
| TRE chunks | 533 |
| TRE limited-scope chunks | 533 |
| Current displayable rows | 0 unless separately approved |

## Items that should remain gated

| Item | Count |
|---|---:|
| Unresolved authority units | 17 |
| Unresolved chunks | 21 |
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Versions requiring QA signoff | 439 |
| DCS document-anchored chunks | 1,146 |
| Restricted Lexis annotation, case-note, and advisory chunks | 2,392 |
| Pending extraction QA chunks | 4,198 |
| Historical encrypted or OCR-blocked DCS handbook item | 1 requiring reconciliation |
