# Restricted And Pending QA Exclusion Plan

## Default rule

Restricted and pending QA rows must not be displayable or production-retrievable.

They may be loaded into preview only if a future written owner approval says they may be loaded to test gates.

## Restricted rows

| Type | Count |
|---|---:|
| Annotation candidate | 1,118 |
| Case-note candidate | 979 |
| Advisory comment | 295 |
| Total restricted | 2,392 |

Required posture:

- Stored only if approved for preview gate testing.
- Not displayable.
- Not production-retrievable.
- Not judge-facing.
- Subject to license review before any display decision.

## Pending extraction QA rows

| Category | Count |
|---|---:|
| Pending extraction QA chunks | 4,198 |

Required posture:

- Not displayable.
- Not production-retrievable.
- Not judge-facing.
- Held until extraction QA and owner approval.

## DCS rows

| Category | Count |
|---|---:|
| DCS chunks | 2,014 |
| DCS document-anchored chunks | 1,146 |
| DCS production-eligible chunks | 0 |

Required posture:

- Guardrail/reference only.
- Not policy-citation answer authority unless manually mapped and approved.
- Production eligible count must remain 0.

## TRE rows

| Category | Count |
|---|---:|
| TRE chunks | 533 |
| TRE limited-scope chunks | 533 |

Required posture:

- Limited evidentiary/procedural answer authority only.
- Guardrail/reference otherwise.
- No broad substantive juvenile or family-law expansion.

## Effectivity rows

| Category | Count |
|---|---:|
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Future-effective versions | 16 |
| Future-effective chunks | 120 |
| Versions requiring QA signoff | 439 |

Required posture:

- Unknown-effectivity rows remain QA-gated.
- Future-effective rows remain as-of-date gated.
- High-risk versions remain blocked until QA signoff.
