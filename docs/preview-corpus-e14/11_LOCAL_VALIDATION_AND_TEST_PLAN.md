# Local Validation And Test Plan

Date: 2026-06-29

## Required local commands

Run these commands from the repository root:

```bash
python3 scripts/metadata_qa/validate_e13a_review_queues.py
python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_phase_e14a_static_validation.json
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e14a_local_target_promotion.json
python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py
```

## Local-only requirements

- Static validation must not print body text.
- Local dry run must refuse non-local database targets.
- Local dry run must drop the disposable database after execution.
- The E14-A validator must not import Supabase libraries.
- The E14-A validator must not connect to a database.
- The E14-A validator must not read source PDFs or generated corpus body text.

## Expected gate results

| Gate | Expected result |
|---|---|
| E13-A queue validator | Pass |
| Static validation metadata-only | true |
| Static validation body text printed | false |
| Local disposable DB dry run | Local only, dropped after run |
| Displayable view count | 0 |
| Restricted in displayable view | 0 |
| Pending in displayable view | 0 |
| DCS production eligible | 0 |
| TRE non-limited scope | 0 |
| Future-effective exposed before effective date | 0 |
| Populated embeddings | 0 |
| E14-A draft artifact validator | Pass |

## Stop conditions

Stop and document if validation needs a remote database, Supabase command, database credential, token, privileged role key, app code change, migration change, existing loader edit, existing ingestion edit, source PDF change, generated corpus source edit, body text, or embedding generation.
