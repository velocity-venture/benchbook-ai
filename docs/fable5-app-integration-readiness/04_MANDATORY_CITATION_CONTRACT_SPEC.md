# 04 - Mandatory Citation Contract Spec

Date: 2026-07-02
Phase: F5-02. Machine mirror: `contracts/citation_object_contract.json`.

## 1. Rule

Every answer containing a legal statement renders at least one database-verified citation. An answer that cannot produce one is converted to a refusal (doc 05). Citations are constructed from database fields, never from model output; model-claimed citations are verified against retrieval results and demoted or refused when unresolvable.

## 2. Citation object (authoritative field list)

| Field | Source | Rule |
|---|---|---|
| source_family | authority_families.family_code | One of the five authorized families |
| authority_unit_id / authority_version_id / authority_chunk_id | retrieval result | All three required for verified citations |
| canonical_citation | authority_units | The displayed citation string; never model-generated |
| normalized_citation | authority_units | For alias joins and dedupe |
| source_file_sha256 + source_path | source_files via chunk | Provenance trace |
| page_start / page_end | authority_chunks | Where available |
| display_status | authority_chunks.production_display_status | Must be a displayable value for the active tier |
| answer_scope | effective scope after family/scope resolution | general_answer_authority, limited_evidentiary_procedural (TRE), guardrail_reference_only (DCS reference cards only) |
| effectivity | version valid_from/valid_to, version_status, as_of_date used | version_status must be `current` for answer citations; label rendered to the user |
| qa_signoff_status | authority_versions | Signed-off required for the internal-QA tier per owner decision O2 |
| verification | object | See section 3 |
| environment_tier | echo | internal_qa or (future) production |

## 3. Verification levels (replaces the existence-only model)

| Level | Meaning | Effect |
|---|---|---|
| verified_retrieved | Citation corresponds to a chunk actually returned by this request's retrieval | Full verified badge |
| verified_resolved | Citation resolves via `lookup_citation_alias` but its chunk was not in the retrieval set | Allowed with "resolved, not retrieved" label; triggers a follow-up lookup to fetch the span before display, or demotion |
| unresolved | Model-claimed citation that does not resolve | Never displayed as a citation; converted to an explicit unverified warning; if the answer's only support is unresolved, convert to refusal kind `no_authority_support` with variant `citation_validation_failure` |
| out_of_universe | Resolves to a pattern for excluded titles or non-corpus material | Hard refusal path (doc 05); logged |

Proposition-level support checking remains deferred post-internal-QA (F5-01 doc 04 A5); `citation_verification_records.proposition_supported` stays null in the first integration and the UI must not imply proposition verification.

## 4. Rendering requirements (source card)

Canonical citation; family label; scope label (TRE evidentiary-scope tag, DCS reference-only tag); effectivity label with as-of date; page span; verification badge per level above; internal-QA banner tier tag. Granularity rule: display never exceeds what the database resolved (subsection claims render the parent section citation with page span).

## 5. Persistence

Every displayed citation writes one `citation_verification_records` row: citation_text, normalized_citation, alias id when resolved, exists_in_corpus, current_as_of_date, display_allowed, supporting_chunk_ids, warnings (doc 09). The chat message's persisted `sources` array stores citation objects minus `gated_chunk_passage`.

## 6. Test hooks

Mock scenarios MC-01 through MC-08 (`mock-harness/mock_citation_validation_scenarios.json`) cover: verified retrieved, verified resolved, unresolved model claim, out-of-universe claim, subsection granularity clamp, TRE scope tag, DCS reference tag, and the all-citations-unresolved refusal conversion.
