# Restricted Lexis Disposition Artifact Plan

Date: 2026-06-29

## Queue baseline

| Item | Count |
|---|---:|
| Restricted Lexis rows | 2,392 |
| Restricted pending license review rows | 2,392 |

## Draft artifact

`draft-remediation-artifacts/restricted_lexis_disposition_register_template.csv`

## Purpose

The disposition register records metadata-only treatment for annotations, case notes, advisory comments, and editorial material that must remain internal QA only unless license and owner approval separately change that status.

## Required review

For each row, record:

- Restricted category.
- Authority family.
- Source file and source hash.
- Citation or rule metadata.
- Display status.
- Answer scope.
- Proposed disposition.
- License-review status in notes if applicable.
- Owner escalation flag.

## Required disposition defaults

- Internal QA only.
- No production display.
- No source-card display.
- No answer-authority use.
- No independent case-law verification.

## Stop condition

Stop if a row would be shown to users, used as citation support, or used as answer authority without separate license and owner approval.

## Future use

E14-B may fill this register locally to classify restricted rows. It must not apply those classifications to display, retrieval, embeddings, or app behavior.
