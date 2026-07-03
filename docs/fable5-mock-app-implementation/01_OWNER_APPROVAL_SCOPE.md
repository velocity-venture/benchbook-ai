# 01 - Owner Approval Scope (F5-04 / M1)

Date: 2026-07-02

## Approvals in force

| Decision | Content | Status |
|---|---|---|
| M-1 | Mock-only implementation phase: app code changes strictly for the mock-only QA research path | GRANTED (owner prompt, 2026-07-02) |
| M-2 | M1 policy defaults ratified as a block: verified_resolved demotes (no mid-answer span fetch); participant check ships as an allow-all-authenticated hook; QA_RESEARCH_ENABLED defaults false; SYNTHETIC marker convention mandatory | GRANTED |
| M-3 | Branch: default `feature/qa-research-mock-only` | GRANTED (default taken) |

## What the approval authorizes and what was done under it

Authorized: create/modify app code only for the mock-only QA research path; tests; local mock fixtures (synthetic metadata only); mock service modules; contract validation; UI gate handling; local validators under `scripts/launch_readiness/`; docs under `docs/fable5-mock-app-implementation/`.

Done: 34 new files (16 lib modules, route, page, 10 test files, 6 scenario copies), 3 low-risk modifications (sidebar nav block, package.json script, .env.example docs), 13 docs, 5 manifests, 1 validator. Nothing else changed.

## What remains outside this approval (untouched)

Supabase connections of any kind for legal retrieval; live databases (preview and production); embeddings; display gates; migrations; loader/ingestion scripts; source PDFs; `data/ingestion-expanded/`; Titles 39/40/55 as corpus content; web retrieval; the legacy chat route/page and all trust libs; deploy configs; dependencies and lockfiles; draft PR #3 (tracking-only, not modified, not marked ready, not merged).

## How M-2 items surface in the code

1. Demotion: `citation-verifier.ts` assigns `verified_resolved` via a metadata-only adapter lookup (`getChunkMetadata`); no span fetch exists; MC-02 proves the distinct badge and capped confidence.
2. Participant check: `route-handler.ts` exposes an `accessCheck` dependency defaulting to allow (authentication itself is enforced by the existing middleware/layout); it is the single tightening point before any live target.
3. Flag default: `QA_RESEARCH_ENABLED` must be exactly `"true"`; anything else makes the route 503-unavailable (boot test matrix).
4. SYNTHETIC markers: every fixture record carries `synthetic: true` and a SYNTHETIC-marked citation string; a fixture lint test enforces it.
