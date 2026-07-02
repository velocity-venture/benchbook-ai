# 16 - Owner Decision Packet (F5-03)

Date: 2026-07-02
For: Judge M.O. Eckel III
Machine mirror: `manifests/owner_decision_manifest.json`. Prior packets stand: F5-01 (O1-O8; O1 still the most time-critical), F5-02 (P1-P6).

## M-1. Approve the mock-only implementation phase (F5-04/M1) (RECOMMENDED: approve)

What it authorizes: app code changes STRICTLY per this package: 26 new files (route, page, 15 lib modules, 9 test files plus scenario copies), 3 low-risk touch points (sidebar nav block, optional package.json script, .env.example documentation), on feature branch `feature/qa-research-mock-only`, following the 13-step sequence of doc 15. Mock backend only; no Supabase for legal retrieval; no live data; synthetic fixtures with SYNTHETIC markers; all six contracts proven by 57 scenarios plus static-safety tests.
What it does NOT authorize: any live database binding, preview or production contact, embeddings, display-gate changes, migration/loader/ingestion/PDF changes, legacy route or chat page changes, new dependencies.
Rollback: delete one directory plus revert three one-line-scale edits.

## M-2. Ratify the M1 policy defaults (RECOMMENDED: ratify as a block)

1. verified_resolved citations DEMOTE in M1 (no mid-answer span fetch); F5-05 revisits (doc 08 section 1.2).
2. QA-page participant check ships as a hook with allow-all-authenticated default in M1 (synthetic data), tightened before any live target (doc 13 section 2).
3. Feature flag `QA_RESEARCH_ENABLED` defaults false; enabling it in a dev environment is at your discretion.
4. Fixture SYNTHETIC marker convention (doc 05 section 3) is mandatory.

## M-3. Branch preference (DEFAULT: feature branch)

Default is `feature/qa-research-mock-only`. If you prefer M1 directly on `refactor/codex-gpt55-launch-prep`, say so in the approval note; the sequence is identical either way.

## Reminders (no action)

Refusal template texts arrive for your review inside the M1 PR (P6). The F5-02 packet's P1/P2 signatures, if not yet given, should accompany M-1 (M1 implements those contracts). O1 (E14C corpus review) remains the program's critical path and is independent of M1.

## The one decision from this packet

M-1 (with M-2 ratified as a block). It is the last approval needed to start writing mock-only code.
