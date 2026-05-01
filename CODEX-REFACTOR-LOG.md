# BenchBook.AI Refactor Log

Date: 2026-04-30
Branch: `refactor/codex-gpt55-launch-prep`

## What Changed

- Wrote `CODEX-ASSESSMENT.md` before implementation, using `CODEX-SOURCE-OF-TRUTH.md` as the controlling product brief.
- Wired `corpus-coverage.ts` into the production chat response path.
- Annotated server-verified citations with coverage scope and coverage warnings.
- Moved the final SSE `done` event after sources, confidence, and coverage events so clients receive trust metadata before completion.
- Updated the chat UI to show coverage warnings and coverage summary text.
- Changed client-side citation extraction so fallback citations are visibly unverified instead of appearing trusted.
- Changed rate limiting to fail closed when the Supabase RPC fails.
- Removed active BenchMark Standard coupling from `corpus-coverage.ts` comments.
- Corrected landing page, README, Terms, and Privacy copy to match the Tennessee Juvenile and Family Court research scope.
- Corrected pricing copy:
  - Solo: `$69/month` or `$690/year`
  - Court: `$229/month` or `$2,290/year`
  - Court cap: up to 4 named users
  - Enterprise: custom pricing for 5 or more users and large deployments
- Removed broad V1 product promises from public copy, including case-law support, broad document drafting, case pattern analysis, shared workflows, and court administrator dashboard claims.
- Added onboarding support for optional local juvenile rules status:
  - not sure yet
  - not applicable
  - available
- Added a Supabase migration for minimal plan and seat guardrails:
  - `court_accounts`
  - `court_account_members`
  - Solo, Court, and Enterprise plan enum
  - database seat-limit checks
  - local-rules status enum
  - RLS policies for court account visibility and membership
- Hardened `scripts/prebuild-corpus.js` so V1 build output does not silently include Titles 39, 40, or 55.
- Updated prebuild behavior to preserve existing prebuilt Title 36 and Title 37 text when raw source HTML files are absent, and to fail if required V1 titles are unavailable.

## What Did Not Change

- Did not add Titles 39, 40, or 55 to V1.
- Did not add web retrieval to legal answers.
- Did not build a full billing system or seat-management UI.
- Did not build full local-rules upload, parsing, or tenant overlay ingestion.
- Did not remove legacy case-management database tables in this pass because that is a migration and data-retention decision.
- Did not perform major framework upgrades. Next 16 and React 19 are too risky for this launch pass without a separate compatibility cycle.
- Did not upgrade the Anthropic SDK in this pass because `@anthropic-ai/sdk` is materially behind and streaming behavior should be tested in isolation before changing it.

## Recommended Next

1. Add API route tests for auth, rate limiting, SSE event order, Claude error handling, and trust metadata.
2. Build server-side persistence for chat sessions so privacy controls are easier to audit than client-direct Supabase writes.
3. Add a real local-rules overlay workflow with private storage, ingestion, citation extraction, and statewide-versus-local labeling.
4. Add billing integration only after plan and seat state is settled.
5. Run a separate dependency modernization branch for Anthropic SDK, Supabase patch upgrades, Cloudflare Pages tooling, and Next security advisories.
6. Decide whether to archive or remove legacy case-management tables from launch migrations.
7. Add an authenticated E2E smoke test for login to query to verified response.

## Verification Results

- `npm test`: passed. 4 test files, 52 tests.
- `npm run lint`: passed with existing warnings:
  - `chat/page.tsx` missing `loadSessions` dependency warning
  - `research-patterns/route.ts` unused `_request` warnings
  - `voice-input.tsx` unused `placeholder` warning
- `npx tsc --noEmit`: passed when run after build was not concurrently regenerating `.next`.
- `npm run build`: passed.
- `npm run build:cloudflare`: passed.
- `npm audit --omit=dev`: 40 reported vulnerabilities. Several are tied to Next and Cloudflare/Vercel transitive tooling. A forced fix would move to Next 16, so I documented this rather than forcing a risky major upgrade.
- `npm outdated --long`: key findings documented in `CODEX-ASSESSMENT.md`.

## Trust Pipeline Spot Check

Command used a pure TypeScript function check, not a live Anthropic call:

```bash
npx tsx -e "..."
```

Result summary:

- Answer cited `T.C.A. § 37-1-114`.
- `T.C.A. § 37-1-114` was verified with `coverageScope: covered`.
- A deliberate out-of-scope `T.C.A. § 39-13-101` citation was unverified with `coverageScope: stub`.
- Coverage warning stated that Title 39 is not covered by the corpus and BenchBook cannot confirm it.
- Confidence result was `LOW` because of the unverified Title 39 citation.

