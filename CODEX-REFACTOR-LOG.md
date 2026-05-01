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
