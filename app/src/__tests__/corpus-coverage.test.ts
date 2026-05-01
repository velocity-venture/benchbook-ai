import { describe, it, expect } from "vitest";
import {
  buildCitationIndex,
  verifyCitations,
  type VerifiedCitation,
} from "../lib/citation-validator";
import {
  buildCoverageReport,
  classifyCitationScope,
  annotateCoverage,
  coverageSummaryLine,
  KNOWN_STUB_TITLES,
} from "../lib/corpus-coverage";

const SAMPLE_TCA_37 = `
Title 37 Juveniles
37-1-101. Purpose.
37-1-102. Definitions.
37-1-103. Jurisdiction.
37-1-114. Detention criteria.
37-1-129. Disposition of delinquent child.
37-1-130. Disposition of unruly child.
§ 37-1-150. Records.
§ 37-1-151. Confidentiality.
§ 37-1-152. Sealing.
§ 37-1-153. Expungement.
`;

const SAMPLE_TCA_36 = `
Title 36 Domestic Relations
§ 36-1-102. Definitions.
36-6-101. Custody jurisdiction.
36-6-106. Custody factors.
36-6-108. Relocation.
36-6-110. Visitation.
`;

const SAMPLE_TRJPP = `
RULE 101: Title.
RULE 114: Detention hearings.
RULE 206: Transfer hearings.
RULE 301: Adjudicatory hearings.
RULE 308: Disposition hearings.
RULE 401: Appeals.
`;

const SAMPLE_DCS = `
=== DCS Policy: chap14-14.12.pdf ===
Policy 14.12: Investigation.
Policy 14.13: Reports.
=== DCS Policy: chap16-16.7.pdf ===
Policy 16.7: Home study.
Policy 16.8: Placement criteria.
Policy 16.9: Permanency planning.
`;

describe("buildCoverageReport", () => {
  it("classifies a populated TCA Title as covered", () => {
    const index = buildCitationIndex(SAMPLE_TCA_37, SAMPLE_TCA_36);
    const report = buildCoverageReport(index);
    const title37 = report.tca.titleCoverage.find((t) => t.titleNum === "37");
    expect(title37).toBeDefined();
    expect(title37!.status).toBe("covered");
    expect(title37!.sectionCount).toBeGreaterThanOrEqual(5);
  });

  it("includes known stub Titles even when their section count is zero", () => {
    const index = buildCitationIndex(SAMPLE_TCA_37);
    const report = buildCoverageReport(index);
    for (const stub of KNOWN_STUB_TITLES) {
      const entry = report.tca.titleCoverage.find((t) => t.titleNum === stub);
      expect(entry, `stub Title ${stub} must appear in coverage report`).toBeDefined();
      expect(entry!.status).toBe("stub");
    }
  });

  it("sorts TCA Titles numerically, not lexically", () => {
    const corpus = SAMPLE_TCA_37 + SAMPLE_TCA_36;
    const index = buildCitationIndex(corpus);
    const report = buildCoverageReport(index);
    const titleNums = report.tca.titleCoverage.map((t) => t.titleNum);
    const sortedNumerically = [...titleNums].sort((a, b) =>
      parseInt(a, 10) - parseInt(b, 10),
    );
    expect(titleNums).toEqual(sortedNumerically);
  });

  it("counts TRJPP rules accurately", () => {
    const index = buildCitationIndex(undefined, undefined, SAMPLE_TRJPP);
    const report = buildCoverageReport(index);
    expect(report.trjpp.status).toBe("covered");
    expect(report.trjpp.itemCount).toBe(6);
  });

  it("flags an empty TRJPP region as absent", () => {
    const index = buildCitationIndex(SAMPLE_TCA_37);
    const report = buildCoverageReport(index);
    expect(report.trjpp.status).toBe("absent");
    expect(report.trjpp.itemCount).toBe(0);
  });

  it("flags a sparse TRJPP region (under threshold) as stub", () => {
    const sparseTrjpp = `RULE 101: Title.\nRULE 114: Detention.\n`;
    const index = buildCitationIndex(undefined, undefined, sparseTrjpp);
    const report = buildCoverageReport(index);
    expect(report.trjpp.status).toBe("stub");
  });

  it("counts DCS policies and surfaces examples", () => {
    const index = buildCitationIndex(undefined, undefined, undefined, SAMPLE_DCS);
    const report = buildCoverageReport(index);
    expect(report.dcs.status).toBe("covered");
    expect(report.dcs.itemCount).toBeGreaterThanOrEqual(5);
    expect(report.dcs.exampleItems.length).toBeLessThanOrEqual(5);
  });

  it("produces a non-empty summary line whenever any region is covered", () => {
    const index = buildCitationIndex(SAMPLE_TCA_37, SAMPLE_TCA_36, SAMPLE_TRJPP, SAMPLE_DCS);
    const report = buildCoverageReport(index);
    const summary = coverageSummaryLine(report);
    expect(summary).toContain("TCA");
    expect(summary).toContain("TRJPP");
    expect(summary).toContain("DCS");
    expect(summary).toContain("V1 excludes");
  });

  it("produces an explicit empty-corpus summary when nothing is loaded", () => {
    const index = buildCitationIndex();
    const report = buildCoverageReport(index);
    expect(coverageSummaryLine(report)).toMatch(/empty|stubs only/i);
  });
});

