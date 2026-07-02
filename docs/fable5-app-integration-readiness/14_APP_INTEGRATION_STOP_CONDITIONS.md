# 14 - App Integration Stop Conditions

Date: 2026-07-02
Phase: F5-02

These are the conditions under which integration work (F5-04 and beyond) must stop immediately, plus the freeze mechanics. They bind any agent or human doing integration work.

## 1. Hard stop conditions (stop work, alert owner, no workaround)

| # | Condition | Detection |
|---|---|---|
| SC-1 | Environment target mismatch: pinned config, response echo, or connection metadata disagree, or any production identifier appears in QA-route configuration | Boot check plus per-request echo check (doc 10) |
| SC-2 | Any code path found reading `authority_chunks` directly or using service-role in a user request path | Code review gate plus fixture-tier privilege test (doc 11 section 6.3) |
| SC-3 | Display gates observed open beyond the owner-approved tier (any restricted/pending/unknown-effectivity row in results) | GQ-1 attestation failure in any tier |
| SC-4 | Guardrail bypass: any answer path skipping GP/GQ/GA checks | Harness audit-sequence assertions |
| SC-5 | Leakage event: restricted text, DCS-as-authority, excluded-title authority, future-effective text, or model-memory law rendered | GA-3 scan, harness leakage assertions, human QA report |
| SC-6 | Guardrail classifier failing open on error | Fault-injection scenario GG-12 |
| SC-7 | Internal-QA banner absent on a QA-tier build | ME-01 |
| SC-8 | Audit write failures being swallowed (answers streaming without retrieval logs) | MA-series assertions; periodic reconciliation query |
| SC-9 | Boot-time validation failures ignored (invalid model IDs, missing target pin, QA-mode flag defaulted on) | Boot check tests |
| SC-10 | Any secret, connection string, or service-role material in app diffs or logs | Secrets scan on every F5-04 diff |
| SC-11 | Scope creep into prohibited territory: Titles 39/40/55 content, web retrieval, embeddings generation, production connection, display-gate mutation from app code | Diff review against the prohibition list |

## 2. Freeze mechanics

1. The QA route ships behind a feature flag that can only narrow behavior (C13); the freeze action is flag-off plus session termination for QA participants.
2. Any SC event files a defect artifact under `docs/` (metadata only) recording detection, scope, and disposition.
3. Post-fix, the affected tier reruns fully (T1 for code-level, T2 for gate-level, T3 plus refusal matrix for anything user-visible) with two consecutive green runs before unfreeze.
4. SC-1, SC-3, SC-5, and SC-11 events additionally require written owner acknowledgment before unfreeze.

## 3. Standing prohibitions during all integration phases

No Supabase CLI against preview/production from integration sessions except the separately-approved E15-B/E15 actions; no migration changes; no loader/ingestion script changes; no embeddings; no display-gate changes from app code ever (gates are database-side and owner-controlled); nothing merged without T1 green.
