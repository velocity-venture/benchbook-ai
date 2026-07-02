# Pending Extraction QA Workflow

Date: 2026-06-29

## Queue file

- `review-queues/pending_extraction_qa_summary.csv`

## Counts

| Item | Result |
|---|---:|
| Pending extraction QA chunks | 4198 |
| Priority bucket distribution | high priority: 1193, low priority: 846, medium priority: 64, needs effective-date review: 81, needs source verification: 2014 |

## Priority buckets

- High priority: black-letter statutory or rule rows and rows with high-risk juvenile or family-law metadata cues.
- Medium priority: remaining likely useful authority rows after high-priority review.
- Low priority: history, metadata, unknown, guide, or work-aid rows that do not appear production-ready from metadata.
- Restricted by license: handled in the restricted Lexis queue.
- Needs source verification: DCS rows requiring source currency and identity review.
- Needs effective-date review: rows tied to future or unknown effective-date signals.

## Workflow

1. Verify source-file linkage and hash integrity.
2. Review Title 36, Title 37, and TRJPP black-letter rows before support material.
3. Resolve effectivity warnings before any display approval.
4. Keep history, metadata, and unknown chunks out of answer authority unless specifically approved.
5. Require corpus-admin or owner signoff before any row moves toward production display.
