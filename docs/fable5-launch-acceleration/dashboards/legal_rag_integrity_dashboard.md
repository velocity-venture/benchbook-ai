# Legal RAG Integrity Dashboard

Date: 2026-07-01 (Fable 5 launch acceleration pass)

## Closed-universe integrity

| Control | State | Notes |
|---|---|---|
| Corpus limited to Titles 36/37, TRJPP, TRE (limited), DCS (reference) | HOLDING | 5 seeded families only; no 39/40/55 anywhere in pipeline |
| Web retrieval absent | HOLDING | No retrieval path exists outside the database RPCs and the legacy flat JSON (itself scheduled for retirement) |
| Model memory as authority | PROHIBITED BY CONTRACT | Enforcement lands with contract C5 at integration; not yet proven |
| Provenance chain | HOLDING | source sha256 -> manifest -> build -> chunk text_sha256 |

## Authority integrity counters (preview, recorded E13B)

| Counter | Value |
|---|---|
| Authority chunks | 6,590 |
| Citation aliases / collisions | 3,598 / 0 |
| Duplicate chunk IDs | 0 |
| Unresolved identity rows | 38 (queued for E14C) |
| Unknown effectivity | 15 versions, 39 chunks (gated) |
| Future-effective versions visible early | 0 |
| QA-signoff-pending versions | 439 |
| Displayable now | 0 (by design) |

## Scope integrity

| Scope rule | State |
|---|---|
| DCS guardrail/reference only (2,014 chunks) | ENFORCED by answer_scope enum and gates; production-eligible 0 |
| TRE limited-scope (533 chunks) | ENFORCED at metadata level; retrieval-time filter is gap G1 (decision O3) |
| Restricted Lexis non-display (2,392 chunks) | ENFORCED; license review pending as separate workstream |
| Black-letter eligibility | Default false everywhere; O4 ruling required before any promotion |

## Citation integrity path to green

1. E14C resolves 38 identity rows.
2. Golden block GB6 proves alias coverage across citation phrasings.
3. Contract C3/C4 wiring makes citations mandatory and refusal automatic.
4. citation_verification_records populated per displayed citation (C11).
5. Proposition-support checking: deferred post-internal-QA (tracked, honest gap).
