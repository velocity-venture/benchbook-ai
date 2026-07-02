# 12 - No Live Database Enforcement Plan (F5-03)

Date: 2026-07-02

How M1 makes "no live database" structural rather than promised.

## 1. Enforcement layers in M1

| Layer | Mechanism | Verified by |
|---|---|---|
| Interface | The only retrieval path is `LegalRetrievalAdapter`; the factory registry contains one binding (mock) | T8 source scan plus T9 boot matrix |
| Types | Target enum has no live-database member in M1 | Compile plus T9 |
| Module graph | `lib/qa-research/` imports no Supabase client, no fetch to external hosts, no connection configuration | T8 static scans |
| Runtime | bootValidate throws on unknown targets; assertEcho per request | T9, ME-05 |
| Config | No new env key can carry a URL or credential; deploy files remain forbidden | `.env.example` review plus F5-03 forbidden map |
| Process | The M1 Codex prompt (doc 17) repeats the prohibition set; stop conditions SC-1/SC-2/SC-11 freeze on violation | Prompt text plus review gate |

## 2. Distinction that must stay crisp

The app's EXISTING Supabase usage (auth, chat persistence, rate limiting, waitlist, research patterns) is allowed and unchanged; it is the app's own data plane. The prohibition is on any LEGAL AUTHORITY retrieval touching a database in M1. T8 therefore scopes its no-Supabase-import assertion to the `lib/qa-research/` module graph and the new route's retrieval path, not the whole app.

## 3. The one deliberate seam

`deliverSpans(chunkIds)` exists on the adapter interface even though the mock serves placeholders, so the G3 decision (text-bearing RPC vs gated view) lands entirely inside the future `supabase-retrieval-adapter.ts` without interface churn. The seam is documented here precisely so nobody "simplifies" it away during M1 implementation.

## 4. Fixture-tier (T2) boundary

T2 (local disposable Postgres with synthetic corpus, per F5-02 doc 12) is NOT part of M1's test files; it arrives with F5-04's completion or F5-05 preparation, reusing the existing local-only dry-run tooling patterns. M1's `dry-run` interactions with any database: none. The local disposable dry run listed in this pass's validation battery exercises the CORPUS pipeline, not the app, and is unchanged.
