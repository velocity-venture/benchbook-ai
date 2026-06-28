# Preview Load Table Dependency Map

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E9 planning only

No remote command was run for this dependency map. Counts below come from local metadata-only validation and a local disposable database dry run.

## Schema objects expected before any load

The E8 preview schema baseline established these object families:

| Object family | Expected baseline |
|---|---:|
| Schemas | `legal_authority`, `legal_authority_stage` |
| Enum types | 7 |
| Base tables | 20 |
| Views | 3 |
| Functions | 3 |
| RLS-enabled tables | 20 |
| Policies | 8 |

The loader must not apply migrations during E10. E10 should only proceed after schema presence is independently verified.

## Load order

| Step | Table or view | Purpose | Dependency | Expected E10 row count from local proof | Gate requirement |
|---:|---|---|---|---:|---|
| 0 | schemas, types, extensions, policies | E8 schema foundation | E8 schema-only execution | already present | no E10 migration action |
| 1 | `legal_authority.authority_families` | fixed V1 family registry | schema and seed rows | 5 | V1 family set only |
| 2 | `legal_authority_stage.raw_source_manifest` | raw source metadata staging | schema | 677 | metadata-only logs |
| 3 | `legal_authority_stage.raw_expanded_chunks` | raw chunk metadata staging | schema | 6,590 | no source text in docs or logs |
| 4 | `legal_authority_stage.raw_extraction_warnings` | extraction warning staging | schema | 864 | warning metadata only |
| 5 | `legal_authority_stage.raw_deduplication_groups` | duplicate-group metadata staging | schema | 12 | no display effect |
| 6 | `legal_authority.corpus_builds` | load batch and corpus-build record | staged source rows | 1 | preview dry-run label |
| 7 | `legal_authority.source_files` | unique source file records | staged manifest | 647 | no public display |
| 8 | `legal_authority.source_file_memberships` | source path membership records | `source_files`, staged manifest | 677 | preserves alias paths |
| 9 | `legal_authority.authority_units` | logical statutes, rules, policies, and document anchors | staged chunks, `authority_families` | 1,321 | unresolved units remain gated |
| 10 | `legal_authority.authority_versions` | current, future-effective, and unknown-effectivity versions | `authority_units` | 1,343 | future and unknown gates enforced |
| 11 | `legal_authority.authority_chunks` | chunk records used for retrieval testing | `authority_versions`, source records | 6,590 | all remain non-displayable in preview |
| 12 | `legal_authority.citation_aliases` | citation lookup aliases | `authority_units`, chunks | 3,598 | production lookup returns zero displayable chunks |
| 13 | `legal_authority.chunk_warnings` | warning metadata tied to chunks | `authority_chunks` | 359 | warning renders must not imply verification |
| 14 | `legal_authority.extraction_warnings` | global extraction warnings | staged warnings, source records | 864 | warning renders must remain internal |
| 15 | `legal_authority.chunk_relationships` | optional relationships | chunks | 0 in current proof | no blocker if empty |
| 16 | `legal_authority.retrieval_logs` | audit-path smoke test | auth context or test user context | 1 in local proof | no source text in logs |
| 17 | `legal_authority.answer_audit_records` | answer audit smoke test | retrieval log | 1 in local proof | no answer text stored |
| 18 | `legal_authority.citation_verification_records` | citation audit smoke test | answer audit record, chunk refs | 1 in local proof | citation verification remains auditable |
| 19 | `legal_authority.refusal_records` | refusal audit smoke test | auth context or test user context | 0 in local proof | optional for E10 |

## View expectations after a zero-display E10 dry run

| View | Expected E10 result | Why it matters |
|---|---:|---|
| `legal_authority.v_current_displayable_chunks` | 0 | proves no preview-loaded chunk is production-displayable |
| `legal_authority.v_black_letter_current_chunks` | 0 | proves no black-letter display was opened |
| `legal_authority.v_internal_qa_restricted_chunks` | 6,590 | proves rows are present for internal QA but remain gated |

## Key reconciliation expectations

| Reconciliation item | Expected value |
|---|---:|
| Duplicate source chunk ID groups | 0 |
| Duplicate source chunk rows | 0 |
| Missing source chunk count | 0 |
| Citation alias collision groups | 0 |
| Alias candidates suppressed by collision | 0 |
| Unresolved units | 17 |
| Unresolved chunks | 21 |
| Document-anchored units | 130 |
| Document-anchored chunks | 1,146 |

## Scope expectations

| Scope check | Expected value |
|---|---:|
| V1 authority families | 5 |
| DCS chunks | 2,014 |
| Title 36 chunks | 2,197 |
| Title 37 chunks | 1,644 |
| TRE chunks | 533 |
| TRJPP chunks | 202 |
| Titles 39, 40, and 55 loaded | 0 |
| Web retrieval rows or configuration | 0 |
| Embeddings generated | 0 |

## E9 conclusion

The dependency map supports a future E10 preview load only if the schema baseline is verified first and every promoted row remains behind internal QA or restricted gates. The table order is well understood locally. The unresolved risk is not mapping, but target safety, remote rollback, and preserving zero-display behavior after remote insertion.
