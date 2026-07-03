# 09 - PR #4 Merge Blockers and Program Deferrals (F5-05)

Date: 2026-07-02
Machine mirror: `manifests/remaining_blocker_manifest.json`. Answers phase question 9.

## Blockers ON PR #4 itself (owner-resolvable now)

| # | Blocker | Owner action |
|---|---|---|
| B1 | Refusal-template owner review pending (P6) | Complete the sign-off block (R1-R4, O1-O2, 15 accepts) |
| B2 | PR #4 merge/branch policy pending | Choose hold-until-F5-06 (recommended) / merge-now / long-running |

## Deferrals attached to F5-06 (small, mock-only)

| # | Item | Nature |
|---|---|---|
| G1 | Explicit TRJPP-family success assertion | test-only addition |
| G3 | model_no_support scripted profile + test, then template sign-off | test + mock-profile addition |
| R1-R4 | Approved template wording revisions (`.v2` keys) | data-file diff |
| O1 | future_effective help-key resolution | data-file diff or UI addition per owner choice |

## Program blockers NOT resolvable by PR #4 (unchanged by anything in this branch)

| # | Blocker | Status |
|---|---|---|
| P1 | O1/E14-C corpus-admin review (simulation and then real review) still outstanding | THE program critical path; independent of the app track |
| P2 | Live adapter design | BLOCKED behind O6 (reload executed + re-QAed), O2/O4 (tier promotion), O7 (build approval), P1/P2 contract signatures |
| P3 | Preview reload (E15-A) | BLOCKED behind E14-C completion and owner approval; never run from app-track sessions |
| P4 | Embeddings generation | BLOCKED; separate owner approval; not proposed |
| P5 | Display gates | CLOSED (0 displayable rows); no app-track work touches them |
| P6 | Production | UNTOUCHED; enabling display is a distinct launch approval that does not exist yet |
| P7 | Legacy TypeScript test cleanup (G2: 2 pre-existing errors) | Maintenance pass, owner-scheduled; deliberately NOT bundled into mock-phase work |

## Reading the two lists together

PR #4's own gate is small and entirely in the owner's hands (B1+B2). The program-level list is what still stands between the mock surface and any live-data behavior; merging PR #4 moves none of those lines, which is exactly why merging it (after B1/B2) is safe.
