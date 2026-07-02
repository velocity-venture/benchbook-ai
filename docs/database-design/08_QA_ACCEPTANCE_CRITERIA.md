# QA Acceptance Criteria

## Design Acceptance

The Phase D design is acceptable when:

- all required tables are represented in draft SQL or documented equivalent
- draft SQL is outside `supabase/migrations/`
- no existing migrations are modified
- no database connection is required
- no corpus text is committed in long excerpts
- restricted material is hard-gated
- current and future-effective versions are separate
- DCS duplicate handling preserves all source paths
- TRE limited scope is queryable
- retrieval supports exact citation, FTS, future vector, metadata filters, reranking, and black-letter-only mode
- audit tables cover retrieval, answer, citation verification, and refusals

## Future Load Dry-Run Acceptance

A future dry-run load should pass these checks before any production load:

| Check | Acceptance |
|---|---|
| source hash verification | 100 percent of selected sources match manifest hash |
| chunk count | equals Phase C summary unless explicitly documented |
| chunk ID uniqueness | no duplicate IDs with conflicting text hash |
| text hash verification | 100 percent match |
| source traceability | every chunk maps to source file, source path, source hash, build, and page span where available |
| citation alias collisions | reviewed and resolved |
| restricted chunks | zero restricted chunks in production display views |
| effective versions | all flagged units mapped to separate authority versions |
| DCS duplicates | alias paths preserved; duplicate chunks not inserted |
| TRE scope | every TRE row has limited or guardrail answer scope |
| warning preservation | source and chunk warnings loaded and count-reconciled |
| embeddings | null until approved embedding phase |

## Version Effectivity QA

Required tests:

- current-law query before future effective date returns only current version
- future-law query returns future version only when explicitly requested
- as-of query after effective date returns successor version
- current/future pair reports "other effective version exists" metadata
- high-risk sections have manual QA signoff
- no overlap in version date ranges unless approved
- no future-effective chunk appears in black-letter current mode before its date

## Display Gate QA

Required tests:

- `annotation_candidate` excluded from production answer retrieval
- `case_note_candidate` excluded from production answer retrieval
- `advisory_comment` excluded until approved
- research references excluded
- DCS pending extraction QA excluded
- internal QA can report restricted counts without exposing long source text
- exact citation lookup cannot bypass display gates
- FTS cannot bypass display gates
- vector search cannot bypass display gates

## Retrieval QA

Required tests:

- exact citation lookup returns the expected authority unit
- citation aliases normalize common user formats
- FTS retrieves only allowed chunks after filters
- semantic retrieval, when enabled, respects metadata filters
- authority-aware reranking prefers exact citation and current black-letter text
- black-letter-only mode excludes history, comments, notes, annotations, DCS guides, and unknown chunks
- TRE results are answerable only for evidence/procedure questions
- DCS chapter filter returns chunks through membership records
- duplicate DCS source paths do not produce duplicate answer support

## Audit QA

Required tests:

- every answer has a `corpus_build_id`
- every retrieval attempt writes a retrieval log
- refused pre-generation requests write refusal records
- citation verification records persist all cited authorities
- answer audit records include model, prompt package hash, retrieved chunk IDs, displayed citation IDs, and trust metadata
- source path, source hash, page span, pipeline version, chunk text hash, and build version are reconstructable from an answer audit

## Blocking Conditions

Do not move to production load if any of these are true:

- migrations would need to be edited retroactively
- production views expose restricted chunks
- future-effective statutory text can be returned as current law
- any loaded chunk lacks source hash traceability
- any chunk text hash fails verification
- DCS duplicates lose alias-path membership
- TRE scope is not represented in the database
- retrieval logs cannot reconstruct the support package used for an answer

