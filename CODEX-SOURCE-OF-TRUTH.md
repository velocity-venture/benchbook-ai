# BenchBook.AI — Source of Truth
**Compiled:** 2026-04-30
**Purpose:** Canonical product and launch brief for Codex launch-prep work

---

## 1. Product Identity

**BenchBook.AI** is a premium, judge-built judicial research platform for Tennessee trial judges, with the first launch edition focused on **Tennessee Juvenile and Family Court** work.

Its purpose is simple:

**When a judge is in the middle of a hearing and needs a fast, reliable, bench-ready answer from Tennessee law, BenchBook.AI should produce a concise answer with verified citations, visible confidence levels, and no bluffing.**

This is:
- a closed-universe Tennessee judicial research assistant
- a digital bench book for live courtroom use
- a product built for speed, trust, and practical bench application

This is **not**:
- a generic AI chatbot
- a law review drafting engine by default
- a full juvenile court case-management system
- a county CMS replacement

**Author / originating user perspective:** Judge M.O. Eckel III, Tipton County, Tennessee
**Unique advantage:** Built by a sitting judge who understands the real courtroom workflow

---

## 2. Canonical Product Scope

The current launch target is a **judicial research product**, not a broad case-management suite.

Codex must optimize for:
- bench-ready legal research
- Tennessee-specific corpus-grounded answers
- citation verification
- hallucination prevention and confidence scoring
- quick-reference tools and corpus browsers
- judicial usability under hearing-time pressure
- secure authentication, saved sessions, and court-appropriate preferences

Codex must **not** expand the product into:
- docket management as a primary feature
- comprehensive case notes platform
- broad document management
- enterprise court administration suite
- statewide criminal-law expansion for V1

Historical documents may contain broader aspirations. Those are not the current launch target.

---

## 3. Intended Users

### Primary Users
- Tennessee juvenile court judges
- Tennessee family-court-adjacent judges, magistrates, and referees
- Tennessee General Sessions judges handling juvenile or family-related matters

### Secondary Users
- Small court teams within plan limits
- Court staff in approved support roles

### Large-System Buyers
- Larger counties or court systems with multiple judges, magistrates, referees, clerks, or staff attorneys
- These require enterprise pricing and should not be treated as small-team Court plan customers

---

## 4. Core User Experience

BenchBook.AI should help a judge answer questions like:
- What is the detention standard here?
- What deadlines apply under TRJPP?
- What does T.C.A. Title 37 require?
- What does Title 36 require in this custody, dependency, or family-law context?
- What does DCS policy say about removal, placement, investigation, or case planning?
- What are the practical bench steps, in order, right now?

The answer must be:
- fast
- structured
- citation-backed
- clearly limited to the available corpus
- honest about uncertainty

If the corpus does not support a point, BenchBook.AI must say so plainly.

---

## 5. Functional End State

### 5.1 AI Research Workspace
The center of the product is a research chat experience where the judge can ask natural-language Tennessee law questions and receive streaming answers.

Expected capabilities:
- saved chat sessions/history
- streaming responses
- source extraction and display
- citation verification
- confidence badge: HIGH / MEDIUM / LOW
- warnings for unverified statutes or unverifiable case law
- copy/bookmark/feedback actions
- suggested queries and Bench Cards

### 5.2 Bench-Ready Response Format
Default response shape should be:
1. direct answer
2. controlling statute, rule, or policy
3. key elements, deadlines, or procedural requirements
4. practical bench notes

Long-form academic analysis is not the default behavior.

### 5.3 Citation Verification
BenchBook.AI must verify extracted citations against the loaded corpus and show:
- citation text
- verified or unverified status
- source type
- source snippet

### 5.4 Hallucination Guard
The product must actively reduce legal hallucinations:
- verify statutes and rules
- flag case law as not independently verifiable unless future corpus support exists
- compute confidence
- display warnings to the user

### 5.5 Smart Model Routing
Use lower-cost models only for genuinely simple lookups.
Use stronger models for juvenile, family, DCS, procedural, analytical, or multi-part questions.

### 5.6 Corpus Browsers
Support browsing of:
- Tennessee Code
- TRJPP rules
- DCS policies

These are support tools around the core research engine.

### 5.7 Judicial Personalization
Authenticated users should have:
- secure login
- onboarding/profile
- saved research sessions
- research patterns/history
- courtroom-oriented display preferences

### 5.8 Commercial Shell
The launch product also includes:
- polished landing page
- pricing page/copy
- waitlist or lead capture
- privacy and terms pages
- deployable web app
- mobile shell readiness where already scaffolded

---

## 6. Legal Corpus: V1 Scope Lock

The V1 closed universe is limited to these sources:
- **T.C.A. Title 36**
- **T.C.A. Title 37**
- **TRJPP** (Tennessee Rules of Juvenile Practice and Procedure)
- **DCS policies** relevant to investigations, foster care, case planning, removal, dependency, and neglect workflows
- **Optional court-specific local juvenile court rules** for a subscribing court, if provided

