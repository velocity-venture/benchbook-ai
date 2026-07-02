# BenchBook.AI — Codex Launch Prep Brief
**Issued:** 2026-04-30
**Operator:** Judge M.O. Eckel III
**Model:** Codex GPT-5.5

---

## Mission

Evaluate the current BenchBook.AI codebase against the canonical source of truth in `CODEX-SOURCE-OF-TRUTH.md`, then refactor and harden the product for launch readiness.

This is a **Tennessee Juvenile and Family Court judicial research product**, not a full case-management suite. Optimize for trust, courtroom usability, scope discipline, privacy, commercial correctness, and production readiness.

Read `CODEX-SOURCE-OF-TRUTH.md` fully before touching code. If other repo docs conflict with it, treat `CODEX-SOURCE-OF-TRUTH.md` as controlling.

---

## Phase 1: Assessment (read-only first)

Before writing code, produce `CODEX-ASSESSMENT.md` with findings in these categories.

### 1. Product Alignment Audit
Check whether the current codebase matches the canonical product target:
- Is the product behavior centered on judicial research, not stale case-management ambitions?
- Do landing page, onboarding, pricing, docs, and in-app copy reflect the Tennessee Juvenile and Family Court edition accurately?
- Are there stale references to:
  - OpenAI GPT-4o
  - Pinecone-first architecture
  - broad case-management promises
  - outdated pricing tiers
- Does the codebase currently account for optional court-specific local juvenile rules as a private overlay concept, or is that absent?
- Are there assumptions that the Court plan has unlimited users?

### 2. Dependency and Platform Audit
Compare current dependencies against latest stable versions and assess upgrade risk/benefit.
Specifically review:
- `@anthropic-ai/sdk`
- `next`
- `react`
- `@supabase/ssr`
- `@supabase/supabase-js`
- `vitest`
- any PDF parsing libraries
- any Cloudflare Pages or Capacitor-specific dependencies

Flag:
- deprecated packages
- security advisories
- packages materially behind current stable
- upgrades that are safe vs risky before launch

### 3. AI Integration and Trust Audit
Review the legal answer pipeline carefully.
Assess:
- current Anthropic SDK usage patterns
- model routing logic and whether it remains appropriate
- whether the system prompt enforces corpus-only grounding
- whether citation validation is correctly wired into every response path
- whether hallucination/confidence logic is correctly wired into every response path
- whether `corpus-coverage.ts` is implemented, tested, and actually used in production responses
- whether fallback paths bypass trust controls
- whether UI surfaces trust metadata clearly enough for a judge in live use

### 4. Corpus Scope and Overlay Audit
Review whether the implementation matches V1 scope lock.
Confirm:
- V1 remains limited to Title 36, Title 37, TRJPP, DCS policies, and optional local-rules overlay only
- no code path introduces Titles 39, 40, or 55 into V1
- no web retrieval exists in the legal response pipeline
- no product copy suggests broader corpus support than actually exists

Assess what would be required to support:
- optional court-specific local juvenile rules upload
- a "not applicable" option for courts with no local rules
- private scoping of local rules to a court tenant or authorized account

Do not build a full multi-tenant admin suite unless the work is already mostly scaffolded, but document what exists and what is missing.

### 5. Security and Privacy Audit
Review:
- hardcoded secrets or API keys
- `.gitignore` and env hygiene
- rate limiting completeness, both DB and server-side enforcement
- auth coverage across protected routes
- any path that could expose juvenile or court-specific data without proper auth
- any logs or console output that could expose sensitive information
- any weakness in handling future court-specific local rules privately

### 6. Commercial and Plan Audit
Review product code and docs for pricing and plan correctness.
Assess whether current code, docs, or UI assume or expose:
- outdated pricing
- unlimited court users
- no seat-management logic
- no enterprise escalation path
- no annual discount handling

Target commercial model:
- Solo: $69/month or $690/year
- Court: $229/month or $2,290/year, up to 4 named users
- Enterprise: custom pricing for 5+ users or large-county deployments

### 7. Code Quality and Launch Readiness Audit
Run and document:
- lint
- tests
- typecheck
- production build, especially Cloudflare build path

