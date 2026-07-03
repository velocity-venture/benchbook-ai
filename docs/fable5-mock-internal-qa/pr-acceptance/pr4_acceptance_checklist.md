# PR #4 Acceptance Checklist (F5-05)

Date: 2026-07-02. PR: `feature/qa-research-mock-only` into `refactor/codex-gpt55-launch-prep`, draft, MOCK ONLY.
Classification: **Ready for owner review and technical review. NOT ready for merge.**

## Technical acceptance (verified in F5-05, all green)

- [x] Full test suite 226/226 (14 legacy + 9 new files), re-verified at F5-05 start on HEAD `c3eef92`
- [x] All 57 F5-02 scenarios executed through the real route pipeline
- [x] `next build` passes with both new routes on the edge runtime
- [x] `next lint` clean
- [x] `tsc --noEmit` clean for all F5-04 files (2 pre-existing legacy test errors documented, out of scope)
- [x] F5-04 and F5-05 validators pass; all prior phase validators pass
- [x] Diff confined to the documented file map (34 created + 3 touch points + docs/validators); no forbidden path touched
- [x] Static safety scans green: no external data client import, no db endpoint, no elevated-role naming, no vector calls, no external fetch, no flat-corpus import in the mock graph
- [x] Every fixture SYNTHETIC-marked; no legal body text anywhere in the diff
- [x] Audit sink structurally rejects body-text fields, passage-length strings, unhashed queries
- [x] MOCK_ONLY disclosure at event, transport, and page layers
- [x] Golden-query exercise: 19/20 categories PASS, 1 PASS_WITH_GAP (G1, assertion-only gap)

## Owner acceptance (pending; the merge gate)

- [ ] Refusal-template review signed (21 templates: 15 accept, 4 adopt-with-revision R1-R4, 2 owner decisions O1-O2)
- [ ] `verified_resolved` demotion behavior acknowledged as implemented (M-2 item 1, demonstrated by MC-02)
- [ ] Branch policy decision: merge PR #4 into the launch-prep branch now vs hold until F5-06 applies approved template revisions
- [ ] Known gaps accepted or scheduled (G1 TRJPP assertion, G2 legacy tsc cleanup, G3 model_no_support demonstration)

## Merge mechanics when (and only when) the owner approves

Squash-or-merge choice belongs to the owner; PR #4 targets the launch-prep branch, NOT main; PR #3 remains the tracking draft for the launch-prep branch and is unaffected by this checklist.
