# Unresolved Identity Remediation

## E3 issue

Phase E3 found 273 unresolved authority units and 1,164 unresolved chunks.

Most unresolved rows were DCS non-policy documents, including protocols, guides, manuals, work aids, handbooks, FAQs, and other non-policy materials.

## Fix implemented

Phase E4 did not invent citations or policy numbers.

The loader now separates DCS identity into three categories:

- `resolved`: statute, rule, or DCS policy identity is reliable.
- `document_anchored`: DCS non-policy material has reliable source path and document type, but no policy citation.
- `unresolved`: source metadata is still insufficient for a safe identity.

DCS filename-derived titles are now preserved for non-policy documents to improve source-document identity. Those titles are not treated as legal citations.

## After counts

- Resolved chunks: 5,423
- Document-anchored chunks: 1,146
- Unresolved chunks: 21
- Document-anchored units: 130
- Unresolved units: 17

## Remaining unresolved chunks

- DCS policies and procedures: 20 chunks
- Tennessee Rules of Evidence: 1 chunk

By chunk type:

- Metadata: 9
- Unknown: 11
- Annotation candidate: 1

## Result

Unresolved identity was materially reduced while preserving the no-invented-citation rule. Document-anchored DCS rows remain guardrail-only and non-production-answerable.
