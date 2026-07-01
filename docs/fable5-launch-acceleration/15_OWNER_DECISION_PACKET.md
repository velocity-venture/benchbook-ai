# 15 - Owner Decision Packet

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration
For: Judge M.O. Eckel III

Each decision below is independent, written to be answerable in one sitting. Recommended answers are marked. Machine-readable mirror: `manifests/required_owner_decisions_manifest.json`.

## O1. Approve E14C: corpus-admin review execution (RECOMMENDED: approve)

What it authorizes: local-only review of the E14B candidate artifacts, recording per-row decisions (identity 38, effectivity 54, QA signoff 439, sampled extraction QA, DCS and restricted dispositions) in the candidate CSVs. No database contact, no reload, no app changes.
Why now: every downstream step waits on these human decisions. The E14C execution kit will make the review mechanical.
Risk if approved: reviewer time only. Risk if deferred: the entire runway slips day for day.

## O2. Define the internal-QA display tier (RECOMMENDED: approve the narrow default)

Question: after the patched reload, which rows may be promoted for internal QA visibility?
Recommended default: statute and rule chunks (Titles 36/37, TRJPP, TRE) that passed identity, effectivity, QA signoff, and sampled extraction QA, promoted to internal-QA display status only (`approved_for_internal_qa` tier), never `approved_for_production`. DCS stays reference-only. Restricted Lexis stays non-displayable.
This is the decision that makes displayable-rows nonzero for QA. It does not touch production display.

## O3. TRE scope-filter mechanism (RECOMMENDED: app-layer filter now, RPC revision later)

Gap G1: the search RPC does not filter by answer scope. Options: (a) enforce TRE limited scope in the app layer under contract C9 with tests, (b) revise the RPC to accept a scope parameter before display gates open.
Recommendation: (a) for internal QA speed, with (b) queued as a schema follow-up. Both keep the database as the source of scope truth; (a) trusts the app to apply it, which the harness verifies.

## O4. Black-letter display ruling for Lexis-exported statute text (DECISION NEEDED, no default)

The source PDFs are LexisNexis exports. Annotations and case notes are already quarantined as restricted. The question is whether the black-letter statute text itself is cleared for display in an internal QA tier and, later, production. This is a license-terms judgment the owner must make or delegate to counsel. Internal QA can proceed under O2 only if the answer for the QA tier is yes; a written note in the repo is sufficient form.

## O5. Fence the E6 rehearsal migrations (RECOMMENDED: approve)

Move the 10 `20260619*_e6_local_rehearsal_*` files out of `supabase/migrations/` (into `supabase/migrations_local_rehearsal/`) in a small Codex commit, so no future `supabase db push` can sweep legal_authority DDL into a linked project. Retires the sharpest edge of the migration-history caveat. Until done: nobody runs `db push`.

## O6. Approve E15 preview reload (DEFER until E14C output is in front of you)

What it will authorize when signed: rollback of the retained preview batch and reload from patched metadata on `clerihqbjyczarqkiqnb` preview only, per the E15 runbook, with post-load QA. Do not sign now; sign against the E14C results and the rehearsal evidence (doc 06 checklist P2-P7 all green).
Note: the approval document must name the exact ref; see doc 13 session ritual.

## O7. Approve the app-integration build (DEFER until after O6 executes)

Authorizes Codex to build the QA route under contract C1-C14 with the harness. No production exposure. Sign when the reloaded preview passes re-QA.

## O8. Internal QA launch (DEFER; final gate)

Sign when: harness green twice consecutively, guardrail acceptance (doc 09 section 5) recorded, participants named, banner and audit logging verified. This is the last signature before humans use the system for QA.

## Standing items re-affirmed (no signature needed, listed for visibility)

- Production remains untouched (doc 13).
- Embeddings remain prohibited until separately raised.
- DCS remains guardrail/reference only.
- Restricted Lexis remains non-displayable; license review is a separate workstream you may start any time.
- Titles 39/40/55 and web retrieval stay out.

## The one decision to make today

O1. Everything else either has a recommended default you can ratify later or explicitly waits on evidence.
