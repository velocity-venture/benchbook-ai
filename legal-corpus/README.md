# BenchBook.AI Legal Corpus

This directory contains the authoritative legal source materials loaded into BenchBook.AI's V1 closed corpus for Tennessee Juvenile and Family Court research.

## Current Contents

### TCA (Tennessee Code Annotated)
| File | Description | Size |
|------|-------------|------|
| `tca/title-36.html` | Domestic Relations (custody, divorce, adoption, parentage) | ~5.9MB |
| `tca/title-37.html` | Juveniles (courts, proceedings, placement, DCS) | ~2.2MB |

### TRJPP (Tennessee Rules of Juvenile Practice and Procedure)
| File | Description |
|------|-------------|
| `trjpp/all-rules.txt` | Complete compilation of all TRJPP rules |
| `trjpp/rule-NNN.txt` | Individual rules (101-310) for granular access |

### DCS (Department of Children's Services) Policies
| File | Description |
|------|-------------|
| `dcs/chap14-*.pdf` | Chapter 14: Investigations (abuse, neglect, removal) |
| `dcs/chap16-*.pdf` | Chapter 16: Foster Care (placement, home study) |
| `dcs/chap9-9.5.pdf` | Chapter 9: Case Planning |

### Local Rules
| File | Description |
|------|-------------|
| `local-rules/` | Optional court-specific local juvenile rules. This folder is currently empty, and any future upload must remain private to the subscribing court. |

## V1 Scope Lock

BenchBook.AI V1 is not a broad criminal, traffic, or case-management product. Do not add the following to the V1 generated corpus:

- T.C.A. Title 39
- T.C.A. Title 40
- T.C.A. Title 55
- Tennessee Rules of Criminal Procedure

Placeholder files for those topics may exist for future planning, but they are excluded from V1 builds and should not be described as active coverage.

## How to Add New Corpus Files

### Naming Convention
- TCA titles: `tca/title-NN.html` (raw HTML from Public.Resource.Org or official source). V1 only includes Titles 36 and 37.
- Rules: `rules/[ruleset-name]/all-rules.txt` (plain text compilation)
- Policies: `dcs/chapNN-NN.NN.pdf` (official DCS policy PDFs)
- Local rules: `local-rules/[county]-[court-type].txt`, stored and served only for the authorized subscribing court

### Build Process
1. Place the file in the appropriate subdirectory
2. Run `node scripts/prebuild-corpus.js` to regenerate the bundled JSON
3. The prebuild script automatically:
   - Extracts text from HTML files (strips tags)
   - Reads `.txt` files directly
   - Skips PDFs (these need pre-extraction to `.txt` format)
4. The generated `app/src/lib/legal-corpus-data.json` is what gets deployed

### Format Requirements
- HTML files: standard HTML with legal text in body
- Text files: UTF-8, plain text, section headers clearly marked
- PDFs: must be text-extractable (not scanned images)

### Size Considerations
- Cloudflare Workers has a 25MB compressed script limit
- Current corpus is ~6MB uncompressed (~1.5MB compressed)
- Budget: approximately 15MB more of raw legal text can be added
- For very large additions, consider Cloudflare R2 storage with runtime fetching
