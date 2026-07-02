# Citation Alias And Duplicate Checks

Date: 2026-06-28

## Integrity checks

| Check | Count |
|---|---:|
| Duplicate source chunk ID groups | 0 |
| Citation alias collision groups | 0 |
| Citation aliases | 3,598 |

## Citation lookup gate

The production citation lookup probe returned zero rows:

| Probe | Count |
|---|---:|
| `lookup_citation_alias(...)` | 0 |

The zero result is expected because no rows are approved for production display.

## Conclusion

Duplicate source chunk IDs and unsafe citation alias collisions remain remediated. Citation aliases exist for internal QA, but production lookup remains gated.
