/**
 * Corpus Coverage Reporting for BenchBook.AI
 *
 * The legal corpus is uneven. Title 37 and Title 36 are fully populated.
 * Titles outside the V1 scope are treated as unavailable. TRJPP
 * coverage stops at the rules represented in the loaded text. DCS coverage
 * is the policies that have been extracted to text.
 *
 * Citation verification answers "does this citation exist in our corpus."
 * Coverage reporting answers a different question: "is this citation in a
 * region of law our corpus actually covers, or are we silently citing into
 * outside V1?" A response that cites Title 39 today will appear unverified
 * because the section does not exist in the index, but the user does not
 * learn that the underlying problem is corpus scope, not a fabricated
 * citation. Coverage reporting fills that gap.
 */
import type { CitationIndex, VerifiedCitation } from "./citation-validator";

/**
 * Coverage status for a Title, rule range, or policy chapter:
 *   'covered'  - meaningful section count loaded from real source text
 *   'stub'     - this region is unavailable or too sparse for launch reliance
 *   'absent'   - no entry for this region in the corpus at all
 */
export type CoverageStatus = "covered" | "stub" | "absent";

/**
 * Per-Title coverage facts for TCA. titleNum is the TCA Title number
 * ("37", "36"). sectionCount is the number of distinct sections found
 * in the loaded corpus for that Title.
 */
export interface TCATitleCoverage {
  titleNum: string;
  status: CoverageStatus;
  sectionCount: number;
  exampleSections: string[];
}

/**
 * Per-Title coverage facts for TRJPP and DCS share the same shape:
 * a region label plus item count.
 */
export interface RegionCoverage {
  region: string;
  status: CoverageStatus;
  itemCount: number;
  exampleItems: string[];
}

export interface CorpusCoverageReport {
  generatedAt: string;
  tca: {
    titleCoverage: TCATitleCoverage[];
    totalSections: number;
    knownStubTitles: string[];
  };
  trjpp: RegionCoverage;
  dcs: RegionCoverage;
  /** Aggregate health summary suitable for a one-line UI banner. */
  summary: string;
}

/**
 * Titles 39 (criminal offenses), 40 (criminal procedure), and 55 (motor
 * vehicles and traffic) are intentionally outside the V1 closed universe.
 * Keep them enumerated so citations into those titles get clear warnings
 * rather than being mistaken for verified V1 authority.
 *
 * Do not populate these titles for V1.
 */
export const KNOWN_STUB_TITLES: readonly string[] = ["39", "40", "55"];

/**
 * Threshold below which a Title with non-zero sections is still treated
 * as effectively a stub. Calibrated to the operator's expectations: a
 * fully populated Title typically holds dozens of sections; under five
 * is suspicious enough to warn on.
 */
const SPARSE_TITLE_THRESHOLD = 5;

/**
 * Maximum example items to include in a coverage report region. Kept
 * small so the report fits in a UI panel without truncation.
 */
const MAX_EXAMPLES_PER_REGION = 5;

/**
 * Build a coverage report from a CitationIndex previously produced by
 * buildCitationIndex(). The index tells us what was actually parsed out
 * of the loaded corpus text, which is the only honest measure of what
 * the system can verify against.
 */
export function buildCoverageReport(index: CitationIndex): CorpusCoverageReport {
  const titleBuckets = new Map<string, string[]>();
  for (const section of index.tcaSections) {
    const titleNum = section.split("-")[0];
    if (!titleBuckets.has(titleNum)) {
      titleBuckets.set(titleNum, []);
    }
    titleBuckets.get(titleNum)!.push(section);
  }

  const titleCoverage: TCATitleCoverage[] = [];
  for (const [titleNum, sections] of titleBuckets) {
    const status: CoverageStatus = KNOWN_STUB_TITLES.includes(titleNum)
      ? "stub"
      : sections.length < SPARSE_TITLE_THRESHOLD
        ? "stub"
        : "covered";
    titleCoverage.push({
      titleNum,
      status,
      sectionCount: sections.length,
      exampleSections: sections.slice(0, MAX_EXAMPLES_PER_REGION),
    });
  }

  for (const stub of KNOWN_STUB_TITLES) {
    if (!titleBuckets.has(stub)) {
      titleCoverage.push({
        titleNum: stub,
        status: "stub",
        sectionCount: 0,
        exampleSections: [],
      });
    }
  }

  titleCoverage.sort((a, b) => a.titleNum.localeCompare(b.titleNum, undefined, { numeric: true }));

  const trjppRules = Array.from(index.trjppRules);
  const trjpp: RegionCoverage = {
    region: "TRJPP",
    status:
      trjppRules.length === 0
        ? "absent"
        : trjppRules.length < SPARSE_TITLE_THRESHOLD
          ? "stub"
          : "covered",
    itemCount: trjppRules.length,
    exampleItems: trjppRules.slice(0, MAX_EXAMPLES_PER_REGION),
  };

  const dcsPolicies = Array.from(index.dcsPolicies);
  const dcs: RegionCoverage = {
    region: "DCS",
    status:
      dcsPolicies.length === 0
        ? "absent"
        : dcsPolicies.length < SPARSE_TITLE_THRESHOLD
          ? "stub"
          : "covered",
    itemCount: dcsPolicies.length,
    exampleItems: dcsPolicies.slice(0, MAX_EXAMPLES_PER_REGION),
  };

  const totalSections = index.tcaSections.size;
  const coveredTitles = titleCoverage.filter((t) => t.status === "covered").map((t) => t.titleNum);

  let summary: string;
  if (coveredTitles.length === 0) {
    summary = "Corpus is empty or stubs only. Verification will fail for any citation.";
  } else {
    const titleList = coveredTitles.join(", ");
    summary = `Corpus covers TCA Title(s) ${titleList} (${totalSections} sections), TRJPP (${trjpp.itemCount} rules), and DCS (${dcs.itemCount} policies). V1 excludes statewide criminal, criminal procedure, and motor vehicle titles.`;
  }

  return {
    generatedAt: new Date().toISOString(),
    tca: {
      titleCoverage,
      totalSections,
      knownStubTitles: [...KNOWN_STUB_TITLES],
    },
    trjpp,
    dcs,
    summary,
  };
}

