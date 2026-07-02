# Corpus Gate Test Matrix

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E9 planning only

No gate test in this file was run against a remote database in E9. This matrix defines stop conditions for a future owner-approved E10 preview corpus-load dry run.

## Gate matrix

| Test | Purpose | Expected result | Failure implication | Stop condition | Rollback needed | Blocks promotion |
|---|---|---|---|---|---|---|
| Target project verification | Prevent production or wrong-preview execution | target is `benchbook-ai`, ref `clerihqbjyczarqkiqnb` | remote action may hit wrong project | yes | no if before writes | yes |
| Production exclusion | Prevent contact with `benchbook-ai-prod` | project is not production, ref is not `suiylfayvjsjtbrsjrwx` | production exposure risk | yes | no if before writes | yes |
| Owner approval check | Confirm remote writes are authorized | written approval names allowed action | execution exceeds authority | yes | no if before writes | yes |
| Schema baseline | Confirm E8 foundation exists | required schemas, tables, views, functions, RLS present | loader may fail or bypass gates | yes | no if before writes | yes |
| Migration-history caveat acknowledgment | Avoid false confidence in migration ledger | operator records caveat before relying on history | schema state may be misunderstood | yes | no if before writes | yes |
| Pre-load corpus counts | Confirm clean or expected baseline | corpus tables zero unless prior dry-run batch documented | duplicate or mixed batches likely | yes | maybe | yes |
| Staging counts | Confirm raw data staged completely | 677 manifest, 6,590 chunks, 864 warnings, 12 dedup groups | incomplete or overbroad load | yes | yes | yes |
| Target promotion counts | Confirm mapping completeness | 647 source files, 1,321 units, 1,343 versions, 6,590 chunks | load did not match local proof | yes | yes | yes |
| Duplicate chunk ID check | Prevent duplicate retrieval sources | zero duplicate source chunk ID groups | answer audit may be ambiguous | yes | yes | yes |
| Citation alias collision check | Prevent misleading citation lookup | zero normalized alias collisions | citation search could map to wrong authority | yes | yes | yes |
| Displayable view count | Preserve zero-display preview | `v_current_displayable_chunks` count is 0 | preview corpus may become user-visible | yes | yes | yes |
| Black-letter display count | Preserve no production-answer corpus | `v_black_letter_current_chunks` count is 0 | black-letter answers may cite unapproved rows | yes | yes | yes |
| Internal QA restricted count | Confirm rows are gated | `v_internal_qa_restricted_chunks` count is 6,590 | rows may be missing or wrongly visible | yes | yes | yes |
| Pending QA exclusion | Keep unreviewed extraction out of display | pending extraction QA count in displayable view is 0 | unverified extraction may be shown | yes | yes | yes |
| Restricted content exclusion | Keep license-restricted rows out of display | restricted-pending-license count in displayable view is 0 | restricted content may be exposed | yes | yes | yes |
| DCS guardrail-only check | Preserve DCS non-answerable posture | DCS production-eligible count is 0 | DCS may be treated as answer authority | yes | yes | yes |
| TRE limited-scope check | Preserve evidentiary and procedural limits | 533 TRE rows limited-scope, 0 broader scope | TRE may imply broad juvenile-law coverage | yes | yes | yes |
| Future-effective check | Prevent premature display | future-effective visible-before-date count is 0 | users may see not-yet-effective law as current | yes | yes | yes |
| Unknown-effectivity check | Prevent uncertain law display | unknown-effectivity displayable count is 0 | users may rely on uncertain authority | yes | yes | yes |
| RLS enabled check | Preserve privacy boundary | all legal authority and stage tables have RLS enabled | direct access may exceed intended policies | yes | maybe | yes |
| Policy inventory check | Prevent broad table exposure | no broad `authority_chunks` read policy | app users may bypass display views | yes | maybe | yes |
| Audit storage check | Preserve no-answer-text audit model | answer audit reconstruction has no answer-text column | sensitive user questions or answers may be stored | yes | maybe | yes |
| Embedding absence check | Preserve no vector retrieval in preview | no populated embeddings | preview could imply retrieval readiness | yes | yes | yes |
| App integration absence | Preserve non-user-facing dry run | no app config or code consumes preview corpus | users may see unapproved corpus | yes | maybe | yes |
| Rollback marker or batch id | Make cleanup auditable | dry-run batch id recorded for inserted rows where possible | cleanup and review become ambiguous | yes | maybe | yes |

## Owner decision gates

An E10 preview corpus-load dry run should not proceed unless the owner has approved:

1. remote writes to preview;
2. the exact target project and ref;
3. the load method;
4. the allowed row categories;
5. the zero-display outcome;
6. the rollback or retained-batch plan;
7. the rule that any stop condition ends the run.

## E9 conclusion

The matrix treats display safety as a hard gate, not a cleanup task. If a future E10 load cannot keep displayable counts at zero throughout the run, it should stop and roll back.
