You are executing an autonomous overnight build session on BenchBook.AI, a premium judicial productivity platform for Tennessee state court judges. This is a standalone product under Velocity Venture Holdings LLC in the repo velocity-venture/benchbook-ai. You are running with full permissions and no human is monitoring. Work methodically, commit after each major milestone, and write a summary log of everything you accomplished to OVERNIGHT-LOG.md before you finish.

IMPORTANT CONSTRAINTS:
- This project is COMPLETELY SEPARATE from the BenchMark Standard project. Do not reference, read, or integrate anything from /Users/m3_ai_factory/Projects/benchmark-standard/. That is a different product.
- Do not run any external evaluation frameworks against this code.
- Your quality standard is your own engineering judgment: would a sitting Tennessee judge trust this tool in the middle of a hearing?

## STEP 0: ORIENTATION

Read these files in order before changing anything:

1. README.md
2. ARCHITECTURE.md
3. PHASE1_COMPLETE.md
4. CLAUDE_MIGRATION.md
5. app/src/app/api/chat/route.ts
6. app/.env.example

If this file exists, read it for competitive context:
7. /Users/m3_ai_factory/clawd/research/benchbook/2026-04-01-competitor-intel-learned-hand.md

Then run these commands to map the full codebase:
```
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" \) | grep -v node_modules | grep -v .next | sort
cat app/package.json
git log --oneline -20
```

Understand the full picture before touching anything.

Before making ANY changes, create a feature branch for this entire session:
```
git checkout -b remediation/overnight-2026-04-07
```
ALL commits tonight go on this branch. Do NOT commit to main. Do NOT merge to main. The owner will review and merge in the morning.

Then proceed to Step 1.

## STEP 1: SECRET ROTATION AND SECURITY AUDIT

A sitting judge's professional tool cannot ship with exposed secrets. This is non-negotiable.

1. Verify .gitignore covers: .env, .env.local, .env.production, .env.*.local, node_modules/, .next/, any *.key or *.pem files. Fix if missing.

2. Scan the full git history for leaked secrets:
```
git log -p --all -S 'sk-' -- . 2>/dev/null | head -200
git log -p --all -S 'ANTHROPIC' -- . 2>/dev/null | head -200
git log -p --all -S 'supabase' -- . 2>/dev/null | head -200
git log -p --all -S 'password' -- . 2>/dev/null | head -200
git log -p --all -S 'secret' -- . 2>/dev/null | head -200
```

3. Check if .env.local or any .env file with real values exists in the working tree. Ensure it is gitignored and never committed.

4. Audit app/.env.example. It must contain ONLY placeholder values. If any real keys are present, replace with descriptive placeholders like `your-anthropic-api-key-here`.

5. If secrets were found in git history, create SECURITY.md documenting: what was found, which commit(s), and that the owner must manually rotate those keys. Do NOT rewrite git history.

6. Commit: `git commit -am "security: audit secrets, harden .gitignore, document any exposures"`

## STEP 2: CITATION VALIDATION ENGINE

The product's citation verification currently extracts regex patterns for TCA references but returns empty sources without actually checking whether those citations exist in the loaded legal corpus. A judge cannot rely on unverified citations. Fix this.

1. Find the citation extraction/validation code. Check these locations:
   - app/src/app/api/chat/route.ts (post-processing section)
   - Any file matching: `grep -r "sources\|citation\|verify\|validate" app/src/ --include="*.ts" -l`

2. Find where the legal corpus files are loaded:
   - `grep -r "corpus\|legal\|TCA\|Title 36\|Title 37\|TRJPP\|DCS" app/src/ --include="*.ts" -l`
   - `find . -name "*.md" -path "*/corpus/*" -o -name "*.md" -path "*/legal/*" -o -name "*.txt" -path "*/corpus/*" 2>/dev/null | head -30`

3. Build or rebuild a real citation validation function:
   - Extract all TCA section references from Claude's response using regex, handling format variations (T.C.A. section 36-1-102, TCA 37-1-114, etc.)
   - Also extract TRJPP rule references and DCS policy references
   - For each extracted citation, search the loaded corpus files for a matching section
   - Return a sources array: { citation: string, verified: boolean, sourceText: string (first 200 chars of match), sourceFile: string }
   - Citations not found in corpus: verified = false

