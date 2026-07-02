# Remaining QA Blockers

These items block preview and production use. They do not block owner review of a local-only Phase E6 migration rehearsal.

## Production blockers

| Blocker | Count or status | Required action |
|---|---:|---|
| Unresolved authority units | 17 | Corpus administrator review and mapping, exclusion, or waiver. |
| Unresolved chunks | 21 | Corpus administrator review and mapping, exclusion, or waiver. |
| Unknown-effectivity versions | 15 | Legal QA review before any production eligibility. |
| Unknown-effectivity chunks | 39 | Legal QA review before any production eligibility. |
| Versions requiring QA signoff | 439 | Judge or delegated corpus administrator signoff. |
| DCS document-anchored units | 130 | Confirm guardrail-only role or manually map. |
| DCS document-anchored chunks | 1,146 | Keep non-displayable unless owner changes corpus policy. |
| Restricted Lexis annotation, case-note, and advisory chunks | 2,392 | Keep excluded from production retrieval and display absent written approval. |
| Pending extraction QA chunks | 4,198 | Keep non-displayable until extraction QA is complete. |
| Encrypted or OCR-blocked DCS handbook | 1 historical skipped item | Reconcile E2 historical blocker with current E5 metadata before preview. |

## Unresolved identity detail

Target promotion reduced identity uncertainty to:

| Category | Count |
|---|---:|
| Unresolved units | 17 |
| Unresolved chunks | 21 |
| DCS unresolved chunks | 20 |
| TRE unresolved chunks | 1 |
| Unresolved metadata chunks | 9 |
| Unresolved unknown chunks | 11 |
| Unresolved annotation candidate chunks | 1 |

Static validation still shows 81 non-metadata chunks without citation, section, rule, or policy identity inputs. It also shows 292 DCS policy or protocol chunks without policy identity metadata. The loader now isolates many of those DCS rows as document-anchored, which is safer than inventing policy citations, but not the same as production-ready identity.

## Effectivity blockers

| Effectivity item | Count |
|---|---:|
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Versions requiring QA signoff | 439 |
| Future-effective versions | 16 |
| Future-effective chunks | 120 |
| Future-effective versions visible before 2026-07-01 | 0 |

Unknown-effectivity rows should be excluded from production eligibility until reviewed. Future-effective rows should remain gated by as-of date.

## Display and retrieval blockers

All 6,590 chunks remain internal QA only for this phase:

| Display status | Count |
|---|---:|
| Pending extraction QA | 4,198 |
| Restricted pending license review | 2,392 |
| Production displayable | 0 |

No owner or corpus administrator decision has opened a production display gate.

## Historical OCR blocker reconciliation

Earlier E2 documentation identified an encrypted or OCR-blocked DCS handbook as skipped for first load. Current E5 expanded metadata reports:

- `sources_failed_or_ocr_count`: 0.
- Several DCS handbook-named PDFs extracted.

This should not be treated as silently resolved. Before preview or production, corpus administration should record whether the historical item was later extracted, was outside the selected E4 corpus set, or remains deferred.
