# Metadata Remediation Test Plan

Date: 2026-06-29

## Purpose

This plan defines local checks that must pass before any preview reload, app integration, embeddings, or display-gate discussion.

## Required static tests

| Test | Expected result |
|---|---|
| V1 family scope check | Only Title 36, Title 37, TRJPP, TRE limited-scope, DCS guardrail/reference, and optional private local rules when later approved |
| Forbidden titles check | Titles 39, 40, and 55 absent |
| Duplicate chunk IDs | Zero duplicate production source chunk IDs after loader mapping |
| Citation alias collisions | Zero collision groups |
| Prohibited body-passage queue fields | Zero prohibited queue columns |
| Secret-shaped patterns in queues | Zero matches |
| Static validator | Passes without printing body passages |

## Required local dry-run tests

| Test | Expected result |
|---|---|
| Disposable database target | Local only |
| Disposable database cleanup | Dropped after run |
| Displayable rows | 0 |
| Black-letter displayable rows | 0 |
| Pending QA in displayable view | 0 |
| Restricted rows in displayable view | 0 |
| DCS production eligible | 0 |
| DCS answer scope | Guardrail/reference only |
| TRE non-limited scope | 0 |
| Unknown effectivity displayable | 0 |
| Future-effective display before effective date | 0 |
| QA signoff required | 439 until remediated |
| Embeddings populated | 0 |
| App integration | Absent |

## Required commands

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_phase_e13a_static_validation.json
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e13a_local_target_promotion.json
python3 scripts/metadata_qa/validate_e13a_review_queues.py
```

## Stop conditions

Stop if a test requires remote access, Supabase access, app changes, embeddings, migration changes, existing loader script changes, source PDF changes, or printing legal body passages.
