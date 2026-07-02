# Citation Alias Collision Review

## E3 issue

Phase E3 found 12 normalized citation alias collision groups. The collisions were caused by bare rule-number aliases that could refer to both TRE and TRJPP rules.

Examples by metadata pattern:

- `101` could mean TRE 101 or TRJPP 101.
- `201` could mean TRE 201 or TRJPP 201.
- `401` could mean TRE 401 or TRJPP 401.

## Fix implemented

The local loader no longer generates bare rule-number aliases for rule families.

Family-qualified aliases remain available through source aliases such as TRE or TRJPP forms. Unresolved and document-anchored rows do not receive citation aliases.

## Verification

- E3 normalized alias collision groups: 12
- E3 alias candidates suppressed by collision: 24
- E4 normalized alias collision groups: 0
- E4 alias candidates suppressed by collision: 0
- E4 citation aliases promoted: 3,598
- Production lookup count for audit probe: 0 because gates remain closed

## Result

Unsafe alias insertions are eliminated locally. Ambiguous bare rule-number aliases remain intentionally suppressed.
