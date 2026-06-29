# Owner Approval Scope

Date: 2026-06-29

## Approved for E13-B

- Read repository files and E13-A review queues.
- Verify the preview target.
- Run metadata-only read-only SQL against the linked preview project.
- Store SQL and runtime outputs in `/tmp`.
- Create local documentation under `docs/preview-retrieval-citation-e13b/`.
- Leave all files unstaged and uncommitted.

## Not approved

- Remote writes.
- Corpus row loading.
- Embeddings.
- App integration.
- Display-gate relaxation.
- Production display.
- Production Supabase access.
- App code changes.
- Migration changes.
- Loader script changes.
- Source PDF changes.
- Titles 39, 40, or 55.
- Web retrieval.
- Secrets, credential material, connection details, body passages, source passages, page text, OCR text, or long excerpts in output.

## Scope conclusion

E13-B stayed inside the approved read-only preview QA lane.
