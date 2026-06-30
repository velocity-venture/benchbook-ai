# Owner Approval Scope

Date: 2026-06-29
Phase: E14-A

## Approved

Owner approval covers local metadata remediation implementation planning only.

Approved local actions:

- Read repository files.
- Parse existing E13-A review queues locally.
- Create local planning docs under `docs/preview-corpus-e14/`.
- Create metadata-only draft remediation artifacts under `docs/preview-corpus-e14/draft-remediation-artifacts/`.
- Create checklists under `docs/preview-corpus-e14/checklists/`.
- Create a local-only validator under `scripts/metadata_qa/`.
- Run local static validation.
- Run the local disposable database dry run only if it creates and drops a local database and refuses non-local targets.

## Not approved

The following are outside E14-A:

- Supabase commands of any kind.
- Remote SQL or remote psql.
- Production target contact.
- Preview writes.
- Corpus row loads.
- Embedding generation.
- App connection to preview corpus data.
- App code changes.
- Migration changes.
- Existing loader script changes.
- Existing ingestion script changes.
- Source PDF changes.
- Generated corpus source file changes under `data/ingestion-expanded/`.
- Display gate changes.
- Production display.
- Staging or committing files.

## Target restriction

Do not contact production project `benchbook-ai-prod`, project ref `suiylfayvjsjtbrsjrwx`.

Do not contact preview project `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`, during E14-A because this phase is local-only.

## Scope restriction

V1 remains limited to Title 36, Title 37, TRJPP, limited-scope TRE, DCS guardrail/reference material, and optional private local juvenile rules in a later separately approved workflow.

Titles 39, 40, and 55 are not part of V1.

## Secret and body-text restriction

E14-A artifacts must not contain secrets, connection strings, privileged role references, tokens, database credentials, legal body text, chunk text, source text, page text, OCR text, full text, or long excerpts.
