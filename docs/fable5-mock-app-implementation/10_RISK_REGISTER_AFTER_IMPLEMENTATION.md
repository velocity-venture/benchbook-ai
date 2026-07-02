# 10 - Risk Register After Implementation (F5-04 / M1)

Date: 2026-07-02. Baseline: F5-03 doc 14 (R1-R12), reassessed post-implementation.

| # | Risk (F5-03) | Post-M1 status |
|---|---|---|
| R1 | Scope creep to a real backend | CLOSED for M1: static scans green, factory registries mock-only, diff contains no forbidden path. Residual: F5-05 must reopen deliberately under O6+O2+O7 |
| R2 | Legacy route regression via shared imports | CLOSED: only `scope-guard.ts` is imported (read-only); legacy suite green at every step; chat route untouched |
| R3 | Sidebar/nav breakage | LOW residual: single conditional block, hidden by default; visual check recommended when the flag is first enabled |
| R4 | Contract drift | MITIGATED ONGOING: contract-shape drift test pins builders to the F5-02 contract JSONs; amendment discipline unchanged |
| R5 | Scenario divergence | MITIGATED ONGOING: sha256 sync test |
| R6 | Fixtures mistaken for real authority | CLOSED: SYNTHETIC markers enforced by fixture lint; reserved fake ranges; banner/chip/footer |
| R7 | Edge-runtime incompatibility | CLOSED: `next build` passes with both new routes on edge; no new dependencies |
| R8 | Prompt drift | MITIGATED ONGOING: SYSTEM_PROMPT_VERSION + PROMPT_CONTRACT_ELEMENTS pinned; audit rows carry the version |
| R9 | Feature flag widening behavior | CLOSED: flag gates availability/visibility only; boot matrix proves off = 503 |
| R10 | Touch-point files picking up unrelated edits | CLOSED: diffs are one block / one line / doc lines respectively |
| R11 | Test runtime bloat | CLOSED: full suite ~3s (was ~2s); new suites add ~1s, no network or DB |
| R12 | Cloud-vs-Mac drift | ACCEPTED: M1 executed fully in one cloud session, committed and pushed to one branch; Mac Studio pulls the branch |

## New risks identified during implementation

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| N1 | Pre-existing typecheck errors in two legacy test files mask new type errors if teams filter tsc output | Low | Documented precisely (doc 08); fix belongs to a legacy-suite maintenance pass, out of M1 scope |
| N2 | The pipeline lives in `lib/qa-research/route-handler.ts` (D1); a future edit could add a second consumer that bypasses the route's env gating | Low | The handler itself re-runs boot validation; static scans cover the whole lib directory |
| N3 | `accessCheck` default-allow (M-2) would be wrong for any live target | Medium (future) | Explicit F5-05 gate item; single tightening point, documented in docs 01 and 11 |
| N4 | Intent classification is regex-based; unusual phrasings may misroute family filters (never past gates, worst case is a refusal) | Low | Misroutes fail toward refusal, not leakage; QA exercise (doc 11) will collect real phrasings |

## Stop conditions

None triggered during F5-04. SC-11 rule remains armed: any diff outside doc 02's file map stops future M1-scope work.
