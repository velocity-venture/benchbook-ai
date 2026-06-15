# Open Approval Questions

These questions require owner approval before migration, load, retrieval integration, or production promotion.

1. Should the first migration dry run use a local disposable database only, or is a Supabase preview project approved?

2. Is `legal_authority` the approved schema name?

3. Is `legal_authority_stage` approved as the staging schema name?

4. May Lexis annotation, case-note, advisory comment, and research-reference material remain stored in the database if it is non-displayable and excluded from production retrieval?

5. Should any restricted chunks be excluded entirely from the first load rather than stored behind gates?

6. Should the encrypted or OCR-blocked DCS handbook be skipped in the first load, or handled after dependency and extraction approval?

7. Should current and future-effective statutory versions be loaded together but filtered by `as_of_date`?

8. Which high-risk effective-dated sections require manual signoff before production promotion?

9. Are any DCS chapters outside the staged set approved for a later load?

10. Should pgvector be enabled in the first migration, or deferred until embeddings are authorized?

11. If pgvector is enabled early, should the `embedding` column exist with null values until an embedding phase?

12. Should FTS indexes be created before first dry-run load, or after bulk load timing is measured?

13. Should DCS policy text remain excluded from production answers until document type, currency, and extraction QA are complete?

14. What roles should have internal QA access to restricted chunks?

15. Should production app access be limited to SECURITY DEFINER RPCs rather than views?

16. Should retrieval logs store short query excerpts, or only query hashes, given privacy risk?

17. What is the approved retention period for retrieval logs, answer audits, and refusal records?

18. Should answer audit records link directly to `chat_messages`, or should they remain independent and reference chat only when available?

19. Should local juvenile court rules be included in this authority schema later as court-private authority families, or handled in a separate tenant-private overlay schema?

20. What approval workflow promotes a corpus build from staged to production?

21. Who can approve production display status changes?

22. What is the approved naming convention for future migration files?

23. Should the first database load include TRE as limited-scope guardrail material, or should TRE be deferred?

24. Should the dry-run loader be allowed to write temporary local reports under `docs/`, or should reports remain untracked runtime artifacts?

25. Should any future database connection require explicit written approval in the prompt for that phase?
