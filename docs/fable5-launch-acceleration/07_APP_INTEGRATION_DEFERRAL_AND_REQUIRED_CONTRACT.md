# 07 - App Integration Deferral and Required Contract

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration
Status: app integration remains DEFERRED and PROHIBITED until the owner separately approves it. No app code was modified in this pass. This document defines the contract the app must satisfy before it is permitted to connect to the legal_authority database.

## 1. Why deferral remains correct today

1. Displayable rows are 0; an integrated app would retrieve nothing.
2. Metadata review (E14C) and the patched reload (E15) have not happened.
3. The judicial guardrail set has never been proven against a database-backed answer path.
4. The QA harness that would prove it (docs 10 and 11) is designed but not built.

Integration before those four items completes would produce an app that either answers from nothing or bypasses gates to answer at all. Both are worse than deferral.

## 2. The contract (C1-C14)

The app may connect to the legal_authority database only when it satisfies every clause. These are testable requirements, each mapped to the guardrail test manifest.

| # | Clause | Testable requirement |
|---|---|---|
| C1 | **Closed-universe retrieval only** | Every legal proposition in an answer derives from rows returned by `lookup_citation_alias` or `search_displayable_chunks` (or an approved internal-QA RPC). No other legal text source exists in the answer path: no flat-JSON corpus, no web retrieval, no model-memory authority. The old `loadRelevantCorpus()` path must be dead code or removed on the integrated route. |
| C2 | **Gated text delivery** | Chunk text reaches the app only through gate-enforcing RPCs/views. The app never selects raw `authority_chunks`, never uses service-role in any user-facing request path. The text-delivery mechanism (view select under RLS vs a text-bearing RPC) must be designed and reviewed before integration (gap G3, doc 03). |
| C3 | **Mandatory citations** | Every answer containing a legal statement renders at least one database-verified citation with the source-card fields of doc 04 section 4. Answers without a resolvable citation are converted to refusals (C4). |
| C4 | **Refusal when no authority** | If retrieval returns no displayable row supporting the query, the app returns the no-authority refusal pattern and writes a `refusal_records` row (kind `no_authority_support`) via `log_refusal_record`. No paraphrased general knowledge backfill. |
| C5 | **No general legal fallback** | The system prompt and code path contain no fallback to model general knowledge for legal content. Model knowledge may shape wording and structure only, never legal substance. Citation granularity displayed never exceeds what the database resolved (doc 04, A3). |
| C6 | **No case-specific ruling recommendations** | The scope guard blocks requests to recommend a ruling, decide credibility, or supply extra-record facts, pre-generation, server-side, and logs kind `safety_guardrail` or `out_of_scope`. The existing scope-guard module extends to the classes in doc 09. |
| C7 | **No DCS production-answer authority** | DCS rows surface only as reference material, visibly labeled, never as controlling authority in an answer, unless a later owner approval changes specific mapped rows. `answer_scope = guardrail_reference_only` must be respected end to end. |
| C8 | **No restricted Lexis display** | Rows with `restricted_pending_license_review` or `internal_qa_only` display status never render to any user surface outside approved internal QA tooling. Zero tolerance; tested by direct probe. |
| C9 | **TRE limited-scope handling** | TRE chunks may support answers only for evidentiary/procedural questions (admissibility, objections, offers of proof, expert proof, hearsay, judicial notice, privileges). For any other topic TRE is reference-only. Until an RPC-level scope filter exists (G1), the app must enforce this filter itself and prove it under test. |
| C10 | **Internal-QA reference surface** | If internal QA users need to see restricted/pending rows for QA purposes, that surface uses a dedicated, audited, clearly-labeled internal path, designed and approved, never the production answer path. |
| C11 | **Audit logging** | Every retrieval writes `retrieval_logs` (hash-only queries in production mode); every answer writes `answer_audit_records` with model, prompt hash, retrieved chunk IDs, and trust metadata; every displayed citation writes `citation_verification_records`; every refusal writes `refusal_records`. Reconstruction of any answer must be possible from these rows alone. |
| C12 | **Target environment labeling** | The app displays which corpus target and tier it is connected to. Internal QA builds show a persistent "INTERNAL QA - NOT FOR JUDICIAL RELIANCE" banner. Production connection strings for the legal_authority path do not exist in any deployed configuration until production launch is separately approved. |
| C13 | **Display gate enforcement** | The app treats database gates as authoritative and adds no client-side overrides. Feature flags may narrow what is shown; they may never widen it. |
| C14 | **As-of-date discipline** | Every retrieval passes an explicit as-of date (default: today) to the RPCs; answers state the as-of date; future-effective law is never displayed before its effective date. |

## 3. Contract verification plan

- Each clause maps to one or more rows in `manifests/guardrail_test_manifest.json` (this pass) and to the mock-only test matrices in docs 10 and 11.
- Verification happens in three tiers: (1) unit tests with mocked RPC responses, (2) integration tests against a local disposable database with a tiny synthetic fixture corpus (never real legal text in the repo), (3) manual golden-query sessions against the reloaded preview.
- No clause may be marked satisfied by code review alone; each needs an executed test artifact.

## 4. Explicit non-goals for the first integration

- No embeddings and no semantic retrieval (deferred).
- No production display of any row.
- No local-rules overlay work.
- No DCS mapping expansion in-app.
- No case-management features on the integrated surface.

## 5. Recommended integration shape (design note only)

A separate route (for example `/api/qa-research`) implementing C1-C14 against preview, behind internal-QA auth, leaving the legacy `/api/chat` untouched until parity is proven, then a cutover decision. This keeps the shipping app stable and makes A/B verification possible. Detailed design belongs to the next Fable pass (doc 17).
