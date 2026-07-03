# PR #4 Post-Merge Controls (F5-05)

Date: 2026-07-02. Controls that must remain in force AFTER PR #4 merges into `refactor/codex-gpt55-launch-prep` (whenever the owner approves that merge). Merging changes none of these.

## Controls that persist automatically (enforced by code and tests on every `npm test`)

1. Scenario sync: the six scenario copies stay sha256-locked to the F5-02 canon (scenario-sync.test.ts).
2. Static safety: 19 forbidden-token scans over the qa-research module graph (qa-route-static-safety.test.ts) fail the suite if anyone adds an external data client, db endpoint, elevated-role naming, vector call, external fetch, or flat-corpus import to the mock path.
3. Contract shape: builders are pinned to the F5-02 contract JSONs; drift fails CI.
4. Fixture discipline: SYNTHETIC markers and in-universe families are asserted by the fixture lint.
5. Audit content rules: the sink throws on body-text fields, passage-length strings, and unhashed queries.
6. Target control: the mock-only registries and boot validation are themselves under test (boot matrix, ME suite).

## Controls that persist by policy (people, not code)

1. Flags stay off by default everywhere; enabling the QA surface in any shared environment is an owner decision.
2. `accessCheck` stays allow-all-authenticated ONLY while the target is mock; it must be tightened in the same PR that ever adds a non-mock target (F5-05+ gate item N3).
3. Refusal template changes are data-file diffs with owner sign-off and a `.v2` key bump; the route throws on unknown keys, so silent template drift is impossible.
4. The excluded-title strings in guardrail patterns, verifier detection, and refusal tests remain refusal-detection contexts only; any diff introducing them as authorities is a stop condition (SC-11).
5. Deploy configs (`wrangler.toml`, deploy scripts) remain forbidden files; the QA env keys must never be added to a hosted configuration without a reviewed change and owner approval.

## Standing prohibitions unchanged by the merge

No live adapter, no preview/production connection, no embeddings, no display-gate change, no migration/loader/ingestion/PDF/corpus-source edits. The F5-05 live-adapter gate chain (O6 reload + re-QA, O2/O4 promotion, O7 build approval, P1/P2 signatures) is unaffected by where the mock code lives.

## Monitoring after merge

The launch-prep branch's tracking PR (#3) remains draft. Any CI or review activity on the merged code follows the launch-prep branch's existing review flow; the F5-04/F5-05 validators keep running in the standard battery.