### Court-Specific Local Rules Overlay
BenchBook.AI must allow each subscribing judge or court to optionally incorporate that county’s or court’s **local juvenile court rules of practice** into that court’s private closed-universe corpus.

Expected behavior:
- During onboarding or in settings, the user can indicate:
  - local juvenile rules available
  - no local juvenile rules / not applicable
- If local rules exist, an authorized judge or court admin can upload or add them to that court’s private corpus
- If no local rules exist, the feature is skipped cleanly with no friction
- Local rules act as a **court-specific overlay** on top of the Tennessee base corpus
- Responses should distinguish statewide authority from local rules
- Responses should cite local rules separately when used, for example: `Local Rule 5, Tipton County Juvenile Court`
- If local rules conflict with statewide authority, responses should identify the higher authority clearly
- Local rules must not be shared globally across all customers by default

### Hard Scope Constraint
Do **not** add these to any V1 code path:
- T.C.A. Title 39
- T.C.A. Title 40
- T.C.A. Title 55
- open web retrieval
- unrestricted external legal research

Those may be future roadmap items, but not V1 launch scope.

---

## 7. Technical Stack and Architecture Direction

Current architectural direction should be treated as canonical:
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Auth / persistence:** Supabase
- **AI:** Anthropic Claude API
- **Deployment target:** Cloudflare Pages / edge-compatible app path
- **Mobile shell:** Capacitor wrappers may exist, but the core product is the web app

Codex should assume the current product direction is:
- Claude-based legal research
- direct corpus loading / prebuilt corpus artifacts where implemented
- citation validation and hallucination guard in the response pipeline
- judicial UX over generic chatbot UX

Older materials referencing OpenAI GPT-4o, Pinecone-first architecture, or broader case-management positioning should be treated as stale unless the live code clearly still depends on them.

---

## 8. Pricing Model (Canonical)

### Solo
- **$69/month**
- **$690/year** if billed annually
- Annual plan means pay for 10 months, receive 12 months of service
- Includes **1 named judicial user**

### Court Package
- **$229/month**
- **$2,290/year** if billed annually
- Annual plan means pay for 10 months, receive 12 months of service
- Includes **up to 4 named users**
- Intended for a small court team

### Enterprise / Large Court System
- **Custom pricing**
- Required when:
  - more than 4 users are needed
  - multiple judges or magistrates are included beyond the small-team cap
  - county-wide or district-wide deployment is requested
  - a larger system such as Shelby, Davidson, or Knox seeks broader rollout
  - advanced onboarding, support, or custom configuration is needed

### Commercial Rules
- The Court Package is **not** an unlimited-seat plan
- It is a **small-team license capped at 4 named users**
- Larger court systems must upgrade to enterprise pricing or an approved expansion model
- Codex should audit for assumptions of unlimited users or missing seat enforcement logic

---

## 9. Launch Standard

The standard for launch is not "interesting demo."
The standard is:

**Would a sitting Tennessee juvenile or family court judge trust this in the middle of a hearing?**

That means:
- reliable auth
- accurate citations
- visible uncertainty
- no bluffing
- coherent pricing and plan boundaries
- polished UX under time pressure
- proper scoping of court-specific data
- production-safe deployment path

---

## 10. Current Known Audit Priorities

Codex should pay special attention to:
- trustworthiness of the legal answer pipeline
- citation verification completeness
- hallucination guard completeness
- scope discipline, especially removal of stale case-management assumptions
- local-rules overlay support and private scoping
- pricing consistency across docs, UI, and billing flows
- seat-limit and plan-model assumptions
- auth gating and court-data privacy boundaries
- deployment readiness, build health, lint/test/typecheck state
- any stale product copy that contradicts this source of truth

---

## 11. Non-Negotiable Guardrails

1. **V1 corpus scope is locked** to the Tennessee juvenile/family closed universe described above.
2. **AI responses must be corpus-grounded.** Do not add web retrieval to V1.
3. **Court-specific local rules are optional and private.** If absent, users must be able to mark the feature not applicable and proceed normally.
4. **Seat limits matter.** Do not treat the Court plan as unlimited.
5. **FERPA-grade privacy matters anywhere court-specific or juvenile data appears.**
6. **BenchBook.AI is independent from BenchMark Standard.** Do not couple the projects.
7. **Use American spelling in user-facing text.** No em-dashes in user-facing text or documentation.

---

## 12. Repository Context

- **Local repo:** `~/Projects/benchbook-ai`
- Codex work should happen in this repository
- Codex should create or use a dedicated branch for refactor work
- Codex should leave a written assessment and written refactor log in the repo

This file is the controlling product brief for Codex launch-prep work. If other docs conflict with this file, this file wins.
