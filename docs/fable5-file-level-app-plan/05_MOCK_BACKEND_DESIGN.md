# 05 - Mock Backend Design (F5-03)

Date: 2026-07-02
Machine mirrors: the seven JSONs under `mock-backend-design/`.

## 1. Design goals

The mock backend is not a test double bolted on afterward; it is the FIRST binding of the real adapter interface. It must: use local static fixtures only; return contract-compliant retrieval/refusal/citation/audit objects; contain no legal body text, no Supabase calls, no embeddings, no web retrieval; carry environment label `MOCK_ONLY`; and refuse production targets structurally.

## 2. Interfaces the mock backend exposes (exact, answering objective question 4)

```
LegalRetrievalAdapter
  lookupCitationAlias(normalizedAlias, asOfDate) -> AliasResolution[]
  searchDisplayableChunks(queryTerms, asOfDate, familyCodes, limit) -> ChunkResult[]
  deliverSpans(chunkIds) -> GatedSpan[]           // G3 abstraction; mock returns placeholder spans
  attestGates(results) -> GateAttestation          // computed from fixture flags

ModelClient
  streamAnswer(promptPackage, onDelta) -> GenerationResult   // mock: scripted profiles

AuditLogger
  logRetrieval(entry) -> auditId                   // must resolve before streaming
  logRefusal(entry) -> refusalId
  logAnswer(entry) -> answerAuditId
  logCitationVerification(entries) -> void

EnvironmentControl
  resolveTarget() -> 'mock_only' | throws          // M1 registry has exactly one valid value
  label() -> 'MOCK_ONLY'
  assertEcho(responseTarget) -> void               // SC-1 mismatch refusal
  bootValidate() -> void                           // target, model IDs, flag defaults
```

TypeScript-level field shapes are fixed by `lib/qa-research/types.ts`, which mirrors the six F5-02 contracts; the JSON design files under `mock-backend-design/` restate each interface with field tables so Codex implements without interpretation.

## 3. Fixture design (mirror: `mock_fixture_design.json`)

- Every fixture record carries `synthetic: true` and a citation string embedding the SYNTHETIC marker (for example `T.C.A. SYN-36-101 (SYNTHETIC)`), so no fixture can be mistaken for real authority even in a screenshot.
- Families covered: all five, with per-family records for: displayable-current, restricted-block, pending-block, unknown-effectivity, future-effective, superseded, DCS reference-only, TRE limited-scope.
- Passages are placeholder sentences about fictitious subject matter, clearly non-legal, under 200 characters.
- Alias table includes phrasing variants for the GB6-style lookup tests, plus one deliberately unresolvable alias.
- Error injection switches: adapter can be constructed with `failMode` (throw on search, throw on audit, return gate-violating row) to drive MR-08/MR-09/MA-07/GG-07 scenarios.

## 4. Production blocking (structural, not conventional)

1. The adapter factory's M1 registry maps exactly one target (`mock_only`); every other value, including `preview_internal_qa` and the sentinel `production_prohibited`, throws `TargetNotAvailableError` at boot.
2. `types.ts` defines the M1 target enum WITHOUT any production member; a production string arrives only as an unknown value and fails validation.
3. The static-safety test suite asserts, by source scan of the `lib/qa-research/` module graph: no `@supabase` import, no `createClient` reference, no URL matching database schemes, no embeddings API call, no fetch to non-local hosts.
4. Boot check re-asserts at runtime; ME-04/ME-06 scenarios prove the refusal behavior.

## 5. SSE envelope produced by the mock route (unchanged contract for the real backend later)

Events: `environment` (first event, always), `delta`, `citations` (contract objects), `sources` (legacy-compatible summary), `refusal` (structured, when applicable), `confidence`, `coverage`, `done` (includes audit trace IDs). The QA page renders from these alone, so swapping the real adapter in F5-05 changes zero UI code.

## 6. What the mock backend deliberately does NOT simulate

Latency distributions, RLS behavior, concurrent-session effects, and SQL-level gate semantics: those belong to the fixture-tier (T2, local disposable Postgres) planned in F5-02 doc 12 and are out of M1 scope. M1 proves contracts and app behavior; T2 proves database behavior.
