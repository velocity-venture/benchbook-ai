# How to Rerun the Source Manifest Audit

The audit is fully scripted and idempotent. Rerun it any time the source
folder is synced, restored, moved (post-decision), or on the standing cadence
(before every ingestion run; after any Drive sync; weekly during development).

## Standard rerun (with hash verification)

From the repository root:

```bash
python3 scripts/source_manifest/build_source_manifest.py \
  --verify-against docs/architecture-review/APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt
```

Requires only Python 3 (standard library). The script:

1. walks `Benchbook.ai Database Files/` read-only (no file is opened for
   writing, moved, renamed, or deleted),
2. SHA-256-hashes every file,
3. classifies each file (source type + authority family, conservative rules),
4. detects anomalies (duplicate hashes, non-PDF, empty, >10 MB, unknown,
   excluded, unexpected top-level entries),
5. verifies every hash against the prior record,
6. rewrites the four outputs in `data/source-manifest/` deterministically
   (sorted by path), so `git diff` shows exactly what changed between runs.

## Reading the result

- **Exit 0** — verification `EXACT_MATCH`; outputs refreshed. A `git diff` of
  `data/source-manifest/` should show only `generated_at` timestamps unless
  the folder actually changed.
- **Exit 2 — STOP-AND-ASK.** At least one hash mismatch, addition, or
  deletion vs the prior record. Do not proceed with any downstream work;
  report the discrepancy (listed in `SOURCE_MANIFEST_SUMMARY.json` under
  `hash_verification`) to the Judge for direction.
- **Exit 3** — source folder missing or empty (wrong machine/path, or the
  folder moved without the manifest being told via `--source-root`).

## Options

| Flag | Purpose |
|---|---|
| `--source-root PATH` | Audit a different location (used once after the Judge's storage decision moves the folder, e.g. `--source-root legal-corpus/source-of-record`). |
| `--out-dir PATH` | Write outputs elsewhere (e.g., a scratch comparison run). |
| `--verify-against PATH` | shasum-style prior record (`<sha256><2 spaces><path>`; `#` comments ignored). Omit only for a deliberate first baseline. |

## After the source folder moves (future)

Once the Judge adopts a storage structure and the folder is relocated:

1. Run with `--source-root <new location>` and `--verify-against` the last
   good record — the hashes must match exactly even though paths moved.
2. Commit the refreshed `data/source-manifest/` outputs.
3. Update the default `SOURCE_ROOT_NAME` in the script in the same change.

## What never changes on rerun

`approval_status` and `corpus_designation` values are derived from
classification rules, not stored state — the builder always emits
`pending_judge_approval` / `pending_judge_designation`. Once the Judge issues
written approvals, the approval bookkeeping moves to a dedicated, versioned
decision record (Phase C design), and the builder will merge it in rather than
overwrite it. Until then, treat the Judge's written decisions as the only
authoritative approval source.
