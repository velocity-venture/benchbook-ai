# Phase E12-B Retrieval Citation QA Report

Date: 2026-06-29
Branch: `refactor/codex-gpt55-launch-prep`
Scope: read-only preview retrieval and citation QA

## Executive result

Phase E12-B completed as a read-only verification pass against the retained preview corpus batch in Supabase preview project `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`.

No remote write command was run. No corpus rows were loaded. No embeddings were generated. No app code, migrations, loader scripts, source PDFs, or corpus source files were changed. Nothing was staged or committed.

## Retrieval and citation posture

| Check | Result |
|---|---:|
| `v_current_displayable_chunks` | 0 |
| `v_black_letter_current_chunks` | 0 |
| `v_internal_qa_restricted_chunks` | 6,590 |
| `search_displayable_chunks(...)` generic probes | 0 rows |
| `lookup_citation_alias(...)` fixed probe | 0 rows |
| `lookup_citation_alias(...)` existing-alias probe | 0 rows |
| Citation aliases | 3,598 |
| Citation alias collision groups | 0 |
| Forbidden Title 39, 40, or 55 alias metadata matches | 0 |

## Scope and safety posture

| Check | Result |
|---|---:|
| DCS chunks | 2,014 |
| DCS guardrail/reference-only chunks | 2,014 |
| DCS production-eligible chunks | 0 |
| TRE chunks | 533 |
| TRE limited-scope chunks | 533 |
| TRE non-limited-scope chunks | 0 |
| Future-effective versions | 16 |
| Unknown-effectivity versions | 15 |
| Future or unknown-effectivity displayable rows | 0 |
| QA-signoff-required versions | 439 |
| Populated embeddings | 0 |
| Broad `authority_chunks` policies | 0 |

## Recommendation

Keep the retained gated preview batch for continued read-only QA. The immediate next default should be E13-A local metadata remediation planning and implementation, or E13-B continued read-only preview retrieval/citation QA with specific query expansions. Do not move to app integration, embeddings, display-gate relaxation, or production display yet.
