# 11 - Security and RLS App Access Spec

Date: 2026-07-02
Phase: F5-02. Builds on F5-01 doc 12; this spec fixes the app-side access rules.

## 1. Access matrix (what the app may touch, as which role)

| Object | App access | Mechanism |
|---|---|---|
| `authority_chunks` (raw) | NEVER | No RLS policy exists; the app adds none and requests none |
| Gated retrieval | Authenticated user session | `lookup_citation_alias`, `search_displayable_chunks` (security-definer, gate-enforcing) |
| Chunk text delivery | Authenticated user session | The G3 mechanism chosen in F5-03 design; must remain gate-enforcing |
| Reference metadata (units, versions, families, aliases, builds) | Authenticated read | Existing `auth.uid() is not null` policies; used for source cards and browsers post-integration |
| Audit tables (write) | Server-side only, user id carried | `log_refusal_record` exists; sibling RPCs or constrained policies for the other three tables per doc 09 section 4 |
| Audit tables (read) | Per-user only | Existing `auth.uid() = user_id` policies |
| Staging tables, warnings, verification records (read) | NEVER from the app | Service-role/back-office only, outside request paths |
| App tables (chat, profiles, patterns) | Unchanged | Existing per-user RLS |

## 2. Credential rules

1. No service-role key in any client bundle, edge function env reachable from user paths, or QA-route code. The QA route runs with the user's session credentials plus security-definer RPCs.
2. No database URLs or connection strings in app code or app env beyond the standard Supabase URL/anon key pair already in use.
3. Anthropic API key stays server-side env, as today.
4. Boot-time env validation (existing `lib/supabase/env.ts` pattern) extends to: pinned environment_target present and valid, model IDs resolvable, QA-mode flag default off.

## 3. Auth tier for internal QA

Named accounts only; self-signup disabled for the QA instance (S1); QA participants enumerated by the owner (O8 gate). Middleware continues to gate all dashboard routes; the QA route additionally checks membership in the named-participant set.

## 4. Rate limiting and abuse posture

Existing dual-layer limiter carries over with fail-closed behavior. The QA route applies the same limits; guardrail refusals count toward limits (prevents refusal-probing loops).

## 5. Transport and logging hygiene

No query content in console/edge logs (S4); SSE responses carry no internal identifiers beyond contract fields; error messages to users never include stack traces, SQL, or gate internals (the gate_attestation object stays server-side; users see only the refusal envelope).

## 6. Pre-integration security checklist (feeds doc 14 stop conditions)

1. Object verification run confirms: RLS enabled everywhere expected, no broad chunk policy exists, RPC security-definer status intact (S2 script, built in X2/F5-03 era).
2. Secrets scan of the app diff at F5-04 review: no new env vars beyond the declared set.
3. Fixture-tier harness runs under a non-privileged database user to prove no privileged dependency exists.
4. QA-mode excerpt flag verified default-off in the deployed config.
