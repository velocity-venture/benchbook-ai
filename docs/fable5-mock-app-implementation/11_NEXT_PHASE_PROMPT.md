# 11 - Next Phase Prompt (post-F5-04)

Date: 2026-07-02. Execute ONLY after the owner reviews the F5-04 completion report (doc 00) and the refusal templates (P6).

## Owner decision needed first

Choose the next phase:

- **Option A (recommended): internal QA exercise of the mock surface.** Enable the flags in a local dev environment (`QA_RESEARCH_TARGET=mock_only`, `QA_RESEARCH_ENABLED=true`, `NEXT_PUBLIC_QA_RESEARCH_ENABLED=true`), run the golden-query set from F5-01 doc 12 against the mock surface, collect phrasing misroutes (risk N4) and template-wording feedback, and file findings quoting the audit trace ids the page displays. No code changes required; no approval beyond M-1 needed.
- **Option B: F5-05 live-adapter DESIGN (design only, no connection).** Blocked by the gate chain: O6 preview reload executed and re-QAed on the Mac Studio, O2/O4 tier promotion, O7 build approval, plus P1/P2 contract signatures. Not startable until the corpus side advances (O1/E14C remains the critical path).

## Prompt block for Option A (copy into the next session)

---

You are working in the BenchBook.AI repository on branch `feature/qa-research-mock-only`.

Run the internal QA exercise of the mock-only QA research surface per `docs/fable5-mock-app-implementation/11_NEXT_PHASE_PROMPT.md` Option A. Strict prohibitions of F5-04 remain in force verbatim (no Supabase commands, no database contact, no live bindings, no embeddings, no display-gate changes, no legal body text, no secrets; do not modify migrations, loaders, ingestion, PDFs, or generated corpus sources; do not mark PR-tracking branches ready or merge them).

1. `npm test` and `npx next build` must be green before starting.
2. Start the dev server locally with the three QA flags enabled; confirm the MOCK ONLY banner, target chip, and no-production footer render.
3. Execute the golden-query matrix (F5-01 doc 12) against `/qa-research`; record per query: response class, refusal variant if any, citation badges, confidence, audit trace ids.
4. File findings as `docs/fable5-mock-app-implementation/qa-exercise/` markdown artifacts (metadata only; no legal body text; query texts are fine, they are user-authored questions, but never paste statute text).
5. Do not change app code in this exercise; misroutes and wording issues become a findings list for the owner.

---

## Standing constraints for EVERY next phase

The full F5-04 prohibition list applies unchanged until the owner explicitly opens a live-DB phase. Draft PR #3 stays draft. The `feature/qa-research-mock-only` branch merges into `refactor/codex-gpt55-launch-prep` only after owner review of doc 00 and the template texts.
