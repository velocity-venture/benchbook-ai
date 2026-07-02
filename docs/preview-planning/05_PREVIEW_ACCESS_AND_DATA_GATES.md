# Preview Access And Data Gates

## Access Gates

Preview access should remain closed unless a later owner approval states otherwise.

Minimum access rules:

- Named owner-approved users only.
- No public links.
- No production user traffic.
- No court-private local rules loaded into a global corpus.
- No app integration unless separately approved.
- No service role exposure in client code.
- No secrets in logs or docs.

## Display Gates

These gates must remain true in preview unless separately approved:

| Gate | Required Result |
|---|---:|
| Production displayable count | 0 |
| Restricted chunks in displayable views | 0 |
| Pending QA chunks in displayable views | 0 |
| DCS production-eligible chunks | 0 |
| Citation alias production lookup | 0 unless display approval is separately granted |

## Corpus Scope Gates

The preview corpus must remain inside the BenchBook.AI closed universe:

- T.C.A. Title 36.
- T.C.A. Title 37.
- Tennessee Rules of Juvenile Practice and Procedure.
- Selected DCS policies and procedures.
- Tennessee Rules of Evidence only as limited evidentiary or procedural authority.
- Optional local juvenile rules only as a later private overlay, not a global corpus load.

Still excluded:

- T.C.A. Title 39.
- T.C.A. Title 40.
- T.C.A. Title 55.
- Open web retrieval.
- BenchMark Standard content or coupling.
- Broad external legal research.

## Data Category Gates

| Category | Preview Rule |
|---|---|
| Restricted Lexis annotation, case-note, and advisory chunks | Stored only if owner-approved for preview QA, never displayable. |
| Pending extraction QA chunks | Stored only if owner-approved for preview QA, never displayable. |
| DCS document-anchored chunks | Guardrail/reference only, not production-citation authority. |
| DCS corpus rows | Production eligible 0 until document type, currency, extraction QA, and owner approval are complete. |
| TRE rows | Limited evidentiary or procedural scope only. |
| Unknown-effectivity rows | QA-gated and excluded from production eligibility. |
| Future-effective rows | Filtered by as-of date. |

## Audit And Privacy Gates

Preview audit records should:

- Use query hashes by default.
- Avoid generated answer text storage.
- Keep retrieval and answer audit data tenant-safe.
- Keep court-private local rules out of global preview scope.
- Avoid substantial legal source text in committed reports.

## Embedding Gate

Embeddings remain prohibited. Migration 010 may create a nullable placeholder only if `vector` exists, but no embedding values or vector indexes may be populated unless a later owner approval expressly authorizes embeddings.
