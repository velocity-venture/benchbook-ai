# Local Proofs Completed

Phase E5 re-ran local validation and disposable local target promotion after the E4 blocker remediation pass. No remote database was used.

## 1. Source manifest hash audit

- Manifest rows staged: 677.
- Unique source SHA-256 values: 647.
- Missing source manifest links from chunks: 0.
- Chunk text hash mismatches: 0.
- Invalid page spans: 0.
- The expanded chunk JSONL remains ignored and was used only as a derivative local input.

## 2. Expanded ingestion

- Pipeline version: `phase-e4-blocker-remediation-1.0`.
- Selected sources: 246.
- Extracted sources: 233.
- DCS duplicate source paths skipped by SHA-256: 13.
- Expanded authority chunks: 6,590.
- Extraction warnings: 864.
- Chunks with warnings: 339.
- Current E5 summary reports 0 `sources_failed_or_ocr`. Earlier E2 reporting carried 1 encrypted or OCR-blocked DCS handbook item, so that historical item still needs corpus-admin reconciliation before preview or production.

## 3. Local staging dry run

The E5 target command applied the existing draft migrations into a disposable local PostgreSQL database and staged:

| Staged input | Count |
|---|---:|
| `raw_source_manifest` | 677 |
| `raw_expanded_chunks` | 6,590 |
| `raw_extraction_warnings` | 864 |
| `raw_deduplication_groups` | 12 |

## 4. Local target-table promotion

The dry-run loader promoted staged inputs into target tables:

| Target table output | Count |
|---|---:|
| Source files | 647 |
| Source file memberships | 677 |
| Authority units | 1,321 |
| Authority versions | 1,343 |
| Authority chunks | 6,590 |
| Citation aliases | 3,598 |
| Chunk warnings | 359 |
| Extraction warnings | 864 |

The loader inserted one retrieval log, one answer audit record, and one citation verification record solely to prove audit reconstruction. No generated answer text was stored.

## 5. Duplicate chunk ID remediation

E4 remediation remains effective in E5:

| Duplicate check | Count |
|---|---:|
| Duplicate source chunk ID groups | 0 |
| Duplicate source chunk ID rows | 0 |
| Duplicate chunk conflicts | 0 |
| Missing source chunk links | 0 |

## 6. Alias collision suppression

- Normalized citation alias collision count: 0.
- Alias candidates suppressed by collision: 0.
- Production citation alias lookup count: 0, because production display gates are closed.

## 7. Display gates

| Display gate proof | Count |
|---|---:|
| Current displayable chunks | 0 |
| Restricted chunks in displayable view | 0 |
| Pending chunks in displayable view | 0 |
| Internal QA restricted chunks | 6,590 |
| Production-visible black-letter chunks | 0 |

## 8. TRE limited scope

- TRE chunks: 533.
- TRE chunks marked `limited_evidentiary_procedural`: 533.
- TRE chunks outside limited scope: 0.

TRE remains limited answer authority only for evidentiary or procedural questions, plus guardrail/reference authority.

## 9. DCS guardrail-only status

- DCS chunks: 2,014.
- DCS chunks marked guardrail/reference scope: 2,014.
- DCS production-eligible chunks: 0.

DCS rows are not yet production-answer authority. Document-anchored DCS rows remain especially limited because they do not carry policy-citation identity.

## 10. As-of-date filtering for future-effective text

- Current versions: 1,312.
- Future-effective versions: 16.
- Unknown-effectivity versions: 15.
- Current versions with future end date: 13.
- Future-effective versions visible before 2026-07-01: 0.

Future-effective material is present for local QA but is not visible before its effective date under the dry-run gates.

## 11. Audit reconstruction

- Retrieval log count used for proof: 1.
- Answer audit record count used for proof: 1.
- Citation verification record count used for proof: 1.
- Audit reconstruction join count: 1.
- Answer text columns in `legal_authority.answer_audit_records`: 0.

The audit proof reconstructs source, chunk, build, and citation verification metadata without storing generated answer text.
