# Citation Alias Lookup QA

Date: 2026-06-29

## Alias safety counts

| Check | Count |
|---|---:|
| Citation aliases | 3,598 |
| Duplicate normalized alias collision groups | 0 |
| Forbidden Title 39, 40, or 55 alias metadata matches | 0 |

## Lookup probes

| Probe | Result rows |
|---|---:|
| Fixed safe alias probe | 0 |
| Existing-alias probe | 0 |
| Existing alias available for probe | 1 |

The existing-alias probe selected one normalized alias internally but did not print the alias text. The production lookup returned zero rows because no authority is approved for production display.

## Alias target metadata

Alias target display-status counts are not additive because an alias can target an authority unit with multiple chunks.

| Target display status | Distinct aliases with target chunks |
|---|---:|
| `pending_extraction_qa` | 3,595 |
| `restricted_pending_license_review` | 2,364 |

| Authority family | Aliases |
|---|---:|
| `dcs_policies_procedures` | 304 |
| `tca_title_36` | 1,500 |
| `tca_title_37` | 1,467 |
| `tenn_rules_evidence` | 192 |
| `tenn_rules_juvenile_practice_procedure` | 135 |

## Conclusion

Citation alias lookup remains safe for preview QA. Aliases exist for later review, but production lookup returns zero rows while display gates remain closed.