4. Integrate this into the chat API response pipeline. After Claude returns a response, run it through the validator before sending to the client.

5. If React/Next.js chat UI components exist, add visual indicators:
   - Verified citations: subtle green checkmark or highlight
   - Unverified citations: yellow warning icon with tooltip: "This citation could not be verified against the loaded legal corpus"

6. Write tests in app/src/__tests__/citations.test.ts:
   - Known valid TCA citation that exists in corpus
   - Fabricated citation that does not exist
   - Format variations (spacing, periods, section vs. subsection)

7. Commit: `git commit -am "feat: rebuild citation validation with real corpus cross-referencing"`

## STEP 3: HALLUCINATION PREVENTION

A judge making a ruling based on a hallucinated statute is a catastrophic failure. Build a guard.

1. Create app/src/lib/hallucination-guard.ts (or equivalent path matching the project's conventions):

   a. Statute verification: Extract all statute references from Claude's response, verify each exists in the corpus (reuse citation validator from Step 2). Flag anything not found.

   b. Case law detection: Scan for case citation patterns (Name v. Name, S.W.2d/3d references, etc.). Since there is no case law database, flag ALL case citations with: "Case citations cannot be verified by BenchBook. Confirm independently before relying on this reference."

   c. Confidence scoring per response:
      - HIGH: All citations verified, no unverifiable case law
      - MEDIUM: All statutes verified, but case law references present
      - LOW: One or more statute citations could not be verified
      - Display this as a visible badge on each response in the UI

   d. Update the system prompt sent to Claude with these guardrails:
      - "Only cite Tennessee statutes (TCA), TRJPP rules, and DCS policies that appear in the provided corpus context."
      - "If you are unsure whether a statute section exists, say so explicitly. Do not guess."
      - "Do not fabricate case law. If asked about case law, state that case law lookup is not yet available and recommend Westlaw or LexisNexis."
      - "Always use the format T.C.A. section [title]-[chapter]-[section] when citing statutes."

2. Integrate the guard into the API pipeline, running after citation validation.

3. Write tests:
   - Response with only valid corpus citations (HIGH confidence)
   - Response with fabricated statute (LOW confidence)
   - Response mentioning case law (MEDIUM with warnings)

4. Commit: `git commit -am "feat: add hallucination prevention guard with confidence scoring"`

## STEP 4: SMART ROUTING REFINEMENT

The Haiku/Sonnet routing must ensure complex legal questions never hit the cheaper model.

1. Find the routing logic: `grep -r "haiku\|sonnet\|model\|routing" app/src/ --include="*.ts" -l`

2. Update so these ALWAYS route to Sonnet:
   - Queries with multiple TCA section references
   - Queries about sentencing, bond schedules, or probation conditions
   - Queries referencing juvenile court (Title 37, TRJPP)
   - Queries about DCS policies or dependency/neglect
   - Queries longer than 150 words
   - Queries containing: "probable cause", "due process", "preponderance", "beyond a reasonable doubt", "best interest of the child", "sentencing", "revocation"

3. Haiku handles only:
   - Simple single-statute definition lookups
   - Short factual questions with single answers
   - Clarification of previous responses

4. Add internal logging (not user-facing) showing which model handled each query.

5. Commit: `git commit -am "refine: tighten smart routing so complex queries always use Sonnet"`

## STEP 5: SYSTEM PROMPT AND RESPONSE QUALITY

Judges need bench-ready answers, not law review articles.

1. Find the system prompt (likely in route.ts or a config file).

2. Rewrite or augment it with:
   - "You are BenchBook.AI, a judicial research assistant for Tennessee state court judges. Responses must be concise, authoritative, and immediately actionable from the bench."
   - "Structure responses: (1) Direct answer in 1-2 sentences, (2) Applicable statute with section number, (3) Key procedural requirements or elements, (4) Practical notes for bench application."
   - "Do not write academic or law-review-style analysis unless asked. Judges need answers they can act on during a hearing."
   - "Format statute citations as: T.C.A. section [title]-[chapter]-[section]"
   - "For questions with multiple approaches, present numbered options with the most common practice first."
   - "Never speculate. Either cite the specific provision or state the topic is not in your available corpus."

3. Ensure the system prompt is sent with EVERY API request, not just the first message in a conversation.

4. Commit: `git commit -am "refine: rewrite system prompt for bench-ready judicial responses"`

## STEP 6: CORPUS DOCUMENTATION AND EXPANSION PREP

1. Create corpus/README.md (or update if it exists) documenting:
   - Every file currently in the corpus directory with a one-line description
   - What is missing and needed next:
     - TCA Title 39: Criminal Offenses (assault, theft, drug offenses, DUI)
     - TCA Title 40: Criminal Procedure (bond/bail Ch. 11, sentencing Ch. 35)
     - TCA Title 55: Motor Vehicles (DUI, driving on revoked)
     - Tennessee Rules of Criminal Procedure
   - How to add new corpus files (naming convention, format, how they get loaded)

2. Create placeholder stubs for the missing titles:
   - corpus/tca-title-39-criminal-offenses.md: "# TCA Title 39: Criminal Offenses\n\nTODO: Add full text. Priority: 39-13 (Offenses Against Person), 39-14 (Property), 39-17 (Public Safety)"
   - corpus/tca-title-40-criminal-procedure.md: header and TODO
   - corpus/tca-title-55-motor-vehicles.md: header and TODO

3. If corpus loading uses a hard-coded file list, refactor it to dynamically load all .md or .txt files from the corpus directory.

4. Commit: `git commit -am "docs: document corpus contents, add expansion stubs, make loading dynamic"`

## STEP 7: UI POLISH

1. Find chat UI components: `find app/src -name "*.tsx" -o -name "*.jsx" | grep -v node_modules | sort`

2. Add or improve (if the components exist):
   - Copy to clipboard button on each response (copies as formatted text, not markdown)
   - Statute citation highlighting (bold or colored) within response text
   - Confidence badge display from Step 3
   - Loading state improvements (skeleton or spinner while Claude processes)

3. If a bench card or quick-reference feature exists, review and ensure it works. If none exists, create a simple one:
   - A sidebar or modal with common bench card categories: DUI sentencing ranges, bond schedule defaults, probation violation procedures, juvenile detention criteria
   - Each card should be a pre-built query that auto-populates the chat input

4. Commit: `git commit -am "ui: add copy button, citation highlights, confidence badges, bench cards"`

## STEP 8: DEPENDENCY AND BUILD HEALTH

1. Run `cd app && npm install` (or equivalent). Fix any dependency warnings or conflicts.
2. Run `npm run build` (or the project's build command). Fix any TypeScript errors or build failures.
3. Run any existing tests: `npm test` or `npm run test`. Fix failures.
4. Run the new tests you wrote in Steps 2 and 3.
5. If there is a linter configured, run it and fix critical issues (do not get bogged down on stylistic warnings).
6. Commit: `git commit -am "chore: fix deps, resolve build errors, pass all tests"`

## STEP 9: README AND ARCHITECTURE UPDATE

1. Update README.md:
   - Remove or correct any references to OpenAI (the migration to Claude is complete)
   - Document the current architecture accurately: Claude Sonnet/Haiku smart routing, legal corpus context loading, citation validation, hallucination guard
   - Add a "Getting Started" section with setup instructions (clone, install deps, set env vars, run dev server)
   - Add a "Corpus" section explaining what legal data is loaded and how to expand it

2. Update ARCHITECTURE.md to reflect the current state after tonight's changes. Mark the Claude migration as fully complete. Document the new citation validation and hallucination guard systems.

3. Commit: `git commit -am "docs: update README and ARCHITECTURE to reflect current state"`

## STEP 10: FINAL PUSH AND LOG

1. Run `npm run build` one final time to confirm everything compiles cleanly.
2. Run all tests one final time.
3. Write OVERNIGHT-LOG.md with:
   - Date and time range of the session
   - Summary of every change made, organized by step
   - Any issues encountered and how they were resolved
   - Any items that could not be completed and why
   - Recommended next steps for the human operator
   - Current test results (pass/fail counts)
   - List of all commits made during this session (with SHAs)
   - Diff stats: `git diff --stat main`
4. Stage and commit the log: `git commit -am "docs: add overnight session log"`
5. Push the feature branch: `git push origin remediation/overnight-2026-04-07`
6. Do NOT merge to main. Do NOT push to main. The branch is now PR-ready for morning review.

If any step fails in a way that blocks subsequent steps, document the failure in OVERNIGHT-LOG.md, skip to the next independent step, and continue. Do not stop working because one step hit a wall. Complete everything you can.
