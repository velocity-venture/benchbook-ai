# Load Reconciliation Results

## Source Manifest

| Metric | Count |
|---|---:|
| Source manifest rows | 677 |
| Unique source SHA-256 values | 647 |
| Invalid SHA-256 values | 0 |
| Manifest file SHA-256 | `7068d33b5a8bc31601e54a8450324bcac7717de1670b3a5739f9d291fea3856b` |

## Expanded Chunks

| Metric | Count |
|---|---:|
| Expanded chunks | 6,587 |
| Summary total chunks | 6,587 |
| Text hash mismatches | 0 |
| Invalid text hashes | 0 |
| Missing source manifest hash links | 0 |
| Unknown authority families | 0 |
| Invalid page spans | 0 |
| Duplicate chunk ID conflicts | 0 |

## Display Status

| Status | Count |
|---|---:|
| `pending_extraction_qa` | 4,195 |
| `restricted_pending_license_review` | 2,392 |
| Production eligible by Phase C status | 0 |
| Restricted production violations | 0 |
| Pending production violations | 0 |

## Chunk Types

| Chunk type | Count |
|---|---:|
| `black_letter_text` | 1,123 |
| `history` | 1,061 |
| `annotation_candidate` | 1,118 |
| `case_note_candidate` | 979 |
| `advisory_comment` | 295 |
| `policy_text` | 747 |
| `protocol` | 303 |
| `guide` | 176 |
| `manual` | 363 |
| `metadata` | 218 |
| `unknown` | 158 |
| `work_aid` | 46 |

## Retrieval Inputs

| Metric | Count |
|---|---:|
| Black-letter candidates | 1,059 |
| Chunks with citation aliases | 14,687 alias entries observed |
| Citation alias collisions | 0 |
| Non-metadata chunks missing unit identity inputs | 80 |
| DCS policy/protocol chunks missing policy identity | 292 |

## Warnings

| Warning source | Count |
|---|---:|
| Summary warning count | 862 |
| Warning JSON rows staged | 862 |
| Chunks with warnings | 338 |
| Chunk-embedded effective warning rows | 268 |
| Warning summary `effective_dated_version_unit` | 298 |
| Warning summary `effective_dated_version_text` | 7 |
| Duplicate text groups | 201 |

## DCS Deduplication

| Metric | Count |
|---|---:|
| Staged DCS files | 232 |
| Unique DCS documents | 219 |
| DCS duplicate groups | 12 |
| Skipped duplicate paths | 13 |
| Alias paths | 13 |
| Groups missing primary path | 0 |
| Groups missing SHA-256 | 0 |

## Reconciliation Finding

The source, chunk, warning, display gate, DCS dedupe, citation alias, and page span checks are ready for the next local dry-run phase.

Target-table promotion is not yet implemented. The next blocker is mapping chunks into authority units, authority versions, authority chunks, citation aliases, and warning tables while preserving effectivity and display gates.
