# Citation Alias Results

## Alias promotion

- Citation aliases promoted: 3,683
- Normalized alias collision groups: 12
- Alias candidates suppressed because of collision: 24
- Aliases generated for unresolved units: 0

## Exact lookup checks

- Internal alias join count for the audit probe: 5
- Production lookup count for the audit probe: 0

## Result

Exact citation alias resolution works against local promoted rows through an internal join. The production lookup returns zero because all promoted chunks remain pending or restricted.

This is the correct Phase E3 posture. The alias layer is present, but production citation retrieval stays closed until approval, display, and effectivity gates are satisfied.

## Remaining risk

The 12 normalized collision groups must be reviewed before production. The loader suppresses colliding aliases instead of choosing a winner.
