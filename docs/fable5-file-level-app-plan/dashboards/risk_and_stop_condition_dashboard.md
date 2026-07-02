# Risk and Stop Condition Dashboard (F5-03)

Date: 2026-07-02. Audience: owner + implementer. Risks are for the FUTURE M1 phase; F5-03 itself changed no app code and contacted no database.

## Top risks (full register: doc 14, mirror: manifests/app_code_risk_manifest.json)

| Rank | Risk | Why it matters | Front-line defense |
|---|---|---|---|
| 1 | R1 scope creep to a real backend | Would silently break the no-live-data promise | Factory enum has no non-mock member; static tests land in S2 before any feature code; SC-11 |
| 2 | R4 contract drift | Types diverging from F5-02 contracts invalidates the whole QA harness | Contract-shape drift test in the first commit; contracts amend first |
| 3 | R8 prompt drift | Confinement instructions weakening defeats no-general-fallback | SYSTEM_PROMPT_VERSION pin + element test |

## Stop conditions (canon: F5-02 doc 14, SC-1..SC-12)

Most likely to fire in M1 and what to do:

| SC | Trigger | Response |
|---|---|---|
| SC-1 | Environment echo mismatch (response claims a target the boot verdict does not) | Freeze; owner acknowledgment required to unfreeze |
| SC-2 | Any live database contact from app code | Freeze; not authorized in any M1 path |
| SC-7 | Environment banner absent on the QA page | Freeze until restored; the label IS the safety case |
| SC-10 | Guardrail scan hit on a commit diff (secret/service-role/db URL patterns) | Freeze; scrub before any further commits |
| SC-11 | Diff outside the two file maps, or a new factory enum member | Freeze; owner acknowledgment required |

## Freeze protocol (unchanged from F5-02)

Stop work, leave the branch as-is, record the trigger in the PR, notify the owner. SC-1, SC-3, SC-5, SC-11 additionally need written owner acknowledgment before unfreeze.

## F5-03 attestation

| Check | Result |
|---|---|
| App code modified | NO |
| Migrations/loader/ingestion/PDF/corpus sources modified | NO |
| Database contacted (preview or production) | NO |
| Secrets used or printed | NO |
| Package contents | Documentation, JSON design artifacts, one validator script |
