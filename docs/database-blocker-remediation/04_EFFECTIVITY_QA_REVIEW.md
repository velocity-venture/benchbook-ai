# Effectivity QA Review

## E3 issue

Phase E3 found 48 chunks and 18 versions with unknown effectivity.

Some labels used `Effective July 1, 2026` without the word `on`, so the E3 parser did not classify them as future-effective.

## Fix implemented

The local loader now recognizes:

- `Effective until ...`
- `Effective on ...`
- `Effective July 1, 2026`

The loader does not infer dates from outside knowledge. Contingency-based labels remain `unknown_effectivity`.

## E4 partition results

Chunk-level:

- Current chunks: 6,431
- Future-effective chunks: 120
- Unknown-effectivity chunks: 39

Version-level:

- Current versions: 1,312
- Future-effective versions: 16
- Unknown-effectivity versions: 15

## As-of tests

- Future versions visible before July 1, 2026: 0
- Current versions with future end date: 13
- Versions requiring QA signoff: 439

## Result

Date-labeled future text is partitioned more accurately, and unknown-effectivity material remains isolated for QA.
