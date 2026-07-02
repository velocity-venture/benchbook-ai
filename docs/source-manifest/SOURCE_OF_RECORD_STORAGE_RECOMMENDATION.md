# Source-of-Record Storage Recommendation

**Date:** 2026-06-12 · **Status:** Recommendation only — nothing moves until
Judge Eckel adopts a structure in writing.

## Constraints the structure must satisfy

1. **License:** The statute and rules PDFs are LexisNexis Lexis+ exports —
   licensed content that must not be redistributed; committing them to any git
   history (including a hosted remote or git-lfs store) is a redistribution
   and retention risk. The DCS PDFs are public records (public.powerdms.com)
   but are bulky and belong out of git regardless.
2. **Integrity:** The repository must be verifiably bound to exact source
   bytes — achieved by the committed manifest (SHA-256 per file), not by
   committing the bytes.
3. **Accident resistance:** `git add .` or `git add -f` must not be able to
   quietly publish 150+ MB of licensed PDFs.
4. **Recoverability:** Loss of the local machine must not lose the source set.

## Recommended: gitignored in-repo source-of-record directory (Option A)

After the Judge's storage decision, the folder moves to:

```
legal-corpus/
  source-of-record/          # gitignored — raw PDFs live here, read-only
    Title 36/
    Title 37/
    Tenn. R. Evid..pdf
    Tenn. R. Juv. P. Rules.pdf
    DCS P&P/
data/source-manifest/        # committed — the manifest IS the repo's record
scripts/source_manifest/     # committed — rerunnable audit tooling
```

Until then the folder stays where it is (`Benchbook.ai Database Files/`,
already gitignored as of 2026-06-12).

**Layered accidental-commit protection:**
- `.gitignore`: `Benchbook.ai Database Files/` (in place) and
  `legal-corpus/source-of-record/` (in place, pre-staged for the move).
- Pre-commit hook (Phase C task): reject any staged path under either
  directory and any staged blob over 5 MB.
- CI check (Phase C task): fail if any `*.pdf` exists in the committed tree.

Defense in depth matters because `git add -f` bypasses `.gitignore`.

**Backup:** the approved Google Drive folder remains the off-machine master
copy. One additional encrypted local backup (Time Machine or disk image).
Restore procedure = re-download from Drive, then re-verify with
`build_source_manifest.py --verify-against data/source-manifest/SOURCE_MANIFEST.jsonl`-derived
hashes (or Appendix A) before use.

**Hash re-verification cadence:**
- before every ingestion run (Phase C+ hard gate),
- after any sync/restore from Drive,
- weekly during active development.

Any mismatch/addition/deletion is a stop-and-ask condition (builder exits 2).

**Read-only posture:** after the move, `chmod -R a-w legal-corpus/source-of-record/`
to make casual modification fail loudly.

## Alternatives evaluated and not recommended

**Option B — git-lfs.** Rejected. Puts licensed LexisNexis content into hosted
LFS storage (redistribution/retention question), consumes quota for ~150 MB+,
pollutes clones, and adds nothing over the manifest: LFS pointers are SHA-256
digests, which the manifest already provides without hosting the bytes.

**Option C — external read-only volume; manifest as the repo's sole record.**
Viable fallback with the strongest physical separation (files cannot enter the
repo by accident; a read-only mount blocks modification). Costs friction: the
pipeline needs a configured absolute path, the volume must be mounted for any
ingestion or verification run, and unsynchronized copies become likelier.
Choose this only if the Judge prefers the source PDFs entirely outside the
project directory; otherwise Option A with the hook + CI layers is equivalent
in safety and simpler to operate.

## Decision checklist for the Judge

- [ ] Adopt Option A (recommended) / Option C / other.
- [ ] Authorize the folder move and read-only lock (executed in a dedicated,
      verified run: move → rehash → verify → update `source_root`).
- [ ] Confirm LexisNexis license terms for local retention + backup copies.
- [ ] Confirm whether Lexis editorial annotations may appear in product output
      or must be stripped at ingestion (Phase C design input).
