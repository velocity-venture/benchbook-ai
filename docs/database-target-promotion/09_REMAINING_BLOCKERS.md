# Remaining Blockers

## Blockers before production load

- Duplicate source chunk IDs: 117 duplicate IDs affect 234 rows. The local target run preserved all rows with occurrence-stable IDs, but upstream chunk ID generation must be corrected.
- Unresolved authority identity: 273 units and 1,164 chunks do not have reliable statute, rule, or DCS policy identity. They must remain unresolved or be manually mapped. Do not invent citations.
- Citation alias collisions: 12 normalized alias groups collide across authority units. Phase E3 suppressed 24 alias candidates. These need review before production alias lookup.
- Unknown effectivity: 18 versions and 48 chunks remain `unknown_effectivity`. They require human QA before production use.
- Approval gates: all promoted chunks are still pending or restricted. No promoted chunks should be production-answer eligible yet.

## Non-blocking confirmations

- Missing source file linkage for chunks: 0
- Future-effective versions visible before July 1, 2026: 0
- DCS production-eligible chunks: 0
- TRE chunks outside limited evidentiary procedural scope: 0
- Restricted chunks in production display view: 0

## Production posture

The Phase E3 target promotion is not a production corpus load. It is a successful local dry run with closed gates and explicit blockers.
