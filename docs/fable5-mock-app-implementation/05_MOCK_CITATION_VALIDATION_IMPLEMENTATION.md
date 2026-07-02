# 05 - Mock Citation Validation Implementation (F5-04 / M1)

Date: 2026-07-02

## Claim extraction

`extractCitationClaims` recognizes the synthetic corpus's citation forms: TCA-like `SYN-##-###` (with optional subsection suffixes), `TRJPP/TRE SYN-Rule ###`, and `DCS SYN-Policy ##.##`, deduplicating repeated claims. `hasOutOfUniverseClaim` separately detects excluded-title citation shapes (Titles 39/40/55 section patterns) anywhere in a generation.

## Verification levels (contract enum, MC suite)

| Level | Assigned when | Rendering |
|---|---|---|
| verified_retrieved | Claim normalizes to a chunk in THIS request's answer support | Full "verified" badge; proposition_supported=true |
| verified_resolved | Alias resolves to an in-corpus displayable row NOT in the retrieval set; metadata fetched via `getChunkMetadata`, passage never fetched (M-2 demotion) | Distinct "resolved" badge; proposition_supported=null; caps confidence at MEDIUM |
| unresolved | No resolution | Never rendered as a citation; listed in the warnings panel (MC-03) |
| out_of_universe | Excluded-title shape | Suppresses the whole answer (MC-04) |

## Hard rules

- Canonical citation strings render ONLY from fixture rows; model-drafted citation text is never displayed (MC-01/MC-03 assertions).
- Granularity clamp: subsection claims finer than fixture resolution render the parent section's canonical citation with its page span, flagged `granularity_clamped` (MC-05).
- Mandatory citations: a generation with zero verified (retrieved or resolved) citations converts to the `citation_validation_failure` refusal; the suppressed answer's hash is retained in the audit chain (MC-08, T-CIT-MISSING, RF-14, MA-04).
- Confidence honesty: HIGH only when every citation is verified_retrieved; any resolved or unresolved presence caps at MEDIUM; refusals are LOW with the standing "refusal, not a legal answer" note.
- One citation-verification audit record per rendered citation (MC-01, MA-01/MA-06).

## DCS and TRE handling at the citation layer

DCS rows become reference cards only (`reference_tag: not_controlling_authority`, scope_tag `reference_only`) and never appear in the answer-support citation list or affect confidence (MC-07). TRE citations carry the rendered `evidentiary` scope tag (MC-06).
