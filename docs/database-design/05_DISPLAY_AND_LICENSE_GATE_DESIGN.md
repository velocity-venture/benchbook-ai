# Display And License Gate Design

## Rule

Do not assume annotations, case notes, advisory comments, research references, or editorial material may be displayed in production. They may exist in the database with a restricted display status, but retrieval and answer generation must enforce that restriction.

## Display Status Values

Recommended values:

- `pending_extraction_qa`
- `displayable_black_letter`
- `displayable_policy_text`
- `restricted_pending_license_review`
- `internal_qa_only`
- `excluded_from_production`

Production answer retrieval should use only approved rows with a displayable status.

## Content Classes

| Content class | Default storage | Default production answer use |
|---|---|---|
| Black-letter statute text | stored in `authority_chunks` | excluded until approved, then allowed |
| Black-letter rule text | stored in `authority_chunks` | excluded until approved, then allowed |
| Tennessee Rules of Evidence | stored separately scoped | allowed only for evidentiary/procedural questions after approval |
| DCS policy text | stored in DCS chunk types | staged, excluded until extraction and policy approval |
| DCS protocols, guides, manuals, work aids | stored by document type | staged, excluded until approval and scope review |
| Advisory comments | stored as `advisory_comment` | restricted pending license/display review |
| Lexis annotations | stored as `annotation_candidate` | restricted pending license review |
| Case notes | stored as `case_note_candidate` | restricted pending license review |
| Research references | stored as restricted metadata or annotation candidate | restricted pending license review |
| History | stored as `history` | not answer authority unless approved for limited context |

## Retrieval Gates

Production retrieval should require all of these:

- `approval_status = approved_for_production`
- `production_display_status in ('displayable_black_letter', 'displayable_policy_text')`
- valid as-of-date version
- allowed answer scope
- allowed authority family and corpus designation

Restricted chunks should be invisible to production answer retrieval even if they match exact citation, FTS, or vector search.

## Internal QA-Only Use

Internal QA can query restricted rows to verify segmentation and licensing decisions. That access should be service-role or internal-role only. QA output must avoid long source-body excerpts in committed artifacts.

Internal QA retrieval must write audit records with:

- requester or service identity
- purpose
- restricted chunk IDs accessed
- reason
- timestamp

## Black-Letter Only Mode

Black-letter only mode should enforce:

- `chunk_type = black_letter_text`
- statute and rule families only unless a DCS-specific mode is explicitly selected
- no history
- no annotations
- no case notes
- no advisory comments
- no research references

This mode should be the default for high-risk statutory questions.

## DCS Policy Display

DCS material is not Lexis annotation material, but Phase C marked it `pending_extraction_qa`. It should remain excluded from production answers until:

- extraction QA passes
- DCS document type is confirmed or explicitly accepted as unknown
- duplicate memberships are verified
- policy currency is reviewed
- the Judge approves the corpus designation for production

## Future License-Enabled Path

If a future license permits display of advisory comments, annotations, case notes, or research references:

1. Add a license decision record with date, authority, allowed classes, and limits.
2. Promote only the allowed chunk types, not every restricted row.
3. Update views and retrieval filters to include the newly allowed status.
4. Add tests showing restricted classes remain blocked unless the license flag is active.
5. Log every answer that uses newly enabled material.

The schema should support this path, but the default must remain restrictive.

## Refusal Behavior

If retrieval finds only restricted material and no displayable support, the system should refuse or state that the currently approved corpus does not provide displayable support. It should not answer from restricted text.

Log this in `refusal_records` with `refusal_kind = restricted_display_only`.

