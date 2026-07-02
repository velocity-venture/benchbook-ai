# DCS Deduplication Report (Phase C expansion)

**Date:** 2026-06-12. Machine-readable detail (gitignored):
`data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json`.

## Method

DCS documents are deduplicated **by SHA-256 of file bytes** before chunk
emission. Within each duplicate group the lexicographically first path is the
primary (its path appears on the chunks); all other paths are recorded as
aliases and their files are skipped with status `skipped_duplicate_sha256` in
the extraction manifest. Nothing is deleted or moved — the source folder is
untouched; deduplication affects chunk emission only.

## Results for the staged chapters (Ch09, Ch14, Ch16A, Ch16B, Ch31)

| Metric | Value |
|---|---|
| Staged DCS files selected | 232 |
| Unique documents by SHA-256 | 219 |
| Duplicate groups | 12 |
| Redundant copies skipped | 13 |

The duplicates are DCS documents cross-listed under multiple chapters of the
DCS policy table (consistent with the 24 corpus-wide groups found in Phase
A/B; 12 of those groups fall inside the staged-chapter subset). Examples:
the *Controlled Substance and Medication Work Aid* (Ch14 + Ch16B primary/alias
pair), *Work Aid 13 — DCS Cases Involving Domestic Violence* (Ch14/Ch16A/Ch31
within the staged set), and the CPS/foster-home waiver tip sheets (Ch14 +
Ch16B).

## Why this matters

Without hash-level dedup, a cross-listed work aid would be chunked 2–4×,
double- or quadruple-weighting it in retrieval relative to singly-listed
policies. With dedup, each document contributes exactly one set of chunks;
the alias paths preserve the fact that the document belongs to multiple
chapters.

## Phase D carry-forward

1. Model document↔chapter as many-to-many: the chunk's `source_path` is the
   primary; the alias paths in the JSON report supply the additional chapter
   memberships for the authority database.
2. Chunk-level near-duplicates (identical short boilerplate sections across
   *different* documents — part of the 201 duplicate-text groups) are a
   separate, finer-grained question for Phase D storage design; they were NOT
   collapsed in this phase (each remains attached to its own document).
3. When later DCS chapters are approved, rerun the pipeline — dedup
   automatically extends to new cross-chapter copies (e.g., Ch01/Ch04 pairs).
