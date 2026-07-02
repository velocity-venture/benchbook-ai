# 04 - Citation Integrity and Alias Audit

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration (read-only)

## 1. Current citation integrity architecture

Two generations of citation handling exist in the repository:

**Generation 1 (shipping app, Stack A):** `app/src/lib/citation-validator.ts` verifies that a cited section number exists somewhere in the flat-string corpus. Known limits, already on record from the architecture review: existence-only (no proposition support), subsection stripping, no ranges, no TRE handling, never blocks a response. It is the wrong evidence base and is scheduled for re-pointing, not deletion, because its API and tests are sound.

**Generation 2 (closed-universe pipeline, Stack B):** citation integrity is structural:

- `authority_units.canonical_citation` and `normalized_citation` carry identity.
- `citation_aliases` (3,598 rows) map user-facing citation forms to units/versions/chunks with `normalized_alias` and `alias_kind`.
- `lookup_citation_alias()` resolves aliases only through display and as-of-date gates.
- `citation_verification_records` is designed to store per-citation verdicts per answer: exists_in_corpus, current_as_of_date, display_allowed, proposition_supported, supporting_chunk_ids.

## 2. Verified facts (recorded QA evidence)

| Check | Result | Source |
|---|---|---|
| Citation alias count | 3,598 | E13B gate table |
| Alias collision count | 0 | E12B/E13B alias QA and static validation |
| Alias production-lookup probes | 0 rows for every family (gates closed, correct) | E13B doc 06 |
| Duplicate chunk ID count | 0 (post E4 remediation) | static validation baseline |
| Unresolved identity rows queued | 17 units, 21 chunks | E13A queue, E14B candidates |

## 3. Alias-layer risks to burn down before internal QA

| # | Risk | Disposition |
|---|---|---|
| A1 | **Unresolved identity rows (38).** Units lacking canonical citation, policy number, or rule number can produce answers whose source cards cannot be cited properly. All 38 are quarantined by metadata; corpus-admin review (E14C) decides resolve vs exclude. This is a hard citation blocker for internal QA display of the affected rows only, not for the corpus as a whole. |
| A2 | **Alias coverage is untested against judge phrasing.** 0 collisions proves cleanliness, not coverage. The golden-query plan (doc 11) includes alias-form probes (with and without section symbols, spacing variants, TRJPP vs Tenn. R. Juv. P. forms). Coverage gaps become E15+ alias additions, which are metadata patches, not schema changes. |
| A3 | **Subsection-level citation resolution is out of scope for V1 lookup.** `lookup_citation_alias` resolves to unit/version/chunk granularity. Responses citing a subsection must carry the parent section citation with page span. The app contract (doc 07, C5) requires displaying the exact granularity the database can prove, nothing finer. |
| A4 | **Case-law citations remain structurally unverifiable.** Nothing in the corpus can verify case citations. The refusal matrix (doc 10) requires case-law citation requests to return the no-authority pattern with the existing "cannot verify case law" language. Restricted Lexis case-note chunks must never leak into this path (they are non-displayable). |
| A5 | **Proposition support is not yet computable.** `citation_verification_records.proposition_supported` has no producer yet. For internal QA launch, this field is allowed to be null with `display_allowed` still enforced; proposition-support checking is a deferred post-internal-QA item and is listed as such in the readiness manifest. |

## 4. Citation display contract (what a source card must show at internal QA)

For any displayed authority, the app must render, from database fields only:

1. Canonical citation (from `authority_units`), never a model-generated citation string.
2. Authority family label and answer scope (statute, juvenile rule, evidence rule limited-scope, DCS reference-only).
3. Version effectivity label and as-of date used for retrieval.
4. Verified badge only when the citation resolved through `lookup_citation_alias` or the chunk arrived through `search_displayable_chunks`.
5. Page span (page_start/page_end) for provenance.
6. QA-tier banner: internal QA content must be labeled "INTERNAL QA - NOT FOR JUDICIAL RELIANCE" (doc 07, C12).

Model-claimed citations that do not resolve through the alias RPC must render as unverified warnings or trigger refusal per doc 10, category by category.

## 5. Actions queued (no action taken in this pass)

1. E14C corpus-admin review of the 38 identity rows (owner decision O1 gates this).
2. Alias-form probe set built into the golden-query harness (doc 11, section 4).
3. RPC or app-layer scope filter decision for TRE (G1 in doc 03) recorded before display gates open.
4. Written owner ruling on black-letter display of Lexis-exported statute text (O4) before any `displayable_black_letter` promotion.
