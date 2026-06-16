# Promotion Logic Design

## Local-only boundary

The loader refuses non-local PostgreSQL targets. Phase E3 used only a disposable local database and did not modify real Supabase migrations.

## Source files

Source files are promoted one row per unique SHA-256 value from the source manifest.

The loader preserves:

- Source file hash
- Primary source path
- Manifest paths
- DCS primary and alias paths
- Source type
- Authority family when known
- Original manifest approval status in metadata

Manifest approval value `pending_judge_approval` is not a target enum value. The loader maps it to `pending_extraction_qa` for target tables and preserves the original value in metadata.

## Source memberships

Source memberships are promoted one row per manifest path. DCS duplicate primary and alias roles are preserved. DCS chapter and document type are parsed from source paths and filenames.

## Authority units

Authority units are built from reliable identity fields only:

- Statutes use canonical citation or section identity.
- Rules use canonical citation or rule identity.
- DCS policies use canonical policy citation or policy number identity.
- DCS guides, manuals, protocols, and other rows without policy identity become controlled unresolved units.

The loader does not invent legal citations. Unresolved units have null citation identity fields and metadata marker `identity_status = unresolved`.

## Authority versions

Versions are built per authority unit, source file, version status, and effective label.

Effective-date parsing now uses the leading `Effective on` or `Effective until` label, not incidental later text. Unknown effectivity remains QA-required rather than guessed.

## Authority chunks

Chunks preserve:

- Source chunk identity
- Original source chunk identity when duplicated
- Source hash
- Source path
- Page span
- Chunk type
- Text hash
- Approval status
- Corpus designation
- Production display status
- Retrieval gate
- Answer scope
- Warning codes

Duplicate source chunk identifiers are not discarded. The loader creates occurrence-stable local identifiers and records the original duplicate source chunk ID in metadata.

## Citation aliases

Aliases are generated only for resolved units. The loader suppresses normalized aliases that collide across multiple authority units. No aliases are generated for unresolved authority units.

## Warnings

Chunk-level extraction warnings are promoted to `chunk_warnings`. Global extraction warnings are promoted to `extraction_warnings` with source-file linkage when available.

## Audit reconstruction

The loader inserts one local no-generation retrieval log, answer audit record, and citation verification record. The audit path reconstructs from answer audit record to retrieval log, returned chunk, version, unit, source file, source hash, and corpus build without storing answer text.
