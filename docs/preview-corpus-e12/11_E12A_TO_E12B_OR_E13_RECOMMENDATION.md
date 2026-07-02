# E12-A To E12-B Or E13 Recommendation

Date: 2026-06-28

## Recommended path: E12-B

Approve E12-B for read-only preview retrieval and citation QA.

Allowed scope should be:

- read-only preview retrieval and citation probes;
- no remote writes;
- no display gates opened;
- no embeddings;
- no app integration;
- no production access;
- no source text printed;
- no staging or committing unless separately requested.

Why this is the right next step:

- E11 proved the retained preview batch is gated.
- E12-A organized the remaining blockers.
- Retrieval and citation behavior still need QA before any app planning.
- E12-B can test retrieval posture without changing the corpus.

## Alternative path: E13

Approve E13 only if the owner wants local metadata QA remediation planning or implementation before retrieval QA.

E13 should remain local-only unless separately approved. It should focus on:

- unresolved identity remediation;
- effectivity metadata cleanup;
- DCS document-type and policy identity review;
- restricted-content disposition;
- corpus-admin review queue preparation.

## Not recommended yet

Do not proceed yet to:

- app integration;
- embedding generation;
- production display;
- DCS production-answer authority;
- production Supabase access.