Identify:
- `any` types in critical legal/auth/pricing paths
- stale or duplicate modules
- dead code
- missing tests on trust-critical logic
- mobile/responsive issues that materially affect launch quality

---

## Phase 2: Refactor and Hardening (in priority order)

### P0: Required Before Launch
These items have the highest priority.

#### 1. Wire corpus coverage into production response path
- If `app/src/lib/corpus-coverage.ts` exists and is not used, integrate it into the production response pipeline
- Ensure responses can surface coverage warnings where appropriate
- Add or update UI to display coverage warnings in a sober, non-alarmist way
- Preserve or expand tests accordingly

#### 2. Fix stale product truth in code and docs
Update stale product copy and docs so they reflect the canonical source of truth.
This includes, where applicable:
- removing stale OpenAI GPT-4o references if no longer current
- removing stale case-management positioning that contradicts current launch scope
- correcting pricing and plan language
- making Tennessee Juvenile and Family Court edition language consistent

#### 3. Verify and enforce trust controls
- Ensure citation validation runs on every relevant response path
- Ensure hallucination/confidence logic runs on every relevant response path
- Ensure any client-side fallback paths do not weaken trust controls
- Tighten server-side rate limiting if incomplete

#### 4. Audit seat and plan assumptions
Without overbuilding billing, identify and fix any obvious code or copy that treats the Court plan as unlimited.
If plan or seat enforcement already exists, verify it.
If it does not exist, document the gap clearly and implement the smallest sensible launch-safe guardrails available in the current architecture.

#### 5. Preserve privacy boundaries
Review any current or future-facing structures for court-specific content and ensure the architecture does not imply global sharing of private local-rules content.

### P1: Strongly Recommended if Low Risk

#### 6. Anthropic SDK modernization
- Upgrade `@anthropic-ai/sdk` if a safe current stable release exists
- Update usage to current best practices
- Preserve streaming and prompt-caching behavior
- If advanced reasoning or extended thinking features exist, gate them behind a feature flag rather than enabling by default

#### 7. Platform upgrade evaluation
- Evaluate Next.js upgrade only if low-risk and compatible with Cloudflare build path
- If upgrade is clean and build remains healthy, proceed
- If risky, document and skip

#### 8. Type safety improvements in critical paths
Tighten types in:
- legal response pipeline
- citation validation
- hallucination/confidence logic
- auth and plan-related logic

Prefer targeted strictness improvements over broad destabilizing changes.

#### 9. PDF / corpus ingestion hardening
If corpus parsing or preprocessing has fragile points, add sensible error handling and diagnostics.
Do not destabilize the current corpus pipeline.

### P2: Nice to Have if Time Permits
- Diagnostic coverage endpoint or internal operator tooling
- E2E smoke test for login -> query -> trusted response path
- CSP/security header improvements
- Targeted responsive/mobile polish where issues are clearly visible and low-risk
- Groundwork for local-rules overlay support if the architecture already makes that practical without major diversion

---

## Phase 3: Verification

After Phase 2 changes, complete and document:
1. tests passing
2. lint passing or materially improved
3. typecheck passing or materially improved
4. production build succeeding, including Cloudflare path if present
5. spot check of a legal query showing:
   - answer
   - citation/source output
   - confidence output
   - any coverage warning when appropriate

Write results to `CODEX-REFACTOR-LOG.md`.

---

## Hard Constraints

1. **V1 corpus scope is locked.** Do not add Titles 39, 40, or 55 to V1.
2. **No web retrieval in V1 legal answers.** Responses must remain corpus-grounded.
3. **This is a judicial research product, not a full case-management expansion project.**
4. **Court-specific local rules are optional and private.** Do not imply global sharing.
5. **The Court plan is capped at 4 named users.** Do not preserve unlimited-seat assumptions.
6. **FERPA-grade privacy matters wherever court-specific or juvenile data appears.**
7. **BenchBook.AI is independent from BenchMark Standard.** Do not couple them.
8. **Use American spelling in user-facing text. No em-dashes in user-facing text or documentation.**

---

## Expected Outputs

Produce:
- `CODEX-ASSESSMENT.md`
- committed code changes on a dedicated refactor branch
- `CODEX-REFACTOR-LOG.md`
- passing or improved tests
- successful or improved build verification

If you choose not to perform a recommended change, document exactly why.
