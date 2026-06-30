# DCS Document-Anchored Mapping Plan

Date: 2026-06-29

## Queue baseline

| Item | Count |
|---|---:|
| DCS document-anchored rows | 1,146 |
| DCS total chunks | 2,014 |
| DCS guardrail/reference chunks | 2,014 |
| DCS production-eligible chunks | 0 |

## Draft artifact

`draft-remediation-artifacts/dcs_document_anchored_mapping_template.csv`

## Purpose

The mapping template records proposed document-anchored mapping decisions for DCS rows without treating DCS material as production answer authority.

## Required review

For each row, a reviewer should verify:

- Source file identity.
- Source hash.
- DCS chapter metadata.
- Policy number if available.
- Document type.
- Whether the row is document-anchored guardrail material, a map-to-policy candidate, archive material, or a production exclusion.

## DCS authority boundary

DCS remains guardrail/reference only unless a later owner-approved workflow verifies source currency, policy identity, mapping, display treatment, and answer-scope treatment.

## Stop condition

Stop if production-answer authority would be inferred from document title, filename, topic, or high-level source family alone.

## Future use

E14-B may fill this mapping template locally. E15 may plan a reload only after owner review. Any production-display treatment requires a later phase, not E14-A.
