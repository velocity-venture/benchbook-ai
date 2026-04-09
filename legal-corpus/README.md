# BenchBook.AI Legal Corpus

This directory contains the authoritative legal source materials loaded into BenchBook.AI's context window for Tennessee judicial research.

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
| `local-rules/` | Court-specific local rules (currently empty) |

## What's Missing — Priority Expansion

### HIGH PRIORITY (Criminal/General Sessions)
- **TCA Title 39: Criminal Offenses** — assault (39-13), theft/property (39-14), public safety/drugs (39-17), DUI (39-17-418)
- **TCA Title 40: Criminal Procedure** — bond/bail (Ch. 11), sentencing (Ch. 35), probation (Ch. 36)
- **TCA Title 55: Motor Vehicles** — DUI (55-10-401+), driving on revoked (55-50-504)
- **Tennessee Rules of Criminal Procedure** — arraignment, discovery, trial, sentencing

### MEDIUM PRIORITY
- **TCA Title 29: Mental Health** — involuntary commitments, judicial review
- **TCA Title 33: Mental Health/Substance Abuse** — commitment procedures
- **Tennessee Rules of Evidence** — admissibility, hearsay, privileges

### LOWER PRIORITY
- **TCA Title 16: Courts** — jurisdiction, administrative procedures
- **TCA Title 24: Witnesses** — competency, privileges
- Federal constitutional references commonly applied in TN courts

## How to Add New Corpus Files

### Naming Convention
- TCA titles: `tca/title-NN.html` (raw HTML from Public.Resource.Org or official source)
- Rules: `rules/[ruleset-name]/all-rules.txt` (plain text compilation)
- Policies: `dcs/chapNN-NN.NN.pdf` (official DCS policy PDFs)
- Local rules: `local-rules/[county]-[court-type].txt`

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
