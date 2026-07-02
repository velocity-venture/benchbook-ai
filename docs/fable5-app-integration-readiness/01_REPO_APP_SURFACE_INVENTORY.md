# 01 - Repo App Surface Inventory

Date: 2026-07-02
Phase: F5-02 (read-only inspection; no app code changed)
Branch: `refactor/codex-gpt55-launch-prep` at `2a8cc66`

Classifications: Adopt, Adopt with revision, Archive, Reject, Needs further review (NFR). "At integration" means during F5-04 or later, never in this phase.

## 1. Pages (Next.js App Router, edge runtime)

| Surface | Path | Classification | Integration-era note |
|---|---|---|---|
| Landing page | `app/src/app/page.tsx` | Adopt with revision | Copy honesty pass before external users; no integration coupling |
| Login | `app/src/app/login/page.tsx` | Adopt | Internal-QA tier will restrict signup (S1) |
| Auth callback | `app/src/app/auth/callback/route.ts` | Adopt | - |
| Chat workspace | `app/src/app/(dashboard)/chat/page.tsx` | Adopt with revision | The primary QA-route consumer; must render new citation/refusal/audit envelope and QA banner |
| Dashboard | `(dashboard)/dashboard/page.tsx` | Adopt | - |
| TCA browser | `(dashboard)/tca/page.tsx` | Adopt with revision | Reads flat JSON (`lib/tca-data.ts`); re-point at gated views post-integration |
| TRJPP browser | `(dashboard)/trjpp/page.tsx` | Adopt with revision | Same (`lib/trjpp-data.ts`) |
| DCS browser | `(dashboard)/dcs-policies/page.tsx` | Adopt with revision | Same (`lib/dcs-data.ts`); must carry reference-only labeling post-integration |
| Onboarding | `(dashboard)/onboarding/page.tsx` | Adopt | - |
| Settings | `(dashboard)/settings/page.tsx` | Adopt | - |
| Privacy / Terms | `privacy/`, `terms/` | Adopt | Strong disclaimers already present |
| Dashboard layout and error boundary | `(dashboard)/layout.tsx`, `error.tsx` | Adopt | - |

## 2. API routes

| Surface | Path | Classification | Note |
|---|---|---|---|
| Chat route | `app/src/app/api/chat/route.ts` | Adopt with revision (plumbing) / Reject (retrieval core) | Auth, rate limiting (fail-closed), input validation, SSE framing, scope-guard wiring are keepers. `loadRelevantCorpus()` context stuffing and the flat-JSON evidence base are rejected and are replaced by the doc 03 contract. Invalid default model IDs remain a known defect on this branch |
| Research patterns | `api/research-patterns/route.ts` | Adopt | Personal analytics; orthogonal |
| Waitlist | `api/waitlist/route.ts` | Adopt | Marketing shell |

## 3. Trust modules (`app/src/lib/`)

| Module | Lines | Classification | Note |
|---|---:|---|---|
| `scope-guard.ts` | 70 | Adopt with revision | Deterministic, server-side, pre-generation. Covers excluded titles 39/40/55 (statutory-context patterns), DUI/traffic, adult-criminal topics with juvenile-context override. Must extend to ruling-recommendation, credibility, extra-record-fact classes (F5-01 doc 09) and gain refusal-kind mapping |
| `citation-validator.ts` | 339 | Adopt with revision | Existence-only against flat-string index; right API and tests; evidence base swaps to alias RPC at integration |
| `hallucination-guard.ts` | 80 | Adopt with revision | Confidence computation and warnings; re-point inputs |
| `corpus-coverage.ts` | 270 | Adopt with revision | covered/stub/absent labeling with KNOWN_STUB_TITLES 39/40/55; concept carries over, source becomes database coverage facts |
| `query-router.ts` | 68 | Adopt with revision | Haiku/Sonnet heuristics; recalibrate post-retrieval |
| `chat-persistence.ts` | - | Adopt | Session/message persistence incl. trust_metadata |
| `supabase/{client,server,middleware,env}.ts` | - | Adopt | Correct SSR pattern, fail-fast env validation |
| `tca-data.ts`, `trjpp-data.ts`, `dcs-data.ts` | - | Adopt with revision, then Archive | Flat-JSON browser data; retire with the old corpus chain |

## 4. Components, contexts, config

| Surface | Classification | Note |
|---|---|---|
| `components/ui/*` (badge, button, card, input, textarea) | Adopt | - |
| `components/sidebar.tsx`, `research-patterns.tsx` | Adopt | - |
| `components/voice-input.tsx` | NFR | Web Speech API input; defer any investment until after corpus rebuild lands (arch-review guidance) |
| `contexts/preferences-context.tsx` | Adopt | - |
| `middleware.ts` | Adopt | Auth gating |
| `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs` | Adopt | - |
| `wrangler.toml` (Cloudflare Pages) | Adopt with revision | Needs target-control notes at deploy time (F5-01 doc 13, T2) |
| `capacitor.config.ts` + `android/`, `ios/` | Adopt (dormant) | Store work deferred |
| `package.json` | Adopt with revision | `prebuild` still runs `scripts/prebuild-corpus.js` (old corpus chain); retire at integration cutover |

## 5. Tests (14 Vitest files, `app/src/__tests__/`)

chat-persistence, chat-route-anthropic-streaming, chat-route-auth-rate-limit, chat-route-corpus-cache, chat-route-corpus-loading-errors, chat-route-env-validation, chat-route-input-validation, citations, corpus-coverage, hallucination-guard, query-router, research-patterns-route, scope-guard, supabase-client-creation.

Classification: **Adopt.** This suite is the foundation the mock harness (doc 12) extends. Notable: zero tests reference the legal_authority schema; nothing to unwind.

## 6. Verified absence of integration

`grep -r 'legal_authority\|authority_chunks\|lookup_citation_alias\|search_displayable_chunks' app/src/` returns nothing. The app is fully disconnected from the authority database. All integration work is additive.

## 7. Machine-readable mirror

`manifests/app_surface_inventory_manifest.json`.