describe("classifyCitationScope", () => {
  const corpus = SAMPLE_TCA_37 + SAMPLE_TCA_36 + SAMPLE_TRJPP + SAMPLE_DCS;
  const index = buildCitationIndex(SAMPLE_TCA_37, SAMPLE_TCA_36, SAMPLE_TRJPP, SAMPLE_DCS);
  const coverage = buildCoverageReport(index);

  it("classifies TCA Title 37 citation as covered", () => {
    const cite = verifyCitations("T.C.A. § 37-1-114 applies.", index, corpus)[0];
    expect(classifyCitationScope(cite, coverage)).toBe("covered");
  });

  it("classifies TCA Title 39 citation as stub (known stub Title)", () => {
    const fakeCite: VerifiedCitation = {
      title: "T.C.A. § 39-13-101",
      citation: "T.C.A. § 39-13-101",
      type: "TCA",
      verified: false,
      snippet: "",
    };
    expect(classifyCitationScope(fakeCite, coverage)).toBe("stub");
  });

  it("classifies TCA Title 40 citation as stub (known stub Title)", () => {
    const fakeCite: VerifiedCitation = {
      title: "T.C.A. § 40-35-101",
      citation: "T.C.A. § 40-35-101",
      type: "TCA",
      verified: false,
      snippet: "",
    };
    expect(classifyCitationScope(fakeCite, coverage)).toBe("stub");
  });

  it("classifies TRJPP citation as covered when corpus is well populated", () => {
    const cite = verifyCitations("TRJPP Rule 114 applies.", index, corpus)[0];
    expect(classifyCitationScope(cite, coverage)).toBe("covered");
  });

  it("classifies DCS citation as covered when corpus is well populated", () => {
    const cite = verifyCitations("DCS Policy 14.12 applies.", index, corpus)[0];
    expect(classifyCitationScope(cite, coverage)).toBe("covered");
  });

  it("classifies case law as unknown for coverage purposes", () => {
    const cite = verifyCitations("State of Tennessee v. Smith holds.", index, corpus)[0];
    expect(classifyCitationScope(cite, coverage)).toBe("unknown");
  });
});

describe("annotateCoverage", () => {
  const corpus = SAMPLE_TCA_37 + SAMPLE_TCA_36 + SAMPLE_TRJPP + SAMPLE_DCS;
  const index = buildCitationIndex(SAMPLE_TCA_37, SAMPLE_TCA_36, SAMPLE_TRJPP, SAMPLE_DCS);
  const coverage = buildCoverageReport(index);

  it("emits a stub-region warning for an unverified citation in a stub Title", () => {
    const fakeCite: VerifiedCitation = {
      title: "T.C.A. § 39-13-101",
      citation: "T.C.A. § 39-13-101",
      type: "TCA",
      verified: false,
      snippet: "",
    };
    const annotated = annotateCoverage([fakeCite], coverage);
    expect(annotated[0].coverageScope).toBe("stub");
    expect(annotated[0].coverageWarning).toBeDefined();
    expect(annotated[0].coverageWarning!).toMatch(/does not cover/i);
    expect(annotated[0].coverageWarning!).toMatch(/may be valid/i);
  });

  it("emits a likely-fabrication warning for an unverified citation in a covered Title", () => {
    const response = "See T.C.A. § 37-99-999 for the rule."; // section does not exist in the index
    const citations = verifyCitations(response, index, corpus);
    const annotated = annotateCoverage(citations, coverage);
    const target = annotated.find((c) => c.citation === "T.C.A. § 37-99-999");
    expect(target).toBeDefined();
    expect(target!.coverageScope).toBe("covered");
    expect(target!.coverageWarning).toBeDefined();
    expect(target!.coverageWarning!).toMatch(/well populated|fabrication/i);
  });

  it("does not emit a coverage warning for a verified citation in a covered region", () => {
    const citations = verifyCitations("T.C.A. § 37-1-114 applies.", index, corpus);
    const annotated = annotateCoverage(citations, coverage);
    const target = annotated.find((c) => c.citation === "T.C.A. § 37-1-114");
    expect(target).toBeDefined();
    expect(target!.verified).toBe(true);
    expect(target!.coverageWarning).toBeUndefined();
  });

  it("does not emit a coverage warning for case law (existing citation-validator warning covers it)", () => {
    const citations = verifyCitations("Smith v. Jones holds.", index, corpus);
    const annotated = annotateCoverage(citations, coverage);
    const caseCite = annotated.find((c) => c.type === "CASELAW");
    expect(caseCite).toBeDefined();
    expect(caseCite!.coverageWarning).toBeUndefined();
  });

  it("preserves all original VerifiedCitation fields under annotation", () => {
    const citations = verifyCitations("T.C.A. § 37-1-114 applies.", index, corpus);
    const annotated = annotateCoverage(citations, coverage);
    const target = annotated.find((c) => c.citation === "T.C.A. § 37-1-114")!;
    expect(target.title).toBe("T.C.A. § 37-1-114");
    expect(target.type).toBe("TCA");
    expect(target.verified).toBe(true);
    expect(target.snippet.length).toBeGreaterThan(0);
  });
});

describe("KNOWN_STUB_TITLES", () => {
  it("includes the three known stub Titles from the project briefing", () => {
    expect(KNOWN_STUB_TITLES).toContain("39");
    expect(KNOWN_STUB_TITLES).toContain("40");
    expect(KNOWN_STUB_TITLES).toContain("55");
  });
});
