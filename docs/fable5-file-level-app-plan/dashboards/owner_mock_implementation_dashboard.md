# Owner Dashboard - Mock Implementation Plan (F5-03)

Date: 2026-07-02. Audience: Judge M.O. Eckel III. One page; details in the numbered docs.

## Where things stand

| Item | Status |
|---|---|
| File-level plan for the QA Research surface | COMPLETE (this package) |
| App code changed in this phase | NO; zero files under `app/` touched |
| Database contacted in this phase | NO |
| Mock backend design | COMPLETE; 7 design contracts in `mock-backend-design/` |
| Test plan | COMPLETE; 57/57 F5-02 scenarios mapped plus 20 additional planned cases |
| Ready to start writing mock-only code | YES, pending your M-1 approval |

## What you are being asked to decide (doc 16)

1. **M-1 (blocking, recommended approve):** authorize the mock-only feature branch: 26 new files plus scenario copies, 3 tiny touch points, nothing else. Rollback is one directory delete plus three small reverts.
2. **M-2 (blocking, recommended ratify as a block):** four M1 policy defaults (citation demote rule, participant-check default, flag default off, SYNTHETIC marker rule).
3. **M-3 (non-blocking):** branch name preference; defaults to `feature/qa-research-mock-only`.

## What this plan guarantees

- Everything the QA page shows in M1 is SYNTHETIC and labeled MOCK ONLY; no one can mistake it for legal authority.
- The app cannot reach the preview corpus in M1: the connection type simply does not exist in the code (structural block, doc 12).
- Every answer must cite; every citation is machine-verified; anything unverifiable becomes a refusal.
- All 6 refusal kinds, the excluded titles (39/40/55), and the no-general-knowledge rule are covered by planned tests before feature code is written.

## What this plan does NOT do

No live data, no preview connection, no production anything, no migration or pipeline changes, no changes to the current chat page. O1 (corpus QA review) remains the program's critical path and is unaffected.

## If you approve M-1 today

The next session (doc 17 prompt) starts the 13-step commit sequence: safety tests first, then modules, route, page, nav. Existing tests stay green at every commit.
