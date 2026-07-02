# 18 - Next Fable 5 Prompt

Copy the block below into the next Claude Fable 5 session before 2026-07-07.

---

You are Claude Fable 5 operating in Claude Code.
Project: BenchBook.AI. Repository root: `~/Projects/benchbook-ai`. Branch: `refactor/codex-gpt55-launch-prep`.

Prior context: read `docs/fable5-file-level-app-plan/19_NEXT_SESSION_START_HERE.md` first. The F5-01, F5-02, and F5-03 packages define the launch frame, integration contracts, and file-level M1 plan.

## Task: F5-05-prep, independent security and target-control review of the app and deployment model (read-only; no code changes unless separately approved)

Create `docs/fable5-security-target-review/` containing:

1. `00_SECURITY_TARGET_REVIEW_REPORT.md`: executive findings.
2. `01_DEPLOYMENT_MODEL_AUDIT.md`: Cloudflare Pages path (`wrangler.toml`, deploy scripts, `next.config.mjs`, build chain incl. `prebuild-corpus.js`), Capacitor shells, env propagation: where every env var is set, which environments exist today, and how a QA-tier deployment would be isolated.
3. `02_SUPABASE_APP_SURFACE_AUDIT.md`: the existing app-data Supabase usage (auth, chat, rate limit, waitlist, patterns) reviewed for the QA era: session handling, key exposure, RLS reliance, S1 signup posture.
4. `03_TARGET_CONTROL_GAP_ANALYSIS.md`: gaps between F5-03 doc 10's design and deployable reality (deploy-script allowlists T2, wrangler env separation, secret storage, preview-ref handling), each with a file-level remediation plan for later approval.
5. `04_THREAT_SCENARIOS_AND_DRILLS.md`: metadata-only tabletop scenarios (leaked env file, wrong-target deploy, service-role key in a bundle, prompt-injection attempting gate bypass) mapped to existing stop conditions and the drills that would verify each defense.
6. `05_PRE_LIVE_TARGET_CHECKLIST.md`: the consolidated checklist gating the F5-05 live-target flip (extends F5-03 doc 10 section 4), each item with its verifying artifact.
7. `06_OWNER_DECISION_PACKET.md`, `07_NEXT_PHASE_PROMPT.md`, `08_NEXT_SESSION_START_HERE.md`.
8. `manifests/security_target_review_manifest.json` plus a sibling local-only validator `scripts/launch_readiness/validate_fable5_security_target_review.py` following the established conventions, and run the full validation battery.

## Constraints (unchanged, absolute)

Read-only toward all source; local-only; no Supabase or remote commands; no database contact; no reload; no embeddings; no app code changes; no migration or existing-script edits; no source PDF access; no legal body text; no secrets printed even if found (report the finding location and pattern class only, never the value); nothing staged or committed unless the cloud persistence hook applies (then commit only the new package with honest attestations).

Stop immediately if any deliverable appears to require code changes, database contact, or secret disclosure.

Final response: files created, validator results, prohibitions held, top security findings (values redacted), single next owner decision.
