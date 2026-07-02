# 08 - Internal QA Launch Readiness Scorecard

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration

Classification scale (matches `manifests/internal_qa_readiness_manifest.json`): Ready, Ready after owner review, Blocked, Deferred, Needs further review.

## 1. Scorecard

| # | Category | Status | Evidence / gap |
|---|---|---|---|
| 1 | Source-of-record manifest and provenance | **Ready** | 677 hashed rows, dup groups reconciled, committed metadata |
| 2 | Ingestion pipeline (extraction, chunking, restriction tagging) | **Ready** | Expanded ingestion complete; restriction and QA statuses assigned at extraction |
| 3 | Extraction QA execution | **Blocked** | 4,198 chunks pending; sampled-QA workflow exists but has not run |
| 4 | Authority schema and gates (preview) | **Ready** | Deny-by-default columns, gated views/RPCs, verified E8-E13B |
| 5 | Preview corpus load tooling | **Ready** | E10B executed once; rollback and postflight assets exist |
| 6 | Metadata remediation queues (E13A) | **Ready** | Validated, re-run PASS in this pass |
| 7 | Candidate remediation artifacts (E14B) | **Ready after owner review** | Populated and validated; every row awaits human decision |
| 8 | Corpus-admin review execution (E14C) | **Blocked** | Not started; owner decision O1 |
| 9 | Identity resolution (38 rows) | **Blocked** | Depends on 8 |
| 10 | Effectivity resolution (54 rows) | **Blocked** | Depends on 8 |
| 11 | QA signoff (439 versions) | **Blocked** | Depends on 8 |
| 12 | Patch application tooling (P3) | **Blocked** | Designed, not built; next Codex phase |
| 13 | Preview reload with patched metadata (E15) | **Blocked** | Depends on 8, 12, and owner approval O6 |
| 14 | Internal-QA display tier promotion | **Blocked** | Owner decision O2 defines which rows and which tier |
| 15 | DCS posture for launch (guardrail/reference only) | **Ready** | This IS the launch posture; enforced by scope enum and gates |
| 16 | Restricted Lexis posture for launch (non-display) | **Ready** | Non-display enforced; license review is a separate deferred workstream |
| 17 | TRE limited-scope enforcement | **Needs further review** | Database scope value correct; retrieval-time scope filtering gap G1 needs an owner-reviewed design (RPC revision vs app-layer filter) |
| 18 | Citation alias integrity | **Ready** | 3,598 aliases, 0 collisions; coverage probes planned in doc 11 |
| 19 | Embeddings / semantic retrieval | **Deferred** | Correctly absent; not required for internal QA; separate approval later |
| 20 | App integration (contract C1-C14) | **Blocked** | Contract defined this pass; implementation not authorized yet |
| 21 | Judicial guardrails proven on DB-backed path | **Blocked** | Spec in doc 09; test matrices in docs 10-11; harness not built |
| 22 | Golden-query and refusal QA harness | **Blocked** | Designed this pass; build belongs to next phases |
| 23 | Security and RLS posture | **Ready** | RLS on all 20 tables; no raw chunk policy; service-role kept server-side |
| 24 | Audit logging schema | **Ready** | Tables and RPC exist; app-side wiring is part of category 20 |
| 25 | Target control and production prohibition | **Ready after owner review** | Rules exist and held through 14 phases; owner should ratify the standing plan in doc 13 (includes the migrations-directory fence, O5) |
| 26 | Migration-history caveat resolution | **Needs further review** | Object-verification stance adopted; ledger repair or fence decision O5 pending |
| 27 | Owner decision packet | **Ready after owner review** | Doc 15 this pass |
| 28 | Internal QA launch definition | **Ready after owner review** | Section 3 below |

Totals: Ready 10, Ready after owner review 4, Blocked 11, Deferred 1, Needs further review 2. (28 categories.)

## 2. Reading the scorecard

Nothing in the Blocked column is mysterious or unresourced: every blocked item has an existing workflow document, tool, or design, and a named owner decision. The critical chain is:

O1 approve E14C -> corpus-admin review (items 8-11) -> build patch tooling (12) -> O6 approve reload -> E15 reload (13) -> O2 display tier (14) -> integration build under contract (20) -> guardrail harness green (21, 22) -> internal QA launch.

## 3. Definition of the internal QA launch (what it is and is not)

**It is:** a private, access-controlled instance for the Judge and named QA participants; connected to the PREVIEW database only; retrieval through gated RPCs; internal-QA display tier rows only; persistent non-reliance banner; full audit logging; golden-query and refusal harness green before first session; every session's findings logged as QA artifacts.

**It may include:** statute and rule answers from QA-approved black-letter rows; TRE answers on evidentiary topics only; DCS content as labeled reference cards only; refusal behavior on everything out of scope.

**It must not include:** production database or production display flags; public or marketing access; DCS as answer authority; restricted Lexis content on any surface; embeddings; Titles 39/40/55; web retrieval; case-specific ruling recommendations; any representation that output is reliable legal authority.

## 4. Standing risks not otherwise tracked

| # | Risk | Mitigation owner |
|---|---|---|
| R7 | Shipping app still answers from the 2021 corpus behind a trust UI while Stack B matures | Owner: keep demo-only usage discipline; integration cutover retires it |
| R8 | Corpus-admin review is a single-person bottleneck | Owner: schedule; sampled-QA design already reduces volume |
| R9 | Fable 5 window ends 2026-07-07; high-context design capacity drops | Runway doc 14 front-loads design artifacts into the window |
