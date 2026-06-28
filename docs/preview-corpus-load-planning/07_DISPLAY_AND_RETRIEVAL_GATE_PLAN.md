# Display And Retrieval Gate Plan

## Required gate posture

Preview corpus loading, if later approved, must not make any row production-displayable.

Required results after any approved E10 load:

| Gate | Required result |
|---|---:|
| `v_current_displayable_chunks` | 0 |
| `v_black_letter_current_chunks` | 0 |
| Restricted chunks in displayable views | 0 |
| Pending QA chunks in displayable views | 0 |
| DCS production-eligible chunks | 0 |
| TRE non-limited chunks | 0 |
| Future-effective versions visible before effective date | 0 |
| Unknown-effectivity rows production-eligible | 0 |

## Retrieval posture

Preview retrieval testing should remain disabled unless separately approved. If exact-citation or search functions are tested in a future phase, tests must show that display gates prevent judge-facing results from restricted, pending QA, unknown-effectivity, or future-effective rows.

## Required E10 checks

E10 must define and, if approved to execute, run checks for:

- target verification before every remote command;
- no production project;
- row-count before and after;
- displayable view count remains 0;
- restricted chunks do not appear in displayable views;
- pending QA chunks do not appear in displayable views;
- DCS production-eligible count remains 0;
- TRE limited-scope count equals TRE chunk count;
- future-effective visibility check passes;
- unknown-effectivity rows remain QA-gated;
- RLS and policy checks pass;
- no embeddings;
- no app integration;
- rollback or cleanup plan remains ready.

## Audit rule

E10 should preserve an audit trail of commands without secrets, passwords, access tokens, service-role keys, database URLs, or connection strings.
