# 09 — Frontend and Product-Scope Review (Phase 8)

**Date:** 2026-06-10 · Files: `app/src/app/page.tsx` (landing), `chat/page.tsx`, dashboard/browsers, `layout.tsx` metadata, `terms/`, `privacy/`, `PRODUCT.md`, `MOBILE.md`, `README.md`, `UI-AUDIT.md`.

> **Sequencing note (controlling):** No UI or copy work in this document begins before Phase A/B (source manifest, source-of-record preservation, approval classification, corpus authority audit) is complete. The recommendations below are recorded for Phase I; the only items that may move earlier are *removals* of overpromising copy if anything ships publicly in the interim.

## A. Overpromise audit

The copy is, overall, unusually honest for a legal-AI product. Landing claims ("Closed Corpus Answers", "Citation Verification", "Smart Statute Browser", "AI Research Assistant") match implemented features; footer and metadata stay inside research/citation scope; Terms contain a highlighted **"No Legal Advice"** section and an **"AI Accuracy Limitations"** section; Privacy states it is "not a case management system." No claims of case-pattern analysis, predictive rulings, credibility assessment, web research, or case-law research were found. "Research patterns" is personal search-history analytics (top queries / most-viewed sources for the logged-in judge), not cross-case analysis — naming is defensible but worth a clarifying subtitle.

**Violations and corrections required:**

| # | Location | Copy | Problem | Fix |
|---|---|---|---|---|
| 1 | `MOBILE.md:149-158` (app-store listing draft) | "…citing T.C.A. Title 36 & 37, **complete TRJPP rules, and all DCS policies**" | Corpus holds ~26 DCS policy extracts of a 661-document universe, TRJPP currentness unverified, and Titles 36/37 are a 2021 snapshot. "All"/"complete" is false on three counts | Rewrite to "selected DCS policies approved for the BenchBook corpus" and drop "complete" until verified; never ship listing copy before Phase B manifest exists |
| 2 | Landing `page.tsx:261-266` | "Smart Statute Browser… See related provisions and **recent amendments** automatically" | "Recent amendments" is indefensible on a 2021 corpus | Remove "recent amendments" until corpus is current and versioned |
| 3 | Whole product | No corpus-currency disclosure anywhere in UI | Given doc 02, silence about the corpus date is itself an overpromise | Add corpus-version/date line to chat UI and statute browser (doc 07 §B.6) |
| 4 | `README.md` vs `page.tsx` vs `CODEX-SOURCE-OF-TRUTH.md` | Pricing conflicts (Solo $79 vs $69; Court $199/5 seats vs $229/4 seats) | Stale README | Align README to CODEX brief |

## B. Trust indicators — present and good

Confidence badges (HIGH/MEDIUM/LOW with reason), per-citation "(unverified)" and "(outside V1 corpus)" labels, "All verified" state, source snippets, yellow warning blocks, "Verification pending…" during streaming, "AI can make mistakes. Always verify legal citations." at the input, case-law Westlaw/Lexis warnings, user-scoped feedback toggles (commit `7f23e20`). **Adopt.** Gaps: corpus-version banner (above); citation click-through to source span (no spans exist yet — Phase E/I); CODEX-ASSESSMENT's noted defect that the `done` event can precede trust events (UI may briefly show an answer as complete without verification state) — fix ordering server-side; client fallback `extractSourcesFromResponse()` can render regex-scraped citations indistinguishably from verified ones (UI-AUDIT + security agent) — label or remove the fallback.

## C. Known UI defects already on record (`UI-AUDIT.md`)

Voice-input component built but never mounted; research-pattern links point to `/dashboard/chat?q=` instead of `/chat?q=`; client-side citation fallback misses `Tenn. Code Ann.` format; theme toggle inert (dark hardcoded); courtroom-mode CSS references non-existent classes; no mobile drawer for sidebar; Settings→Security tab is a placeholder. None are scope violations; all are launch-polish items (Phase I), and none should be worked before the corpus rebuild.

## D. Pages inventory

Public: `/` (landing+waitlist), `/login`, `/privacy`, `/terms`. Authenticated: `/dashboard`, `/chat`, `/tca` (Titles 36/37 browser), `/trjpp`, `/dcs-policies`, `/settings`, `/onboarding`. API: `/api/chat`, `/api/research-patterns`, `/api/waitlist`, `/auth/callback`. Mobile: Capacitor 8 WebView shells (`ai.benchbook.app`) wrapping https://benchbook.ai — corpus stays server-side; content updates bypass app-store review; no offline mode.

## E. Recommendations (Phase I)

1. Corpus trust-state header in chat + browsers: authority list with version labels and build date, sourced from `corpus_builds`/manifest.
2. Citation click-through: badge → source viewer at `page_start`/span once spans exist.
3. Fix trust-event ordering and remove/label the unverified client fallback.
4. Copy fixes from §A; add a short "What BenchBook will not do" panel (mirrors guardrail classes — credibility, rulings, fact investigation) in onboarding and footer.
5. Defer all cosmetic UI-AUDIT fixes until after Phases A–G.

**Classification:** Landing/marketing copy — **Adopt with revision** (§A items). Chat trust UI — **Adopt with revision** (ordering + fallback). Statute/TRJPP/DCS browsers — **Adopt with revision** (re-point to authority DB in Phase I; currently read the same flat JSON). Terms/Privacy — **Adopt**. Mobile shells + MOBILE.md — **Adopt with revision** (listing copy). README pricing — **Adopt with revision**. Voice input component — **Needs further review** (unwired; decide in Phase I).
