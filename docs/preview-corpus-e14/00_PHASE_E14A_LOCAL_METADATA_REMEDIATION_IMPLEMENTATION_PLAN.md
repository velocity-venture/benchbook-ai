# Phase E14-A Local Metadata Remediation Implementation Plan

Date: 2026-06-29
Branch: `refactor/codex-gpt55-launch-prep`
Scope: local-only metadata remediation implementation planning

## Executive result

Phase E14-A is a planning and artifact-design phase only. It does not approve remote writes, corpus reloads, embeddings, app integration, production display, display-gate changes, source PDF changes, migrations, existing loader edits, or existing ingestion edits.

The E13-A and E13-B baseline remains controlling for corpus safety:

| Gate | Current posture |
|---|---|
| Displayable rows | 0 |
| Black-letter displayable rows | 0 |
| Preview production search results | 0 |
| Citation alias production lookup results | 0 |
| Embeddings | 0 populated |
| DCS rows | Guardrail/reference only |
| TRE rows | Limited-scope only |
| Restricted Lexis rows | Internal QA only |
| Unknown and future effectivity rows | Gated |

## E14-A objectives

1. Convert E13-A queue structure into implementation-ready, metadata-only draft remediation artifacts.
2. Preserve the closed-universe V1 scope: Title 36, Title 37, TRJPP, limited-scope TRE, DCS guardrail/reference material, and optional private local rules in a later separately approved workflow.
3. Preserve zero-display posture until a later owner-approved reload and gate-verification phase.
4. Define local validation that catches body-text leakage, secret-shaped values, unsafe write targets, and incomplete reviewer decision fields.
5. Give the owner a clean decision packet for E14-B or E15.

## Local artifact set

Phase E14-A creates these artifact classes:

| Artifact class | Directory | Purpose |
|---|---|---|
| Planning docs | `docs/preview-corpus-e14/` | Define implementation boundaries and decisions needed |
| Draft patch maps and registers | `docs/preview-corpus-e14/draft-remediation-artifacts/` | Metadata-only templates for future corpus-admin work |
| Checklists | `docs/preview-corpus-e14/checklists/` | Human review gates before any later reload |
| Validator | `scripts/metadata_qa/validate_e14a_draft_artifacts.py` | Local-only structural validation |

## Non-execution boundary

The files in this package are not active remediation. They do not change row status, source data, migrations, app behavior, retrieval behavior, citation lookup behavior, answer generation, embeddings, or display eligibility.

## Stop conditions

Stop before any next phase if any of these conditions appear:

- A proposed artifact requires legal body text, page text, OCR text, chunk text, source text, or long excerpts.
- A decision cannot be made from metadata without an approved corpus-admin source-review workflow.
- A row would be made displayable, searchable, embedded, or production eligible without separate owner approval.
- DCS material would be treated as production answer authority before document mapping and owner approval.
- Restricted Lexis material would be displayed, cited, or used as answer authority before license and owner approval.
- Unknown-effectivity or future-effective rows would be exposed before effective-date verification.
- Any command would contact Supabase, production, preview, or another remote database.

## Recommended next step

Proceed to E14-B only after owner approval. E14-B should remain local-only and should fill patch-map and decision-register rows from the E13-A queues without applying them to a database, app, loader, ingestion script, migration, source PDF, or generated corpus source file.
