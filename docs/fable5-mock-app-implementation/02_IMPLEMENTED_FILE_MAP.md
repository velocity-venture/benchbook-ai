# 02 - Implemented File Map (F5-04 / M1)

Date: 2026-07-02. Machine mirror: `manifests/implemented_file_manifest.json`.

## Created (34 app files)

### Library modules: `app/src/lib/qa-research/` (16)

| File | Role |
|---|---|
| types.ts | Types mirroring the six F5-02 contracts; M1 target enum (`mock_only` only); error classes |
| environment.ts | bootValidate / resolveTarget / label / assertEcho; production-shaped values get the always-refuse posture |
| retrieval-adapter.ts | `LegalRetrievalAdapter` interface + M1 factory (mock binding only, 50-row cap constant) |
| mock-retrieval-adapter.ts | Deterministic fixture adapter; blocked-class counts; error/echo/gate-violation injection switches |
| mock-fixtures.json | SYNTHETIC corpus metadata: 17 chunks across all 5 families (displayable, restricted, pending, unknown-effectivity, future-effective, superseded, DCS reference-only, TRE limited-scope), 5 aliases + 1 deliberate unresolvable |
| guardrail.ts | GP-1..9 / GQ-1..5 / GA-1..4 pipeline; classifyQuery intent detection; fail-closed wrapper |
| guardrail-patterns.json | Pattern data for GP-4..9 and GA-2/GA-3 classes (GP-3 reuses scope-guard unmodified) |
| refusals.ts | buildRefusalObject; template-key resolution; missing template = hard error |
| refusal-templates.json | 19 owner-reviewable refusal texts (P6) with permissible-help lists |
| citation-verifier.ts | Claim extraction (TCA/TRJPP/TRE/DCS synthetic forms), 4-level verification, granularity clamp, confidence capping |
| audit-logger.ts | `AuditLogger` interface + M1 factory (mock sink only) |
| mock-audit-logger.ts | In-memory ordered sink; REJECTS prohibited field names, passage-length strings, unhashed queries; failMode switches |
| model-client.ts | `ModelClient` interface + M1 factory (scripted mock only; no network path in the graph) |
| mock-model-client.ts | 9 scripted profiles (well_behaved, fabricates_citation, cites_adjacent_authority, cites_excluded_title, cites_subsection, recommends_ruling, leaks_restricted_marker, injection_compliant, not_called) |
| prompt-contract.ts | SYSTEM_PROMPT_VERSION, pinned contract elements, prompt package builder, sha256 helper |
| route-handler.ts | The injectable request pipeline (see deviation D1) |

### Route and page (2)

- `app/src/app/api/qa-research/route.ts` (edge; thin POST wrapper)
- `app/src/app/(dashboard)/qa-research/page.tsx` (pure SSE renderer; auth via existing layout)

### Tests: `app/src/__tests__/qa-research/` (16)

9 suites (scenario-sync, boot-checks, static-safety, retrieval, refusals, citations, guardrails, audit, environment), `support/harness.ts`, and `scenarios/` with 6 checksum-synced F5-02 canon copies.

## Modified (3, matching the F5-03 modify map)

| File | Change |
|---|---|
| app/src/components/sidebar.tsx | One conditional nav block (QA Research, hidden unless `NEXT_PUBLIC_QA_RESEARCH_ENABLED=true`) |
| app/package.json | `test:qa` script only |
| app/.env.example | Four documented QA variables, all default off |

## Deviations from the F5-03 create map (6, all recorded)

| # | Deviation | Reason |
|---|---|---|
| D1 | `lib/qa-research/route-handler.ts` added; route.ts is a thin wrapper | Next.js route modules reject non-route exports; the injectable `createQaResearchHandler` cannot live in route.ts |
| D2 | `__tests__/qa-research/support/harness.ts` added | Shared deps builder + SSE parser for the six scenario suites |
| D3 | Adapter method `getChunkMetadata` added | MC-02 verified_resolved needs a metadata-only row lookup (no span, per M-2) |
| D4 | No live model binding (`anthropic` wrapper deferred) | Keeps the qa-research graph free of any network path in M1; interface unchanged for the later binding |
| D5 | `NEXT_PUBLIC_QA_RESEARCH_ENABLED` documented | Client components cannot read server-only env; nav visibility needs the public flag; the route stays server-flag-gated |
| D6 | Relative imports instead of `@/` alias in qa-research files | The vitest setup has no alias resolution; existing suites rely on vi.doMock by module id, which these suites deliberately avoid |

## Forbidden files: all untouched

`git status` at completion shows exactly the files above. No migrations, loader scripts, ingestion scripts, source PDFs, generated corpus sources, deploy configs, trust libs, chat route/page, or Supabase libs changed.
