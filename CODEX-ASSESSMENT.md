# BenchBook.AI Launch Readiness Assessment

Date: 2026-04-30
Branch: `refactor/codex-gpt55-launch-prep`

Controlling brief: `CODEX-SOURCE-OF-TRUTH.md`

## 1. Product Alignment Audit

BenchBook.AI is partially aligned with the controlling brief. The live chat, corpus browsers, Supabase auth, saved sessions, citation verification, hallucination guard, confidence badges, and Claude pipeline all support the Tennessee judicial research target.

Key gaps:

- Landing page copy still positions the app as a broad "judicial productivity platform" and includes product promises outside V1, including case pattern analysis, document drafting, shared workflows, court administrator dashboards, broad case law, and docket trend analysis.
- `README.md` has stale pricing and target market language. It still lists Court at `$199/month` and "Up to 5 staff."
- `app/src/app/page.tsx` lists Solo at `$79/month` and `$790/year`, and Court at up to 5 judicial users. Source of truth requires Solo `$69/month` and `$690/year`, Court `$229/month` and `$2,290/year`, up to 4 named users.
- `app/src/app/terms/page.tsx` lists Solo at `$79/month` and Court up to 5 seats.
- The chat empty state says "Case Law" and "relevant case law" even though V1 has no case-law corpus and case law cannot be independently verified.
- Local juvenile court rules are mentioned in copy, but there is no tenant-private local-rules upload, not-applicable choice, or overlay pipeline yet.
- Supabase migration `20260204_initial_schema.sql` still contains broad case-management tables: cases, hearings, documents, case notes, and compliance deadlines. They are not surfaced as the current primary UI, but they conflict with the controlling product direction if treated as launch scope.
- Archived audits contain BenchMark Standard contamination. The final active audit says no coupling, but the new `corpus-coverage.ts` comments still reference BenchMark Standard.

## 2. Dependency and Platform Audit

Current app dependencies are Next 14.2.35, React 18.3.1, `@anthropic-ai/sdk` 0.31.0, `@supabase/ssr` 0.8.0, `@supabase/supabase-js` 2.93.3, `vitest` 4.1.3, `pdf-parse` 2.4.5, `@cloudflare/next-on-pages` 1.13.14, and Capacitor 8.3.0 packages.

`npm outdated --long` findings:

- `@anthropic-ai/sdk`: current 0.31.0, latest 0.92.0. Materially behind. Worth evaluating, but SDK streaming changes may require care.
- `next`: current 14.2.35, latest 16.2.4. Major upgrade is risky before launch, especially with Cloudflare Pages and React 18.
- `react` and `react-dom`: current 18.3.1, latest 19.2.5. Major upgrade is risky before launch.
- `@supabase/ssr`: current 0.8.0, latest 0.10.2. Likely moderate-risk and worth a targeted test.
- `@supabase/supabase-js`: current 2.93.3, wanted/latest 2.105.1. Likely safe if tests and auth flows pass.
- `vitest`: current 4.1.3, latest 4.1.5. Safe patch upgrade.
- `@cloudflare/next-on-pages`: current 1.13.14, latest 1.13.16. Safe patch upgrade candidate.
- Capacitor packages: current 8.3.0, latest 8.3.1. Safe patch upgrade candidate.
- `pdf-parse`: current 2.4.5. No outdated result reported.

`npm audit --omit=dev` reports 40 vulnerabilities, including high-severity advisories in Next, transitive Vercel/Cloudflare tooling dependencies, xmldom, minimatch, undici, path-to-regexp, and tar. The Next fix path suggests a breaking upgrade to Next 16. This should not be forced blindly before launch. Patchable transitive fixes should be tested, and Cloudflare/Next path should be reviewed separately.

## 3. AI Integration and Trust Audit

The legal answer pipeline is in `app/src/app/api/chat/route.ts`.

Strengths:

- API route requires authenticated Supabase user before answering.
- Query and message length limits exist.
- Smart routing sends simple queries to Haiku and complex legal queries to Sonnet.
- Claude responses stream via SSE.
- Citation validation and hallucination guard run after the full streamed response.
- UI displays sources, verified status, confidence level, and warnings.

Key gaps:

- `corpus-coverage.ts` exists and has tests, but it is not imported or used in the production response path.
- The server sends the `done` event before citation, source, confidence, and warning events. This can make client consumers treat a response as complete before trust metadata arrives.
- Trust metadata is only emitted after streaming completes. During streaming, a judge sees answer text before citations and confidence are available.
- If no backend sources are returned, the client falls back to `extractSourcesFromResponse`, which extracts citations without server verification and can make unverified citations appear as normal sources.
- The JSON response branch in the client is legacy fallback logic. The current API requires Claude and does not return trusted mock responses, so this path can bypass confidence display if ever reintroduced.
- Rate limiting fails open if the Supabase RPC fails. This protects availability but weakens abuse controls.
- `usage as any` is present in a critical route.
- The prompt still includes hardcoded references such as detention, dispositions, and reasonable efforts. These are useful examples but should not be treated as authority unless in the loaded corpus.

