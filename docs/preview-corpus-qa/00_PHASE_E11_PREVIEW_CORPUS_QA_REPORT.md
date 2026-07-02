# Phase E11 Preview Corpus QA Report

Date: 2026-06-28
Branch: `refactor/codex-gpt55-launch-prep`
Scope: read-only preview corpus QA and gate verification

## Executive result

Phase E11 completed as a read-only verification pass against the Supabase preview project `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`.

No remote writes were run. No corpus rows were loaded. No embeddings were generated. No app code was changed. No migrations, scripts, or source PDFs were changed. Nothing was staged or committed.

The retained E10-B preview corpus remains gated:

| Gate | Result |
|---|---:|
| `v_current_displayable_chunks` | 0 |
| `v_black_letter_current_chunks` | 0 |
| `v_internal_qa_restricted_chunks` | 6,590 |
| `search_displayable_chunks(...)` probe | 0 |
| `lookup_citation_alias(...)` probe | 0 |

## Target posture

| Check | Result |
|---|---|
| Linked project name | `benchbook-ai` |
| Linked project ref | `clerihqbjyczarqkiqnb` |
| Forbidden production target avoided | yes |
| Forbidden production project ref avoided | yes |
| Connection strings printed | no |
| Secrets printed | no |
| Substantial legal source text printed | no |

The required project-list check was run before the remote SQL group. Raw project-list output was stored under `/tmp` and was not committed.

## Key counts

| Item | Count |
|---|---:|
| Corpus builds | 1 |
| Source files | 647 |
| Source file memberships | 677 |
| Authority families | 5 |
| Authority units | 1,321 |
| Authority versions | 1,343 |
| Authority chunks | 6,590 |
| Citation aliases | 3,598 |
| Chunk warnings | 359 |
| Extraction warnings | 864 |
| Retrieval logs | 1 |
| Answer audit records | 1 |
| Citation verification records | 1 |
| Raw source manifest rows | 677 |
| Raw expanded chunks | 6,590 |
| Raw extraction warnings | 864 |
| Raw deduplication groups | 12 |

## Scope checks

| Family | Chunks |
|---|---:|
| DCS policies and procedures | 2,014 |
| T.C.A. Title 36 | 2,197 |
| T.C.A. Title 37 | 1,644 |
| Tennessee Rules of Evidence | 533 |
| Tennessee Rules of Juvenile Practice and Procedure | 202 |

No Title 39, Title 40, or Title 55 metadata matches were found in authority-unit or citation-alias metadata.

## Legal safety posture

The preview corpus is not ready for production display or app integration. Every chunk remains pending QA or restricted:

| Display status | Chunks |
|---|---:|
| `pending_extraction_qa` | 4,198 |
| `restricted_pending_license_review` | 2,392 |

DCS remains guardrail/reference-only and production-eligible zero. TRE remains limited-scope. Future-effective and unknown-effectivity rows remain gated out of display.

## Recommended owner decision

Keep the retained gated preview batch for E12-A blocker triage and E12-B read-only retrieval/citation QA. Do not connect the app, generate embeddings, relax display gates, or promote production display.
