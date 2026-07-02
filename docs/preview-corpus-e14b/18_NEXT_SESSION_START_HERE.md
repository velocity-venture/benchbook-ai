# Next Session Start Here

## Current posture

E14-B created local candidate metadata remediation artifacts. They are not applied to any corpus, app, database, migration, source PDF, generated corpus source file, or embedding workflow.

## Start commands

```bash
pwd
git branch --show-current
git status --short
python3 scripts/metadata_qa/validate_e13a_review_queues.py
python3 scripts/metadata_qa/validate_e14a_draft_artifacts.py
python3 scripts/metadata_qa/validate_e14b_candidate_artifacts.py
find docs/preview-corpus-e14 docs/preview-corpus-e14b scripts/metadata_qa -type f | sort
```

## Recommended next decision

Approve E14-C local corpus-admin review simulation. Do not approve preview reload execution yet.
