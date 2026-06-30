# Corpus Admin Pre-Reload Gate Checklist

Date: 2026-06-29

## Required before any reload planning

- Owner review has accepted the completed metadata package for planning purposes.
- E14-B patch maps are complete.
- E14-B decision registers pass local validation.
- E13-A queues still validate.
- Local metadata artifacts remain body-text free.
- E14-A or E14-B artifacts contain no prohibited body-text columns.
- Artifact scan finds no secrets or connection strings.
- No display-gate change is embedded in the artifacts.
- DCS remains guardrail/reference only.
- TRE remains limited-scope.
- Restricted Lexis remains internal QA only unless license and owner approval are separately recorded.
- Future-effective and unknown-effectivity rows remain gated.
- Owner has approved moving from local artifact work to reload planning.

## Stop conditions

- Any remote write would be required.
- Any Supabase command would be required.
- Any app code change would be required.
- Any migration change would be required.
- Any existing loader or ingestion script change would be required.
- Any source PDF or generated corpus source file would need to be changed.
- Any legal body text would need to be copied into committed artifacts.
