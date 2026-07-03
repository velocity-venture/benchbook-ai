# Technical Dashboard - Mock Internal QA (F5-05)

Date: 2026-07-02. Audience: implementing engineer/agent.

## Phase shape

No-code QA phase over `feature/qa-research-mock-only` at `c3eef92`. Everything below is documentation, review artifacts, and a validator; `git status` at commit time shows only `docs/fable5-mock-internal-qa/` and `scripts/launch_readiness/validate_f5_05_mock_internal_qa.py`.

## Re-verified baseline (executed this phase, this clone)

| Check | Result |
|---|---|
| npm test | 23 files / 226 tests green |
| npm run lint | clean |
| npx next build | pass (edge routes intact) |
| E13A/E14A/E14B validators | pass |
| F5-01/F5-02/F5-03/F5-04 validators | pass |
| F5-05 validator | pass |
| Guardrail secret scan + body-text check + em-dash check over F5-05 folder | clean |

## Where things live

| Artifact | Path |
|---|---|
| Ten phase answers + findings | 00_F5_05_MOCK_INTERNAL_QA_REPORT.md |
| Template review (machine) | refusal-template-review/*.json |
| Template revisions + sign-off block | refusal-template-review/refusal_template_recommended_revisions.md |
| Exercise matrices (6) | exercises/*.json |
| PR gate | pr-acceptance/pr4_do_not_merge_until.md |
| Blockers (machine) | manifests/remaining_blocker_manifest.json |
| F5-06 prompt block | 11_NEXT_PHASE_PROMPT.md |

## F5-06 work queue (pending owner approval; keep it this small)

1. Template `.v2` revisions per the signed table (data diff + key updates in route/tests).
2. G1: one TRJPP-family assertion in qa-route-retrieval or -citations.
3. G3: `no_support` scripted profile + one route test for `model_no_support`.
4. R4 taxonomy change ONLY if approved (touches route refusal accounting).

## Engineering notes from the QA pass

- The suites drive the REAL modules; keep it that way (no vi.mock of qa-research internals).
- Template keys are load-bearing: unknown key = throw. `.v2` bumps must update route constants and the template-key test in the same commit.
- The scenario canon is sha256-locked; scenario changes belong in F5-02's docs tree first.
- Do not "fix" the two legacy tsc errors in mock-phase sessions (G2 is owner-scheduled maintenance).