/**
 * Coverage scope of a specific citation:
 *   'covered'  - the citation falls within a well-populated region
 *   'stub'     - the citation falls within a known-stub region
 *   'unknown'  - the citation type is unrecognized for coverage purposes (case law)
 *
 * Note this is independent of whether the citation was *verified* by the
 * citation-validator. A citation can be verified-and-covered (best),
 * unverified-and-stub (corpus gap, not hallucination), or
 * unverified-and-covered (likely fabrication, since the region is well
 * populated and the section is missing).
 */
export type CitationCoverageScope = "covered" | "stub" | "unknown";

/**
 * Determine the coverage scope of a single citation. Pure function: takes
 * the parsed citation type and identifier plus the coverage report.
 */
export function classifyCitationScope(
  citation: VerifiedCitation,
  coverage: CorpusCoverageReport,
): CitationCoverageScope {
  if (citation.type === "TCA") {
    const sectionNum = citation.citation.replace(/^.*§\s*/, "").replace(/\s*$/, "");
    const titleNum = sectionNum.split("-")[0];
    const titleEntry = coverage.tca.titleCoverage.find((t) => t.titleNum === titleNum);
    if (!titleEntry) return "stub";
    return titleEntry.status === "covered" ? "covered" : "stub";
  }
  if (citation.type === "TRJPP") {
    return coverage.trjpp.status === "covered" ? "covered" : "stub";
  }
  if (citation.type === "DCS") {
    return coverage.dcs.status === "covered" ? "covered" : "stub";
  }
  return "unknown";
}

/**
 * VerifiedCitation augmented with coverage scope and an optional
 * human-readable warning. The original VerifiedCitation is not mutated.
 */
export interface VerifiedCitationWithCoverage extends VerifiedCitation {
  coverageScope: CitationCoverageScope;
  coverageWarning?: string;
}

/**
 * Attach coverage scope and warnings to a list of verified citations.
 * Coverage warnings are returned for citations where the result is
 * meaningful to surface in the UI:
 *
 *   - Unverified citation in a covered region: this is the strongest
 *     signal of fabrication and gets a clear warning.
 *   - Unverified citation in a stub region: the citation may be real;
 *     the corpus does not cover this region. Different warning.
 *   - Verified citation in a covered region: no warning.
 *   - Case law (CASELAW or LOCAL): no coverage warning; the existing
 *     citation-validator warning already covers them.
 */
export function annotateCoverage(
  citations: VerifiedCitation[],
  coverage: CorpusCoverageReport,
): VerifiedCitationWithCoverage[] {
  return citations.map((c) => {
    const scope = classifyCitationScope(c, coverage);
    let warning: string | undefined;

    if (c.type === "CASELAW" || c.type === "LOCAL") {
      warning = undefined;
    } else if (!c.verified && scope === "stub") {
      warning = `${c.citation} could not be verified. The corpus does not cover this region (${c.type === "TCA" ? "Title " + c.citation.replace(/^.*§\s*/, "").split("-")[0] : c.type}). The citation may be valid, but BenchBook cannot confirm it.`;
    } else if (!c.verified && scope === "covered") {
      warning = `${c.citation} could not be verified. This region of the corpus is well populated, so a missing section is more likely a fabrication than a corpus gap.`;
    } else {
      warning = undefined;
    }

    return { ...c, coverageScope: scope, coverageWarning: warning };
  });
}

/**
 * One-line summary of coverage health, suitable for a system prompt or
 * a UI banner. Does not include sensitive corpus internals; safe to
 * expose to the user.
 */
export function coverageSummaryLine(coverage: CorpusCoverageReport): string {
  return coverage.summary;
}
