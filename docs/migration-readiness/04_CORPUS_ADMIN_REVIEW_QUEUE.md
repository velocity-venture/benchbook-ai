# Corpus Administrator Review Queue

This is a metadata-only queue. It intentionally excludes legal body text, source excerpts, and derivative source text.

## Queue summary

| Queue | Count | Default disposition |
|---|---:|---|
| Unresolved identity units | 17 | Hold from production. |
| Unresolved identity chunks | 21 | Hold from production. |
| Unknown-effectivity versions | 15 | Hold from production. |
| Unknown-effectivity chunks | 39 | Hold from production. |
| Effective-dated versions requiring QA | 439 | Hold until signed off. |
| DCS document-anchored units | 130 | Guardrail-only. |
| DCS document-anchored chunks | 1,146 | Guardrail-only and non-displayable. |
| Restricted Lexis annotation, case-note, and advisory chunks | 2,392 | Exclude from production retrieval and display. |
| Encrypted or OCR-blocked DCS handbook | 1 historical item | Reconcile status before preview. |

## Unresolved identity rows

| Dimension | Count |
|---|---:|
| Unresolved units | 17 |
| Unresolved chunks | 21 |
| DCS unresolved chunks | 20 |
| TRE unresolved chunks | 1 |
| Metadata chunks | 9 |
| Unknown chunks | 11 |
| Annotation candidate chunks | 1 |

Review actions:

- Map to a verified citation, rule number, policy number, or approved document identity.
- Keep as unresolved and excluded.
- Reclassify as document-anchored guardrail material.
- Record a waiver only if approved by the owner or delegated corpus administrator.

## Unknown-effectivity rows

| Item | Count |
|---|---:|
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |

Review actions:

- Determine effective date status from source metadata.
- Assign current, future-effective, superseded, expired, or excluded status.
- Keep excluded from production until reviewed.

## Effective-dated versions requiring QA

| Item | Count |
|---|---:|
| Versions requiring QA signoff | 439 |
| Current versions with future end date | 13 |
| Future-effective versions | 16 |
| Future-effective chunks | 120 |

Review actions:

- Confirm date parsing.
- Confirm as-of date behavior.
- Confirm current and future text are not blended.
- Sign off high-risk versions before any production eligibility.

## DCS document-anchored rows

| Item | Count |
|---|---:|
| Document-anchored units | 130 |
| Document-anchored chunks | 1,146 |

Review actions:

- Confirm the document type is reliable.
- Confirm the row should remain guardrail/reference only.
- Manually map to a policy identity only when source metadata supports it.
- Do not convert document-anchored rows into policy citations by inference alone.

## Restricted Lexis rows

| Restricted type | Count |
|---|---:|
| Annotation candidate | 1,118 |
| Case-note candidate | 979 |
| Advisory comment | 295 |
| Total restricted | 2,392 |

Review actions:

- Keep excluded from production retrieval and display by default.
- Confirm whether storage behind gates remains acceptable.
- Do not surface restricted rows to judges without written owner approval and license review.

## Encrypted or OCR-blocked DCS handbook

Earlier E2 reporting listed 1 encrypted or OCR-blocked DCS handbook as skipped. Current E5 metadata reports 0 failed or OCR-needed sources and lists handbook-named DCS PDFs as extracted. Corpus administration should reconcile the historical blocker and record one of these outcomes:

- Resolved by later extraction.
- Outside the current selected corpus.
- Still deferred.
- Excluded by owner decision.
