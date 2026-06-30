# QA Signoff Artifact Plan

Date: 2026-06-29

## Queue baseline

| Item | Count |
|---|---:|
| QA-signoff-required versions | 439 |
| Current versions in QA queue | 408 |
| Future-effective versions in QA queue | 16 |
| Unknown-effectivity versions in QA queue | 15 |

## Draft artifact

`draft-remediation-artifacts/qa_signoff_decision_register_template.csv`

## Purpose

The QA signoff register records corpus-admin review decisions for high-risk or effectivity-sensitive versions. It is not a production approval record by itself.

## Required review

Each register row should record:

- Source file and source hash.
- Authority family.
- Citation, rule, section, or policy metadata.
- Version status.
- Effective-date metadata.
- Warning category.
- Reviewer identity fields.
- Decision status.
- Proposed action.
- Production impact.
- Owner escalation requirement.
- Stop condition.

## Signoff states

- Not started
- In review
- Signed off for internal QA only
- Signed off for production consideration
- Needs owner decision

## Rejection or hold states

- Rejected as non-authority
- Archived as historical or duplicate
- Held for license review
- Held for source verification
- Held for effectivity review

## Production boundary

Signoff alone must not open display gates. A later owner-approved phase must apply metadata, rerun validation, verify displayable view count, verify restricted and pending rows are excluded, and confirm retrieval gates.
