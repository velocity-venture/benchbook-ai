# 14 - App Code Change Risk Register (F5-03)

Date: 2026-07-02
Machine mirror: `manifests/app_code_risk_manifest.json`. Risks scored for the FUTURE M1 phase; nothing changed in F5-03.

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Scope creep: M1 implementation "helpfully" wires a real Supabase binding or reads the flat-JSON corpus for realism | Medium | Critical | Structural blocks (doc 12), T8 static tests written FIRST in the commit sequence (doc 15 step ordering), prohibition list in the Codex prompt, SC-11 |
| R2 | Legacy route regression via shared imports (trust libs imported by new modules) | Low | High | New modules import-only; zero modifications to shared libs; existing 14-file suite must stay green at every commit |
| R3 | Sidebar/nav change breaks dashboard layout | Low | Low | One conditional block; component untouched otherwise; visual check in review |
| R4 | Contract drift: types.ts diverges from F5-02 contract JSONs during implementation | Medium | High | Contract-shape drift test (doc 06 section 1) in the first commit; amendment discipline (contracts change first, code second) |
| R5 | Scenario divergence: local test copies edited without updating canon | Medium | Medium | scenario-sync SHA-256 test (T1) |
| R6 | Mock fixtures accidentally resemble real authority (confusing QA participants or screenshots) | Low | Medium | SYNTHETIC marker required in every citation string; preservation test in T4; fixture design review in M1 PR |
| R7 | Edge-runtime incompatibility in new modules (Node-only API creeping in) | Medium | Medium | Edge constraints documented (doc 03 finding 5); build must pass `next build`; no new dependencies rule |
| R8 | Prompt-contract text drifts from doc 09 L3 spec during implementation | Medium | Medium | `SYSTEM_PROMPT_VERSION` constant plus a test pinning required contract elements (role boundary, corpus-only, refusal hooks, TRE/DCS clauses, as-of statement) |
| R9 | Feature flag wired to WIDEN behavior somewhere (violating C13 narrow-only) | Low | High | Flag checked only at route availability and nav visibility; a test asserts flag-off yields 404-style unavailability and flag-on changes nothing about gates |
| R10 | The two touch-point files (sidebar, package.json) picked up unrelated edits in the same commits | Medium | Low | Commit sequence isolates them (doc 15); diff review gate |
| R11 | Test suite runtime bloat slows the existing loop | Low | Low | Scenario suites are pure unit tests (no network, no DB); target under 30s added |
| R12 | Cloud-vs-Mac drift: M1 executed partly in cloud sessions could split work across environments | Medium | Medium | M1 is designated Mac-Studio-or-single-environment work in the Codex prompt; the persistence exception remains documentation-only |

## Top three to watch

R1 (scope creep to live backend), R4 (contract drift), R8 (prompt drift). All three have their enforcement written into the first two commits of the doc 15 sequence, before any feature code exists.
