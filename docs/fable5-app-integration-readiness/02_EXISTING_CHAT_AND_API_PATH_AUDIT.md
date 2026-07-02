# 02 - Existing Chat and API Path Audit

Date: 2026-07-02
Phase: F5-02 (read-only)

## 1. The current `/api/chat` request lifecycle (as implemented on this branch)

1. **Auth:** `supabase.auth.getUser()`; 401 if absent.
2. **Rate limiting:** in-memory fast path plus `check_rate_limit` RPC; **fails closed** on RPC error (returns 429-path false). Keep this posture.
3. **Input validation:** query required, max 2,000 chars; history max 20 messages, each max 4,000 chars; roles restricted to user/assistant; 400 on violation.
4. **Scope guard (pre-generation):** `detectOutOfScopeQuery()` on the raw query. On match, the route streams a refusal WITHOUT any model call: SSE `delta` (refusal text), `confidence` (LOW plus warnings), `coverage` (corpus summary), `done` (zero tokens, model_used `scope-guard`). This is the pattern the new refusal contract generalizes.
5. **Config checks:** `USE_CLAUDE_API` flag and API key presence; 500 with instructive error if absent.
6. **Model routing:** `classifyQueryComplexity()` picks Haiku or Sonnet (default IDs on this branch are invalid; env overrides required).
7. **Corpus assembly:** `loadRelevantCorpus()` concatenates whole corpus sections from build-time JSON by keyword gating; 503 on load error. **This is the rejected retrieval core**: unauditable, unbounded context, no provenance, no gates.
8. **Generation and post-processing:** `streamClaude()` streams `delta` events; on completion runs the hallucination guard (citation existence verification against the flat index), coverage annotation, then emits `sources` (with verified flags, coverage scope/warning per source), `confidence` (HIGH/MEDIUM/LOW plus reason and warnings), `coverage` (summary line plus warnings), `done` (token usage, cache stats, model label).
9. **Research tracking:** fire-and-forget insert into `research_queries` plus patterns RPC.

## 2. SSE event vocabulary currently consumed by the chat page

| Event | Payload highlights | Consumer behavior |
|---|---|---|
| `delta` | text | Append to streaming content |
| `error` | message | Replace content with error text |
| `sources` | title, citation, type, snippet, verified, coverageScope, coverageWarning | Source cards with verified badges |
| `confidence` | level, reason, warnings, coverageSummary, coverageWarnings | Confidence badge and warning list |
| `coverage` | summary, warnings | Coverage banner |
| `done` | tokens_used, cache stats, model_used | Telemetry |

The page persists messages with `sources` and `trust_metadata` (confidence envelope) to Supabase, so the QA route can keep the same persistence shape.

## 3. What carries over vs what is replaced (per the doc 03 contract)

| Element | Disposition |
|---|---|
| Auth, rate limiting (fail-closed), input validation | Carry over unchanged |
| Pre-generation scope guard streaming a no-model refusal | Carry over; extend classes and add refusal-kind logging (docs 05, 06) |
| SSE framing and event vocabulary | Carry over; extend with `citations` (contract objects), `refusal` (structured), `environment` (target label) events; keep legacy names for UI compatibility where meanings are unchanged |
| Flat-JSON corpus, `loadRelevantCorpus()`, 5-minute corpus cache | Replaced by gated RPC retrieval (doc 03); the legacy path must be dead code on the QA route |
| Citation existence check against flat index | Replaced by database verification via `lookup_citation_alias` (doc 04) |
| Coverage annotator | Re-pointed at database coverage facts (family row counts, display tiers) |
| Confidence computation | Carry over conceptually; inputs become database verification results |
| Research tracking | Carry over; add linkage to `retrieval_logs`/`answer_audit_records` IDs (doc 09) |

## 4. Defects in the current path that the QA route must not inherit

| # | Defect | Contract clause that prevents it |
|---|---|---|
| D1 | Invalid default model IDs (`claude-haiku-4-5-20250414`, `claude-sonnet-4-5-20250414`); works only via env overrides | Stop condition SC-9 (doc 14): boot-time model ID validation |
| D2 | Whole-title context stuffing exceeding model context limits | Contract requires span-only prompt assembly (doc 03 section 5) |
| D3 | Citation verification cannot block an answer; fabricated-but-existing citations pass | Doc 04 verification levels; unresolvable citations demote or refuse |
| D4 | No audit trail beyond `research_queries` | Doc 09 audit writes |
| D5 | Scope guard runs only on the current query, not assembled history | Doc 06 GP-1 runs on the assembled window |
| D6 | No as-of-date concept anywhere | Doc 03 request field `as_of_date`; doc 08 |
| D7 | No environment/target labeling | Doc 10 |

## 5. Other API paths

`/api/research-patterns` (GET/POST, personal analytics) and `/api/waitlist` (anon insert) neither touch legal content nor need contract changes. `/auth/callback` is standard Supabase SSR. No other server routes exist.