## 4. Corpus Scope and Overlay Audit

Current production corpus path loads prebuilt JSON with Title 36, Title 37, TRJPP, and DCS text. No production web retrieval was found in the chat route.

Scope concerns:

- `corpus-coverage.ts` explicitly tracks Titles 39, 40, and 55 as known stub titles. This does not add them to V1 answers, but comments and tests should be clarified so no one mistakes stubs for planned V1 corpus.
- Query router includes sentencing, bond, bail, probation, criminal contempt, Title 33, and transfer-to-criminal-court complexity triggers. Routing to Sonnet is fine, but product copy should not imply broad criminal law coverage.
- The UI and landing page mention case law and local court rules more broadly than the current corpus supports.
- Local rules are represented as a citation type and in copy, but there is no tenant-private storage or injection into the AI context.

To support optional private local juvenile court rules properly, the app needs:

- Profile or court setting: local rules available, none/not applicable, or pending upload.
- Tenant or court-scoped storage table/bucket for local rules with RLS.
- Server-side ingestion and citation extraction for uploaded local rules.
- Response pipeline merge that keeps statewide corpus separate from local overlay.
- UI labeling that distinguishes statewide authority from local rules.
- Conflict handling prompt and post-processing warning.

## 5. Security and Privacy Audit

Strengths:

- Protected routes are gated by middleware.
- Chat API requires auth.
- RLS policies exist for chat sessions, messages, feedback, research queries, and legacy case-management tables.
- Secret scan found placeholders only, not real keys.

Key gaps:

- Legacy schema includes case files, hearings, documents, and case notes, which can invite storage of juvenile or FERPA-sensitive case data outside the V1 research scope.
- Client-side Supabase writes create chat sessions and messages directly. RLS helps, but server-side persistence would be easier to audit for privacy and rate limiting.
- `getSessions()` and `getSessionMessages()` in `chat-persistence.ts` do not explicitly check auth or user ID, relying on RLS.
- Rate limiting fails open on RPC errors.
- Research tracking stores full query text up to 1000 characters. The product tells users not to enter real case data, but judges may still do so. Privacy copy is strong, but technical safeguards such as sensitive-data warnings are not implemented.
- There is no private local-rules architecture yet, so future implementation must avoid global corpus sharing.

## 6. Commercial and Plan Audit

Canonical pricing and limits:

- Solo: `$69/month`, `$690/year`, 1 named judicial user.
- Court: `$229/month`, `$2,290/year`, up to 4 named users.
- Enterprise: custom pricing for 5 or more users, larger court systems, and advanced support.

Current conflicts:

- `app/src/app/page.tsx`: Solo `$79/month`, `$790/year`; Court "Up to 5 judicial users"; no Enterprise path in pricing cards.
- `app/src/app/terms/page.tsx`: Solo `$79/month`, `$790/year`; Court up to 5 seats.
- `README.md`: Court `$199/month`, up to 5 staff.
- No plan or seat fields exist in the profile schema beyond generic profile fields.
- No server-side seat enforcement exists.

Smallest launch-safe guardrail:

- Correct public and legal copy immediately.
- Add plan metadata fields or a migration for plan tier, court account, role, and seat cap before billing launch.
- Treat any 5-plus seat interest as Enterprise in UI and docs.

## 7. Code Quality and Launch Readiness Audit

Tests present:

- `query-router.test.ts`
- `hallucination-guard.test.ts`
- `citations.test.ts`
- `corpus-coverage.test.ts`

Known launch risks:

- No API route tests for auth, rate limiting, SSE event order, Claude errors, or trust metadata.
- No Supabase persistence tests for session isolation.
- No E2E smoke test for login to query to trusted response.
- `app/src/app/api/chat/route.ts` is a large module with mixed auth, rate limiting, corpus loading, AI streaming, trust verification, and persistence.
- User-facing text includes em dashes and stale scope claims.
- Landing page visual/product copy is broader than the launch product.
- Cloudflare build path should be verified after any dependency or runtime change.

Recommended priority order:

1. Wire coverage reporting into the chat route and UI.
2. Remove stale client trust fallback or mark fallback sources as unverified.
3. Correct pricing, seat limits, and product scope copy.
4. Remove BenchMark Standard coupling in active source comments.
5. Add minimal plan constants and public Enterprise escalation copy.
6. Run tests, lint, typecheck, app build, and Cloudflare build path.
7. Consider patch upgrades only after P0 behavior is stable.
