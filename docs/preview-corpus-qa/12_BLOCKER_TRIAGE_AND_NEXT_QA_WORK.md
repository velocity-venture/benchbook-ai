# Blocker Triage And Next QA Work

Date: 2026-06-28

## Blocker categories

| Blocker category | Count | E11 classification | Next action |
|---|---:|---|---|
| Unresolved authority units | 17 | Needs further review | Review identity metadata and either resolve, archive, or reject each unit. |
| Unresolved chunks | 21 | Needs further review | Map to authority units or exclude from production eligibility. |
| Unknown-effectivity versions | 15 | Needs further review | Assign reliable current, future, expired, superseded, or rejected status. |
| Unknown-effectivity chunks | 39 | Needs further review | Keep excluded until version status is resolved. |
| QA-signoff-required versions | 439 | Needs further review | Queue for corpus-admin signoff before any display gate opens. |
| DCS document-anchored chunks | 1,146 | Needs further review | Keep guardrail-only unless owner approves specific policy mapping. |
| Restricted Lexis annotation, case-note, and advisory chunks | 2,392 | Needs further review | Keep restricted until license and display approval are complete. |
| Pending extraction QA chunks | 4,198 | Needs further review | Complete extraction QA before production display. |
| Historical encrypted or OCR-blocked DCS handbook item | 1 historical reconciliation item | Needs further review | Reconcile earlier E2 blocker with current metadata reporting zero failed-or-OCR sources. |

## Current metadata note

The E11 static metadata validator reports:

| Static validation item | Result |
|---|---:|
| Total chunks | 6,590 |
| Pending extraction QA chunks | 4,198 |
| Restricted pending license review chunks | 2,392 |
| Current failed-or-OCR source count | 0 |

Earlier records carried forward one encrypted or OCR-blocked DCS handbook item. E11 treats that as an unresolved reconciliation item, not as proof that a current source failed extraction.

## Recommended next QA work

1. Reconcile the historical DCS handbook blocker with current extracted-source metadata.
2. Triage the 17 unresolved units and 21 unresolved chunks.
3. Resolve the 15 unknown-effectivity versions and 39 associated chunks.
4. Build a corpus-admin review queue for the 439 QA-signoff-required versions.
5. Keep all restricted and pending QA chunks out of displayable views.
