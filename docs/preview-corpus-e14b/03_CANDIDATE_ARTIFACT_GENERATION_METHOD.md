# Candidate Artifact Generation Method

Date: 2026-06-29

## Method

1. Read E13-A queue CSV files.
2. Read matching E14-A template headers.
3. Add `artifact_type` and `source_queue`.
4. Preserve metadata fields from the queue.
5. Apply default E14-B candidate decision status, proposed action, proposed value, production impact, and owner escalation flag.
6. Write candidate CSV artifacts under `docs/preview-corpus-e14b/candidate-remediation-artifacts/`.
7. Write manifests and dashboards under the E14-B docs folder.

## Safety design

E14-B creates candidate metadata artifacts only. It does not apply patches, reload preview data, generate embeddings, modify the app, modify migrations, modify source PDFs, modify generated corpus source files, or open display gates.

The builder never reads source PDFs, source body files, chunk text files, page text, OCR text, or generated corpus body material.
