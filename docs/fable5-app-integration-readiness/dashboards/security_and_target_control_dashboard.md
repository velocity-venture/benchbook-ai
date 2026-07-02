# Security and Target Control Dashboard

Date: 2026-07-02 (F5-02)

## Access posture (doc 11)

| Control | State |
|---|---|
| Raw `authority_chunks` reads from the app | PROHIBITED; no RLS policy exists and none will be added |
| Service-role in user request paths | PROHIBITED; fixture tier runs under a non-privileged user to prove it |
| Retrieval | Gate-enforcing security-definer RPCs only |
| Audit writes | Server-side with user identity; mechanics finalized in F5-03 |
| Audit reads | Per-user RLS (existing) |
| QA participants | Named accounts only, no self-signup (S1) |
| QA-mode excerpt logging | Owner flag P5, default off, purge-first |

## Target control (docs 10, 14; F5-01 doc 13 registry unchanged)

| Control | State |
|---|---|
| Environment pin | One of preview_internal_qa / local_fixture; no production value configurable |
| production_prohibited sentinel | Always-refuses; boot alert (ME-04) |
| Per-request echo check | SC-1 on mismatch |
| Persistent QA banner | SC-7 if absent |
| Boot validation | Target pin, model IDs, QA-flag default (SC-9) |
| Production registry | `benchbook-ai-prod` remains untouchable; no reads, writes, linking, or migrations |

## Scan record for this pass

Guardrail secret/body-text scans over `docs/fable5-app-integration-readiness/` and `scripts/launch_readiness/`: clean (recorded in doc 00). All package JSON artifacts checked for prohibited body-text field names: none present.

## Standing hazards tracked elsewhere

E6 rehearsal migrations db-push hazard (F5-01 O5, unchanged); migration-history ledger caveat (F5-01 doc 06); reference-metadata readability for external users (G4, revisit pre-production).
