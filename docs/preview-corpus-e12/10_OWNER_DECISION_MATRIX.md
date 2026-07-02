# Owner Decision Matrix

Date: 2026-06-28

| Decision | Recommended owner choice | Why it matters | Required before change |
|---|---|---|---|
| Keep retained preview batch | Keep for E12-B read-only QA | Enables retrieval and citation QA without another load | Written approval for next phase |
| Authorize E12-B read-only retrieval/citation QA | Yes, after reviewing E12-A | Tests retrieval behavior while gates stay closed | No display gates, no embeddings, no app integration |
| Authorize metadata-only row-level queues | Yes | Gives corpus admin actionable work without body text exposure | Confirm queue format and reviewer role |
| Allow any DCS rows to become production-answer authority | Not yet | DCS remains guardrail/reference-only and production eligible zero | Separate owner decision after source verification |
| Keep restricted Lexis material internal-only | Yes | Avoids restricted editorial or case-note display risk | License/display review before any change |
| Exclude unknown-effectivity rows until resolved | Yes | Prevents uncertain current-law statements | Corpus-admin effectivity signoff |
| Keep pending extraction QA rows non-displayable | Yes | Prevents unreviewed text from reaching judges | Extraction QA and owner approval |
| Defer app integration | Yes | Preview corpus is not production-ready | E12-B and blocker remediation first |
| Generate embeddings | No | Embeddings imply retrieval readiness before QA is complete | Separate approved phase only |
| Open display gates | No | Displayable count must remain zero | Separate production-readiness approval only |

## Bottom line

The safest next owner decision is to keep the retained gated preview batch and approve E12-B read-only retrieval and citation QA. Production display, app integration, embeddings, and DCS production-answer authority should remain deferred.
