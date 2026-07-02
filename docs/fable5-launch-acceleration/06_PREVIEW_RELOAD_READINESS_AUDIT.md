# 06 - Preview Reload Readiness Audit

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration
Posture: planning and audit only. No reload was executed, no reload SQL was generated, and no database was contacted in this pass.

## 1. What "preview reload" means here

The retained preview corpus (6,590 chunks, batch loaded in E10B/E11) predates the E13/E14 metadata remediation. Once candidate patches are reviewed (E14C), the corrected corpus state must reach the preview database. The E14B package (doc 15) already frames the two options:

| Option | Description | Assessment |
|---|---|---|
| R1: Full reload | Roll back the retained batch using the existing `rollback_retained_batch.sql` pattern, regenerate load SQL from patched metadata via `build_preview_corpus_load_sql.py`, reload, re-run E11-style QA | **Recommended.** Deterministic, reuses proven tooling, keeps one code path, avoids in-place mutation drift |
| R2: In-place metadata patching | Apply UPDATE statements for the reviewed rows only | Not recommended for the first pass: bespoke SQL against 8,275 candidate rows, no existing tooling, higher audit burden. Reserve for tiny follow-up corrections after R1 |

## 2. Readiness checklist (state as of this pass)

| # | Precondition | Status |
|---|---|---|
| P1 | E14B candidate artifacts complete and validated | DONE |
| P2 | Corpus-admin review executed (E14C); decision columns populated; validator re-passes | NOT STARTED (owner decision O1) |
| P3 | Patch application step exists: a local script that applies approved decisions to the chunk/unit/version metadata stream before SQL generation | NOT BUILT (design exists in `docs/preview-corpus-e13/21_E14_LOCAL_REMEDIATION_DESIGN.md`; build is part of the next Codex phase, doc 16) |
| P4 | Static validation passes over the patched stream (`validate_expanded_chunks_for_load.py`), with updated expected counts | BLOCKED BY P3; runnable only on the Mac Studio |
| P5 | Local disposable dry run passes over the patched stream | BLOCKED BY P3 |
| P6 | Load SQL regenerated to /tmp (body text never in repo), batch counts reconciled against patch outcome | BLOCKED BY P3; note the builder's baked-in expected counts must be parameterized or updated to the post-patch counts |
| P7 | Target verification gate: object-verification checklist from `docs/preview-corpus-load-planning/15_PREVIEW_LOAD_VALIDATION_QUERY_CATALOG.md` re-run read-only against preview before any write | READY (procedure exists) |
| P8 | Owner written approval naming the exact action: rollback retained batch plus reload patched corpus on `clerihqbjyczarqkiqnb`, nothing else | NOT GIVEN |
| P9 | Post-reload QA: E11/E13B probe suites re-run read-only; all zero-display gates re-verified; then and only then any internal-QA display promotion per owner decision O2 | READY (procedures exist) |

## 3. The migration-history caveat (standing risk, unchanged)

The preview schema was applied in E8 via `supabase db query --linked --file`, so the Supabase migration ledger does not record it. Adopted stance (E9): treat the ledger as unreliable for preview; rely on object verification. Two rules for the reload era:

1. Never run `supabase db push` against preview or production while the E6 rehearsal migrations sit in `supabase/migrations/`. A push would attempt to apply legal_authority DDL through the default path and could interleave with app migrations unpredictably. This is blocker `migration_history_caveat` and owner decision O5 (fence the files) exists to retire it.
2. Reload uses the same `db query --file` transport as E10B, preserving one consistent (if ledger-invisible) application method, with object verification before and after.

## 4. Zero-display invariant across the reload

The reload must preserve: displayable views return 0 rows immediately after load; restricted and pending rows appear only in `v_internal_qa_restricted_chunks`; DCS production-eligible 0; TRE non-limited 0; future-effective invisible before effective date; embeddings 0. Display promotion, if the owner approves an internal-QA tier (O2), is a separate, explicitly named post-QA step, never bundled into the load transaction. The existing postflight SQL already asserts these invariants; keep that.

## 5. Stop conditions for the reload executor

Abort without writing if any of: target ref mismatch (anything other than `clerihqbjyczarqkiqnb`); object-verification drift from the E8 baseline; RLS disabled anywhere in legal_authority; any broad SELECT policy found on `authority_chunks`; static validation or dry run not green over the patched stream; owner approval document absent or not naming the exact batch; row-count reconciliation failure at any batch boundary; any tooling attempting migration repair/reset/push.

## 6. Verdict

Reload readiness is genuinely close: every procedural asset exists and has been exercised once (E10B). The two missing pieces are human review (E14C) and the patch-application script (P3), then the owner's explicit approval. Estimated technical effort for P3 plus P4-P6 rehearsal: one focused Codex session on the Mac Studio. The blocking resource is corpus-admin review time, not engineering.
