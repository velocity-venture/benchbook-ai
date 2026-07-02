# DCS Document-Anchored Review Plan

Date: 2026-06-28

## Summary

| Item | Count |
|---|---:|
| DCS chunks | 2,014 |
| DCS document-anchored chunks | 1,146 |
| DCS guardrail/reference-only chunks | 2,014 |
| DCS production-eligible chunks | 0 |

## Document types

| Document type | Chunks |
|---|---:|
| `manual` | 367 |
| `protocol` | 367 |
| `guide` | 194 |
| `n_a` | 103 |
| `work_aid` | 60 |
| `handbook` | 30 |
| `faq` | 14 |
| `tip_sheet` | 7 |
| `guidelines` | 4 |

## Recommendation

DCS document-anchored rows should remain guardrail/reference only by default. Do not treat them as policy-citation answer authority unless a corpus administrator manually maps a row to a reliable DCS policy identity and the owner separately approves that treatment.

## Review paths

| Path | When to use | Disposition |
|---|---|---|
| Keep guardrail/reference only | Source is useful background but lacks policy-citation identity | Adopt with revision |
| Manually map to policy identity | Source metadata proves a policy number, chapter, and current status | Needs further review |
| Exclude from future production eligibility | Source is a flyer, aid, attachment, or non-authority artifact | Archive or reject |
| Hold pending source verification | Source identity, currency, or document type is unclear | Needs further review |

## Stop conditions

Stop any DCS promotion path if:

- the row lacks reliable policy identity;
- source currency cannot be verified;
- the row would become production-answer authority by inference alone;
- the row would become displayable without owner approval;
- DCS production-eligible count would become greater than zero without a separate approved phase.
