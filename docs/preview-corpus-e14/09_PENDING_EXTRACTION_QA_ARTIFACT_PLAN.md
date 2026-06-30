# Pending Extraction QA Artifact Plan

Date: 2026-06-29

## Queue baseline

| Item | Count |
|---|---:|
| Pending extraction QA chunks | 4,198 |
| General answer authority rows in queue | 1,059 |
| Guardrail/reference rows in queue | 3,054 |
| Limited evidentiary procedural rows in queue | 85 |

## Draft artifact

`draft-remediation-artifacts/pending_extraction_qa_decision_register_template.csv`

## Purpose

The decision register records metadata-only extraction QA decisions without exposing legal body text in committed artifacts.

## Required review

For each row, record:

- Authority family.
- Source file and source hash.
- Chunk ID.
- Citation, rule, section, or policy metadata where present.
- Display status.
- Answer scope.
- Warning category.
- Proposed action.
- Decision status.
- Reviewer fields.
- Owner escalation requirement.
- Stop condition.

## Review order

1. Black-letter statute and TRJPP rows.
2. Effectivity-sensitive rows.
3. High-risk juvenile or family-law rows.
4. TRE limited-scope rows.
5. DCS guardrail/reference rows.
6. Historical, metadata, guide, work-aid, and support material.

## Stop condition

Stop if extraction QA requires body text in committed artifacts or if source review would need a separately approved confidential workflow.

## Future use

The register can support E14-B local review. It cannot promote any row, open any gate, or connect the app to the preview corpus.
