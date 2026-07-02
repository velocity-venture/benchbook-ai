# Phase E10 Implementation Decision Packet

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E9 planning only

This packet is for owner decision-making before any Phase E10 work. It does not authorize E10.

## Decision required

Choose one E10 path:

| Path | What happens | Operational risk | Launch value | Recommendation |
|---|---|---|---|---|
| E10-A: planning-only continuation | Write the preview-safe adapter plan, SQL review package, and rollback procedure without remote commands | low | medium | recommended if risk tolerance is low |
| E10-B: preview corpus-load dry run with remote writes | Load gated corpus rows into approved preview only, keep display count zero, verify and document rollback posture | medium | high | recommended only with explicit written owner approval |
| E10-C: preview corpus-load execution and retained gated corpus | Load and retain gated corpus in preview for later internal QA | medium to high | high | defer until E10-B succeeds |
| E10-D: defer remote loading until corpus QA improves | Keep preview schema empty while resolving identity, effectivity, and restricted-content issues | low | low to medium | recommended if legal QA risk outweighs retrieval QA value |

## E10-A: planning-only continuation

This path allows local-only progress without remote risk.

Allowed work:

- write a preview-only loader adapter design;
- write dry-run rollback design;
- write generated SQL/COPY artifact requirements;
- improve metadata-only validation reports;
- add tests for loader gate logic if scripts are changed in a later authorized phase.

Prohibited work:

- remote Supabase commands;
- corpus-row loading;
- embeddings;
- app integration;
- migration application;
- production project contact.

Success measure: E10 ends with a reviewed execution plan that can be approved or rejected separately.

## E10-B: preview corpus-load dry run with remote writes

This path tests the full load and gate sequence against approved preview, while preserving zero display.

Minimum owner approval must state:

- remote writes are authorized;
- target is `benchbook-ai`;
- project ref is `clerihqbjyczarqkiqnb`;
- production project `benchbook-ai-prod` is forbidden;
- production project ref `suiylfayvjsjtbrsjrwx` is forbidden;
- row categories are limited to the V1 corpus load proof;
- displayable view count must remain zero;
- embeddings are forbidden;
- app integration is forbidden;
- rollback or retained-batch handling is required.

Success measure:

- staging counts match local proof;
- promoted counts match local proof;
- displayable views remain zero;
- restricted and pending QA rows remain excluded from display;
- DCS remains non-production-answerable;
- TRE remains limited-scope;
- future-effective and unknown-effectivity rows remain gated;
- RLS and policy checks pass;
- no embeddings are populated;
- no app code or config consumes the corpus;
- rollback or retained-batch state is documented.

Stop immediately if any target, display, policy, scope, or secret-handling check fails.

## E10-C: retained gated corpus

This path should not be the first remote load action. It should only be considered after a dry run succeeds.

Why defer:

- retained rows increase cleanup obligations;
- preview may be mistaken for production readiness;
- app integration pressure increases once rows exist;
- restricted and pending-QA rows require careful internal-only handling;
- migration-history caveat remains unresolved.

Recommended prerequisite: successful E10-B with full verification.

## E10-D: defer remote loading

This path keeps preview schema empty while reducing corpus QA blockers.

Useful next work:

- resolve 17 unresolved units and 21 unresolved chunks;
- reduce DCS policy identity gaps;
- partition or approve effective-dated rows;
- define restricted-content approval workflow;
- define local juvenile rules overlay boundaries for later private court-specific use;
- preserve zero-display preview until QA improves.

Tradeoff: retrieval, citation-alias, and audit-path behavior cannot be tested against remote preview corpus rows.

## Current recommendation

The most balanced next move is E10-A unless Judge Eckel wants a live preview load test. If remote-write testing is desired, E10-B is the right executable target, but only with explicit written authorization and a zero-display stop condition.

E10-C should not be selected until E10-B succeeds. E10-D is acceptable if legal QA caution is the priority.

## Required owner approval wording for E10-B

Any E10-B approval should plainly state all of the following:

- "I approve remote writes to the Supabase preview project `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`, for a gated preview corpus-load dry run."
- "Do not contact `benchbook-ai-prod` or project ref `suiylfayvjsjtbrsjrwx`."
- "Do not generate embeddings."
- "Do not modify app code or connect the app to the preview corpus."
- "Do not open display gates."
- "Stop and document if any gate fails."

Without language that clear, E10 should default to E10-A planning-only.
