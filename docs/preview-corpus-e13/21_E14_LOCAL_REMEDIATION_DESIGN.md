# E14 Local Remediation Design

Date: 2026-06-29

## Status

This is a design only. E14 was not executed.

## Options

| Option | Classification | Rationale |
|---|---|---|
| Local metadata overlay files | Adopt with revision | Good for reversible local remediation if schema is explicit, body-passage-free, and separately approved. |
| Generated patch maps | Adopt with revision | Useful for repeatable transformation, but must preserve provenance and avoid legal passages. |
| Loader mapping enhancement | Needs further review | Could reduce manual work but touches existing loader behavior and requires separate approval. |
| Ingestion metadata augmentation | Needs further review | Useful if metadata gaps are upstream, but must not alter source body material. |
| Source manifest correction | Needs further review | Appropriate only with source hash and provenance evidence. |
| Manual corpus-admin signoff files | Adopt | Best immediate next local artifact after queue review. |
| Defer implementation until queues are manually completed | Adopt with revision | Safe for high-risk rows, but should include a schedule and owner decision points. |

## Proposed local artifact shape

If E14 is approved, prefer metadata-only overlay files that include queue row ID, source hash, reviewer decision, evidence metadata, stop condition, reviewer role, review date, and owner escalation flag.

## E14 boundaries

E14 should not run remote commands, contact production, generate embeddings, change app code, relax display gates, change migrations, or modify source PDFs. Existing loader script changes require explicit owner approval.

## Promotion rule

No E14 local remediation artifact should itself make a row production-displayable. Promotion requires a later approved load or migration phase plus gate verification.
