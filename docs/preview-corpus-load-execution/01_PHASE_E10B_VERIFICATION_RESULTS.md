# Phase E10-B Verification Results

Date: 2026-06-28
Branch: `refactor/codex-gpt55-launch-prep`
Scope: count-only remote verification after retained preview load

No legal source text is included in this report.

## Target verification

Before each remote command, local Supabase metadata was checked:

| Check | Result |
|---|---|
| Linked project name | `benchbook-ai` |
| Linked project ref | `clerihqbjyczarqkiqnb` |
| Forbidden production project contacted | no |
| Connection strings printed | no |
| Secrets printed | no |

## Row counts

| Table | Count |
|---|---:|
| `legal_authority.corpus_builds` | 1 |
| `legal_authority.source_files` | 647 |
| `legal_authority.source_file_memberships` | 677 |
| `legal_authority.authority_units` | 1,321 |
| `legal_authority.authority_versions` | 1,343 |
| `legal_authority.authority_chunks` | 6,590 |
| `legal_authority.citation_aliases` | 3,598 |
| `legal_authority.chunk_warnings` | 359 |
| `legal_authority.extraction_warnings` | 864 |
| `legal_authority.retrieval_logs` | 1 |
| `legal_authority.answer_audit_records` | 1 |
| `legal_authority.citation_verification_records` | 1 |
| `legal_authority_stage.raw_source_manifest` | 677 |
| `legal_authority_stage.raw_expanded_chunks` | 6,590 |
| `legal_authority_stage.raw_extraction_warnings` | 864 |
| `legal_authority_stage.raw_deduplication_groups` | 12 |

## Display and retrieval gates

| Gate | Count |
|---|---:|
| Displayable view | 0 |
| Black-letter current view | 0 |
| Internal QA restricted view | 6,590 |
| Pending or restricted rows in displayable view | 0 |
| Search displayable chunks result count | 0 |
| Production citation lookup result count | 0 |

## Display status

| Status | Chunks |
|---|---:|
| `pending_extraction_qa` | 4,198 |
| `restricted_pending_license_review` | 2,392 |

## Answer scope

| Scope | Chunks |
|---|---:|
| `general_answer_authority` | 1,059 |
| `guardrail_reference_only` | 3,054 |
| `limited_evidentiary_procedural` | 533 |
| `not_answer_authority` | 1,944 |

## DCS and TRE scope checks

| Check | Count |
|---|---:|
| DCS chunks | 2,014 |
| DCS guardrail/reference-only chunks | 2,014 |
| DCS production-eligible chunks | 0 |
| TRE limited-scope chunks | 533 |
| TRE non-limited-scope chunks | 0 |

## Effectivity gates

| Check | Count |
|---|---:|
| Current versions | 1,312 |
| Future-effective versions | 16 |
| Unknown-effectivity versions | 15 |
| Future or unknown-effectivity rows in displayable view | 0 |
| QA signoff required versions | 439 |

## Integrity and privacy checks

| Check | Count |
|---|---:|
| Duplicate source chunk ID groups | 0 |
| Citation alias collision groups | 0 |
| Answer text columns on answer audit records | 0 |
| RLS-enabled legal authority and stage tables | 20 |
| Broad `authority_chunks` policies | 0 |
| Embedding column present | 1 |
| Populated embeddings | 0 |

## App integration check

Repository scan found no app code path using:

- `legal_authority`
- `authority_chunks`
- `v_current_displayable_chunks`
- `search_displayable_chunks`
- `lookup_citation_alias`

The preview corpus is loaded in the database only. The app was not connected to it.
