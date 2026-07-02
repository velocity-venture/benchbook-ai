# Technical Dashboard - File-Level Plan (F5-03)

Date: 2026-07-02. Audience: implementing engineer/agent. Baseline HEAD `a918f6b`, branch `refactor/codex-gpt55-launch-prep`.

## Module graph (planned, M1)

```
api/qa-research/route.ts
  -> types.ts (schema guards, envelope types)
  -> environment.ts (bootValidate, cached verdict)
  -> guardrail.ts + guardrail-patterns.json (GP/GQ/GA)
  -> retrieval-adapter.ts (interface + factory) -> mock-retrieval-adapter.ts -> mock-fixtures.json
  -> prompt-contract.ts -> model-client.ts (factory) -> mock-model-client.ts
  -> citation-verifier.ts
  -> refusals.ts + refusal-templates.json
  -> audit-logger.ts (factory) -> mock-audit-logger.ts
(dashboard)/qa-research/page.tsx -> route via fetch; banner/chip from environment event
```

## File counts

| Bucket | Count | Map |
|---|---|---|
| New files to create | 27 entries (26 files + scenario dir) | `file-maps/future_mock_only_files_to_create.json` |
| Files to modify (all deferred to M1) | 3 | `file-maps/future_mock_only_files_to_modify.json` |
| Forbidden until live-DB phase or later | 8 categories | `file-maps/files_forbidden_until_live_db_phase.json` |
| Planned test files | 9 | `file-maps/test_file_plan.json` |

## Key seams

- `LegalRetrievalAdapter` is the ONLY authority seam; factory enum is `'mock'` in M1; adding a member is SC-11.
- Model, audit, environment all factory-injected; tests never vi.mock the qa-research modules themselves, only the Supabase auth boundary.
- RPC mirroring: `lookupAliases` mirrors `lookup_citation_alias`, `searchChunks` mirrors `search_displayable_chunks` with the 50-row clamp.

## Commit sequence (doc 15, S1-S13)

S1 types+scenario sync, S2 static safety tests, S3 environment, S4 adapter+fixtures, S5 guardrails, S6 refusals, S7 citations, S8 audit, S9 model+prompt, S10 route, S11 scenario suites, S12 page+nav+script, S13 final battery. Tests precede the code they police.

## Invariants to keep green

- `npm test` (existing 14 files) green at EVERY commit; new suites green as they land.
- `next build` passes (edge runtime, no Node-only APIs, no new dependencies).
- Static safety scans: no supabase import, no service-role naming, no db URL schemes, no embeddings, no flat-JSON corpus, no loadRelevantCorpus in the qa-research graph.
