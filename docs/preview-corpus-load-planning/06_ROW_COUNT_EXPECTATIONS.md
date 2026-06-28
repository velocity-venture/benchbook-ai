# Row Count Expectations

These are expectations for a future E10 if, and only if, Judge Eckel separately approves preview corpus-row loading.

## Before-load baseline

E8 verified:

| Table or view | Expected before E10 load |
|---|---:|
| `legal_authority.source_files` | 0 |
| `legal_authority.authority_units` | 0 |
| `legal_authority.authority_versions` | 0 |
| `legal_authority.authority_chunks` | 0 |
| `legal_authority.v_current_displayable_chunks` | 0 |
| `legal_authority.v_black_letter_current_chunks` | 0 |
| `legal_authority.v_internal_qa_restricted_chunks` | 0 |

## Expected staged counts if load is approved

| Staging input | Expected count |
|---|---:|
| `raw_source_manifest` | 677 |
| `raw_expanded_chunks` | 6,590 |
| `raw_extraction_warnings` | 864 |
| `raw_deduplication_groups` | 12 |

## Expected target counts if load is approved

| Target output | Expected count |
|---|---:|
| `source_files` | 647 |
| `source_file_memberships` | 677 |
| `authority_units` | 1,321 |
| `authority_versions` | 1,343 |
| `authority_chunks` | 6,590 |
| `citation_aliases` | 3,598 |
| `chunk_warnings` | 359 |
| `extraction_warnings` | 864 |

## Expected family and scope counts

| Category | Expected count |
|---|---:|
| DCS chunks | 2,014 |
| TRE chunks | 533 |
| TRE limited-scope chunks | 533 |
| DCS production-eligible chunks | 0 |
| Current displayable rows | 0 unless separately approved |

## Expected blocker counts carried forward

| Blocker | Expected count |
|---|---:|
| Unresolved authority units | 17 |
| Unresolved chunks | 21 |
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Versions requiring QA signoff | 439 |
| DCS document-anchored chunks | 1,146 |
| Restricted Lexis annotation, case-note, and advisory chunks | 2,392 |
| Pending extraction QA chunks | 4,198 |

## Count mismatch rule

E10 must stop and document a blocker if material counts differ from expected counts, unless the difference is explained by an approved updated corpus build.
