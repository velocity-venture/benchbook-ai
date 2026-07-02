# BenchBook.AI Mac Studio Restart Bookmark

Created UTC: 2026-06-19T20:51:50Z
Created local: 2026-06-19 15:51:50 CDT
Repo: /Users/m3_ai_factory/Projects/benchbook-ai
Branch: refactor/codex-gpt55-launch-prep
HEAD before bookmark commit: ce53b01 Add Phase E5 migration readiness package

## Resume point

Phase E5 owner-review migration readiness package has been completed and committed before this restart bookmark.

Current phase state:

- Phase A/B: source manifest and hash audit complete.
- Phase C: pilot and expanded ingestion complete.
- Phase D: legal authority database design complete.
- Phase E1: database implementation plan complete.
- Phase E2: local disposable database staging dry run complete.
- Phase E3: local target-table promotion dry run complete.
- Phase E4: local blocker remediation complete.
- Phase E5: docs-only owner-review migration readiness package complete.

Latest known key results:

- Expanded chunks: 6,590.
- Duplicate chunk IDs: 0.
- Citation alias collisions: 0.
- Production displayable chunks: 0.
- DCS production-eligible chunks: 0.
- TRE limited-scope chunks: 533 of 533.
- Future-effective versions visible before 2026-07-01: 0.
- Audit reconstruction join count: 1.

Remaining blockers:

- 17 unresolved authority units.
- 21 unresolved chunks.
- 15 unknown-effectivity versions.
- 39 unknown-effectivity chunks.
- 439 versions requiring QA signoff.
- 1,146 DCS document-anchored chunks.
- 2,392 restricted Lexis annotation, case-note, and advisory chunks.
- 4,198 pending extraction QA chunks.
- 1 historical encrypted/OCR-blocked DCS handbook item requiring reconciliation.

Default guardrail status:

- No preview Supabase connection.
- No production Supabase connection.
- No embeddings.
- No app integration.
- No production corpus replacement.
- No real migration promotion unless separately approved in writing.
- All production display and retrieval gates remain closed by default.

Next intended phase:

Phase E6 should be local-only real-migration rehearsal, but only after explicit owner approval. E6 may copy draft migrations into real local supabase/migrations/ for rehearsal only if approved. E6 must still prohibit remote Supabase, embeddings, app integration, and production corpus replacement.

## Resume command after reboot

```bash
cd /Users/m3_ai_factory/Projects/benchbook-ai && git status --short && git log --oneline -10 && sed -n '1,220p' docs/session-bookmarks/2026-06-19-mac-studio-restart-benchbook-ai.md
```

## Recent commits before bookmark commit
ce53b01 Add Phase E5 migration readiness package
acbca6a Add Phase E4 blocker remediation dry run
c0bb636 Add Phase E3 target promotion dry run
cb5eef1 Add Phase E2 local database dry-run package
ba2c22f Add Phase E1 database implementation plan
ef2778b Add Phase D legal authority database design
c9634ba Add Phase C expanded ingestion pipeline
452bc4e Add Phase C ingestion pilot pipeline
f090e7c Add historical test coverage audit
8b945ce Harden excluded-title citation and scope guards
9c2e518 Add source manifest audit and architecture review
e3bc1bb fix: handle unavailable corpus data

## Git status before bookmark file creation
clean
