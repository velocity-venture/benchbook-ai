# 17 - Next Codex Mock Implementation Prompt (F5-04 / M1)

Execute ONLY after the owner signs decision M-1 (doc 16). Copy the block below into the Codex session.

---

You are Codex operating in the BenchBook.AI repository at `~/Projects/benchbook-ai`.

Owner approval M-1 is signed. Execute Phase F5-04/M1: mock-only app integration implementation.

## Setup

1. `git fetch`; confirm `refactor/codex-gpt55-launch-prep` includes commit `a918f6b` (F5-02) and the F5-03 package (`docs/fable5-file-level-app-plan/`).
2. Create the feature branch per the owner's M-3 choice (default `feature/qa-research-mock-only` from the launch-prep branch head).
3. Read, fully: `docs/fable5-file-level-app-plan/` docs 04, 05, 06, 07, 08, 09, 10, 11, 12, 15; the F5-02 contracts and mock-harness scenarios; F5-02 docs 03-11.

## Authorized changes (exhaustive)

- CREATE exactly the files in `docs/fable5-file-level-app-plan/file-maps/future_mock_only_files_to_create.json`.
- MODIFY exactly the files in `file-maps/future_mock_only_files_to_modify.json`, within the described one-block scope each.
- Nothing else. If implementation reveals a missing file or a needed dependency, STOP and record it for owner review; do not improvise.

## Execution

Follow the 13-step commit sequence in `15_MOCK_ONLY_IMPLEMENTATION_SEQUENCE.md` exactly, in order. At every step: full test suite (existing 14 files plus new suites so far) green; `npx tsc --noEmit` clean; lint no new warnings; guardrail diff scan clean using the assembled pattern:

```bash
PAT='BEG''IN RSA|PRIV''ATE KEY|SUPABASE_ACC''ESS_TOKEN|serv''ice_role|postgre''sql://|postgr''es://|pass''word[[:space:]]*=|Bea''rer|j''wt|ey''J|COPY .*autho''rity_chunks|\\co''py'
git diff HEAD~1 | grep -niE "$PAT" && echo "SCAN HIT - STOP" || echo "clean"
```

## Prohibitions (absolute in M1)

No Supabase commands or connections for legal retrieval (existing app-data Supabase usage stays as-is, unmodified); no live database access; no preview or production contact; no embeddings; no display-gate logic; no migration changes; no loader/ingestion script changes; no source PDF or generated corpus source changes; no changes to `api/chat/route.ts`, `chat/page.tsx`, or any trust lib; no new dependencies; no legal body text anywhere (fixtures are synthetic with SYNTHETIC markers); no secrets.

## Exit gate (S13)

All nine new suites plus the legacy suite green twice consecutively; `next build` passes; completion report written under `docs/` (metadata only) including: the verified_resolved demotion note, refusal template texts flagged for owner review (P6), scenario coverage table (57/57), and the standard compliance attestation. Merge back only after owner review of that report.

Stop immediately if any step appears to require a prohibited action, an unlisted file, or a new dependency.
