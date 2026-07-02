# Unresolved Identity Patch Map Plan

Date: 2026-06-29

## Queue baseline

| Queue | Rows |
|---|---:|
| Unresolved identity units | 17 |
| Unresolved identity chunks | 21 |
| DCS unresolved chunks | 20 |
| TRE unresolved chunks | 1 |

## Draft artifact

`draft-remediation-artifacts/unresolved_identity_patch_map_template.csv`

## Purpose

The patch map records proposed metadata decisions for rows that cannot currently identify a reliable authority unit from metadata alone.

## Required review

For each row, a corpus administrator must verify:

- Source file identity.
- Source hash.
- Authority family.
- Document type.
- Current display status.
- Current answer scope.
- Warning category.
- Whether a proposed authority identity can be supported by metadata alone.

## DCS rule

DCS unresolved rows must remain guardrail/reference only. They may be proposed as document-anchored guardrail rows, map-to-policy candidates, archive candidates, or production exclusions. They must not become production answer authority in E14-A or E14-B.

## TRE rule

The TRE unresolved row must remain limited-scope and restricted unless a later owner and license review approves a different treatment.

## Stop condition

Stop if identity resolution requires legal body text, source text, page text, OCR text, long excerpts, or inference from filename alone.

## Future use

If owner-approved in E14-B, this template can be filled from E13-A queue rows. It should still remain a draft local patch map until a later approved phase applies it and reruns gates.
