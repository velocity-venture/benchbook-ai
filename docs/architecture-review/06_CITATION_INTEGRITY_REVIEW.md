# 06 — Citation Integrity Review (Phase 5)

**Date:** 2026-06-10 · Files: `app/src/lib/citation-validator.ts` (340 lines, **uncommitted changes present — inspected, not modified**), `hallucination-guard.ts`, `corpus-coverage.ts`, tests.

## A. Format coverage

| Format | Handled? | Detail |
|---|---|---|
| T.C.A. citations | ✅ formats / ⚠ resolution | Regex (validator:139) accepts `T.C.A. § 37-1-114`, `TCA 37-1-114`, `Tenn. Code Ann. § …`, `section 37-1-114` |
| Subsections `(a)(2)` | ⚠ | Matched but **stripped** — `37-1-114(a)` verifies against the whole section; subsection-level support is never checked |
| Section ranges (`§§ 37-1-101 to -110`, `37-1-114–116`) | ❌ | No range parsing; untested |
| Tenn. R. Juv. P. | ⚠ | Only `(?:TRJPP\s+)?Rule\s+(\d+)` (validator:147). The canonical form "Tenn. R. Juv. P. 205" **does not match**; bare "Rule 114" inside other text can false-positive |
| Tenn. R. Evid. | ❌ | No pattern; TRE absent from corpus entirely. "Tenn. R. Evid. 803" in an answer is extracted as bare "Rule 803" at best, mis-attributed to TRJPP |
| DCS policy citations | ⚠ | Only `DCS\s+Policy\s+([0-9.]+)` (validator:154); "Policy 14.6", "DCS 14.6", chapter names don't match |
| Citation aliases | ❌ persisted / ⚠ regex variants only | No alias table; normalization is regex-shaped |
| Parentheticals / quoted text | ❌ | Quotes inside answers are not checked against corpus text |
| Cross-references | ⚠ | Uncommitted change correctly stops cross-referenced Titles 39/40/55 inside Title 37 text from entering the index (validator:70,82) and re-checks at verification (validator:193) — good defense in depth |
| Advisory comments / annotations / case notes | ❌ | Corpus has no chunk types; a "verified" citation may be matching an annotation, not black-letter text |
| Versioned citations | ❌ | No version model |
| Citation display / click-through | ⚠ | Badges + snippets shown (chat/page.tsx:800-855); no click-through to source page/span (no spans exist) |
| Case law | ✅ posture | Detected (validator:164-171), always `verified:false`, Westlaw/Lexis warning — correct for current scope |

## B. What "validation" means today — existence, not support

`buildCitationIndex()` regex-scans the **flat corpus strings** into `Set`s of section/rule/policy numbers with snippet maps. `verifyCitations()` checks set membership. Consequences:

1. **Existence ≠ support.** "T.C.A. § 37-1-114 requires release within 24 hours" verifies as HIGH if §37-1-114 exists, regardless of what it says. There is **no proposition-support verification anywhere**.
2. **Existence is measured against 2021 text.** A since-repealed or renumbered section still "verifies." A 2025-enacted section fails verification with a misleading "could not be verified" warning. Citation integrity is capped by corpus integrity (doc 02).
3. **Annotation contamination.** Because TNCODE annotations/case notes live in the same strings, the index contains section numbers that appear only in commentary.
4. **Failure handling is warn-only:** unverified ⇒ `verified:false`, snippet `''`, LOW confidence + ⚠ warning streamed; the answer text itself is never blocked or redacted. Defensible for a judge-facing tool, but it must be paired with persistence (it is not — verification results are never stored; `trust_metadata` never written).

Confidence model (`computeConfidence`, validator:305-339): LOW if any unverified statute; MEDIUM if verified + case law present; HIGH otherwise. Reasonable, but HIGH conflates "all cited sections exist in a 2021 snapshot" with "answer is supported."

## C. Uncommitted changes (other agent's work — leave untouched)

- `citation-validator.ts`: adds `EXCLUDED_TCA_TITLES` {39,40,55} + `isExcludedTcaSection()`; skips excluded sections at index build; re-checks at verification time. **Sound; recommend committing as-is.**
- `scope-guard.ts`: tightens title regexes so bare numbers ("within 40 days", "39 weeks") no longer trip refusals while `title 40`, `40-35-101`, `T.C.A. § 40` still do. **Sound.**
- Tests: +4 excluded-title cases, +2 bare-number/statutory-context cases. Total: 19 citation cases, 7 scope cases.

## D. Test gaps (citation-specific)

Ranges; multi-subsection conjunctions (`(a), (b)`); `Tenn. R. Juv. P. N` canonical form; any TRE form; DCS alias forms; quoted-text fidelity; proposition support (no machinery to test); behavior when corpus and citation disagree on subsection existence; TRJPP rule-number collision with in-text numbers.

## E. Recommended answer-support verifier (Phase F)

Build on retrieved spans (requires Phase E):

1. **Citation resolution** against `citation_aliases` → authority ID + version; subsection-aware (stop stripping `(a)(2)` — resolve to the subsection chunk; fall back to section with an explicit "subsection not resolved" warning).
2. **Existence check** against `authorities`/`chunks` (current version only), replacing the regex index.
3. **Proposition-support check:** decompose the answer into material legal propositions (sentence/claim segmentation); for each, require attachment to ≥1 retrieved chunk ID; verify the proposition against the chunk text with a constrained model call (entailment-style: supported / partially / unsupported) at low temperature; quoted strings must match corpus text verbatim (normalized whitespace).
4. **Distinguish the two failure classes in UI and logs:** *fabricated citation* (does not exist in current corpus) vs *real citation, unsupported proposition*. Today's UI collapses both into "unverified."
5. **Persist** per-citation and per-proposition results to `answer_verifications` with `corpus_build_id` and supporting chunk IDs.
6. **Block-or-refuse policy decision for the Judge:** current behavior delivers flagged answers. Recommend: unsupported *material* proposition ⇒ regenerate once with feedback; still unsupported ⇒ refusal template citing what *was* found. Existence-failures ⇒ always strip/refuse, never display a fabricated citation as plain text.

**Classification:** `citation-validator.ts` — **Adopt with revision** (keep API shape and tests; replace evidence base with DB-backed resolution; add subsection/range/TRE/alias support). `hallucination-guard.ts` — **Adopt with revision** (add proposition support; persist). `corpus-coverage.ts` — **Adopt with revision** (CODEX-ASSESSMENT notes it is not fully wired in production; re-point at manifest/DB coverage). Confidence model — **Adopt with revision** (recalibrate once support-checking exists).
