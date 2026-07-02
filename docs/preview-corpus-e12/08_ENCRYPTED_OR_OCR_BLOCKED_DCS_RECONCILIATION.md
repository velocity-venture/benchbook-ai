# Encrypted Or OCR-Blocked DCS Reconciliation

Date: 2026-06-28

## Known issue

Earlier corpus records carried one historical encrypted or OCR-blocked DCS handbook item requiring reconciliation.

E12-A does not assume that this item is resolved. It records current metadata and the evidence still needed for a corpus-admin decision.

## Current metadata

| Source | Current metadata result |
|---|---|
| `EXPANDED_CHUNK_SUMMARY.json` | `sources_failed_or_ocr_count` is 0 |
| `EXPANDED_CHUNK_SUMMARY.json` | `sources_failed_or_ocr` list is empty |
| `EXPANDED_EXTRACTION_MANIFEST.json` | Clients Rights handbook row is marked `extracted` |
| `EXPANDED_EXTRACTION_MANIFEST.json` | Spanish Clients Rights handbook row is marked `extracted` |

## Current manifest evidence

| Source file | Status | Pages | Character count | Error |
|---|---|---:|---:|---|
| `637_Handbook_Clients_Rights_Handbook.pdf` | `extracted` | 20 | 49,519 | none recorded |
| `638_Handbook_Clients_Rights_Handbook_-_Spanish.pdf` | `extracted` | 22 | 56,699 | none recorded |

## Reconciliation plan

| Possible disposition | Evidence required |
|---|---|
| Resolved by later extraction | Confirm hash continuity between the historical skipped PDF and the currently extracted manifest row. |
| Outside current selected corpus | Show the historical skipped file is not the same source as the selected current file. |
| Still deferred | Identify a remaining source file with extraction failure, OCR-needed status, or missing text output. |
| Excluded by owner decision | Record owner decision and reason in corpus-admin notes. |

## Recommendation

Treat this as Needs further review until a corpus administrator compares the historical blocker record, source hash, source path, and current extraction manifest. Current metadata suggests extraction now exists, but the historical blocker should not be marked resolved without that evidence.
