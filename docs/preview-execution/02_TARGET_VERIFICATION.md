# Target Verification

## Approved Target

Approved Supabase preview target: `benchbook-ai`.

Approved project ref: `clerihqbjyczarqkiqnb`.

Forbidden production target: `benchbook-ai-prod`.

Forbidden production project ref: `suiylfayvjsjtbrsjrwx`.

## Verification History

The initial Codex-run E8 package stopped because the local environment could not verify an authenticated Supabase preview target. At that time, the Supabase CLI was not available to Codex, no approved remote connection string was available, and no remote command was run.

After commit `c7ddf13`, owner-approved execution resumed manually through Mac Terminal. The Supabase CLI was available there, and target verification ultimately succeeded through CLI project list and link verification.

## Final Target Verification

| Check | Result |
|---|---|
| Linked Supabase target | `benchbook-ai` |
| Linked project ref | `clerihqbjyczarqkiqnb` |
| Forbidden production target identified | `benchbook-ai-prod` |
| Forbidden production project ref identified | `suiylfayvjsjtbrsjrwx` |
| `benchbook-ai-prod` touched | no |
| Production Supabase touched | no |

## Verification Finding

The verified linked target was the approved preview project `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`.

The forbidden production project `benchbook-ai-prod`, project ref `suiylfayvjsjtbrsjrwx`, was not touched.

## Continuing Rule

Any later remote command must again verify:

- The linked target is `benchbook-ai`.
- The project ref is `clerihqbjyczarqkiqnb`.
- The target is not `benchbook-ai-prod`.
- The project ref is not `suiylfayvjsjtbrsjrwx`.

Do not print tokens, passwords, service-role keys, database URLs, or connection strings in docs or logs.