## Phase 2 Continuation

Date: 2026-05-01

### Issues Found

- Saved chat sessions and message feedback were inserted from the client without `user_id`, while RLS policies require `auth.uid() = user_id`. This could break saved-session creation and feedback at launch.
- Saved assistant messages persisted sources but not confidence, warnings, or coverage metadata. Reopened research could lose the trust context that was shown during the original answer.
- Out-of-scope questions involving excluded Titles 39, 40, and 55 relied mainly on prompt obedience. A hostile or accidental query could still reach model generation before being refused.
- The confidence engine treated answers with no citations as `HIGH` because there was "nothing to verify." For a judicial research product, a citation-free legal answer is a low-trust answer.
- Streaming answers displayed live text before citation verification metadata arrived, without telling the user that verification was still pending.
- Landing page annual pricing copy said "10 months for the price of 12," which inverted the approved annual pricing model.
- Pricing presentation still made the Enterprise boundary too easy to miss for courts with 5 or more named users.
- Local-rules copy in chat, onboarding, and settings did not clearly distinguish "available for later private upload" from "currently active in the answer corpus."
- `legal-corpus/README.md` still framed Titles 39, 40, and 55 as high-priority expansion items, which conflicted with the V1 scope lock.

### Fixes Implemented

- Added authenticated `user_id` on client-created chat sessions and feedback inserts, and explicitly filtered session deletion and listing by the authenticated user.
- Added `trust_metadata` persistence for chat messages through migration `20260501_chat_trust_metadata.sql`.
- Loaded saved `trust_metadata` back into chat messages so confidence, warnings, and coverage summaries survive session reload.
- Added `scope-guard.ts` with deterministic refusal detection for excluded Titles 39, 40, 55, adult criminal procedure, adult criminal offenses, DUI, and traffic-law topics.
- Wired the scope guard into `/api/chat` before model routing and corpus loading. Scope refusals stream through the same SSE trust path with `LOW` confidence and closed-corpus coverage warnings.
- Changed no-citation confidence from `HIGH` to `LOW` and added a warning when an answer returns no citations.
- Added a streaming "Verification pending" notice in the chat UI.
- Added targeted tests for scope guard behavior and no-citation confidence behavior.
- Corrected public pricing copy to "12 months of service for the price of 10."
- Added a visible Enterprise pricing card and clarified that 5 or more named users require Enterprise.
- Tightened landing page corpus copy around selected DCS policies and private local juvenile rules.
- Added a local juvenile rules status field to Settings and clarified that local rules require later private upload and approval.
- Updated `legal-corpus/README.md` to state the V1 scope lock and to mark Titles 39, 40, and 55 as excluded from V1 builds.

### Risks Remaining

- Full local-rules upload, approval, private storage, parsing, and court-scoped injection are still not built.
- Plan and seat enforcement exists at the new database guardrail layer, but there is not yet a complete billing or admin workflow.
- Chat persistence still uses direct client Supabase writes. RLS now has the required `user_id`, but a server-side persistence API would be easier to audit.
- There are still no API route tests for auth, rate limiting, SSE event ordering, Claude errors, or Supabase RLS behavior.
- Legacy database tables and some older scripts still reflect broader product ideas. They are not wired into the V1 answer path, but they remain a cleanup risk.

### Recommended Next Moves

1. Move chat session, message, and feedback writes behind server routes with explicit auth checks and audit logging.
2. Build a small seat-management flow tied to `court_accounts` before paid rollout.
3. Implement the local-rules overlay only as private court-scoped storage with approval status, citation extraction, and separate statewide-versus-local source labeling.
4. Add API route tests for scope refusal, streaming trust metadata order, auth failures, rate limiting failures, and no-citation answers.
5. Add an authenticated E2E smoke test for login, ask, verified answer, save, reload, and preserved confidence metadata.

### Phase 2 Verification Results

- `npm test` from repo root: failed because the repository root has no `package.json`.
- `npm test` from `app/`: passed. 5 test files, 57 tests.
- `npx tsc --noEmit` from `app/`: passed.
- `npm run lint` from `app/`: passed with existing warnings in `research-patterns/route.ts` and `voice-input.tsx`.
- `npm run build` from `app/`: passed. Prebuild preserved existing Title 36 and Title 37 corpus text and skipped Titles 39, 40, and 55.
- `npm run build:cloudflare` from `app/`: passed. Cloudflare output generated successfully.
