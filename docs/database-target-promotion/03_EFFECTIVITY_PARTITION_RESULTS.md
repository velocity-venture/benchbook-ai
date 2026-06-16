# Effectivity Partition Results

## Chunk-level partition input

- Current chunks: 6,428
- Future-effective chunks: 111
- Unknown-effectivity chunks: 48

## Version-level partition output

- Current versions: 1,438
- Future-effective versions: 13
- Unknown-effectivity versions: 18

## As-of gate checks

- Current versions with a future end date: 13
- Future versions: 13
- Future versions visible before July 1, 2026: 0
- Versions requiring QA signoff: 565

## Design result

The loader separates current, future-effective, and unknown-effectivity versions. It does not treat future-effective material as current before July 1, 2026.

## Remaining risk

Unknown-effectivity rows remain a QA blocker. The loader keeps them out of confident production eligibility by marking those versions `unknown_effectivity` and requiring QA signoff.
