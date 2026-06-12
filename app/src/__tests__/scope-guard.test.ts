import { describe, expect, it } from "vitest";
import { buildScopeRefusal, detectOutOfScopeQuery } from "../lib/scope-guard";

describe("detectOutOfScopeQuery", () => {
  it("blocks explicit excluded TCA Titles", () => {
    expect(detectOutOfScopeQuery("What is assault under T.C.A. 39-13-101?")?.matchedTerms)
      .toContain("T.C.A. Title 39");
    expect(detectOutOfScopeQuery("Explain Title 40 bond procedure")?.matchedTerms)
      .toContain("T.C.A. Title 40");
    expect(detectOutOfScopeQuery("What does 55-10-401 require?")?.matchedTerms)
      .toContain("T.C.A. Title 55");
  });

  it("blocks adult criminal and traffic topics without juvenile context", () => {
    expect(detectOutOfScopeQuery("What is the sentencing range for a Class C felony?"))
      .not.toBeNull();
    expect(detectOutOfScopeQuery("Can a person drive on a revoked license?"))
      .not.toBeNull();
  });

  it("does not treat bare numbers as excluded Title references", () => {
    expect(detectOutOfScopeQuery("Must the permanency hearing be held within 40 days?"))
      .toBeNull();
    expect(detectOutOfScopeQuery("The infant was born at 39 weeks"))
      .toBeNull();
    expect(detectOutOfScopeQuery("Can the court order 55 hours of community service?"))
      .toBeNull();
    expect(detectOutOfScopeQuery("The review is set 40 days out and the child is 39 months old"))
      .toBeNull();
  });

  it("still blocks excluded Titles in statutory context", () => {
    expect(detectOutOfScopeQuery("What does Tenn. Code Ann. § 39-13-101 cover?")?.matchedTerms)
      .toContain("T.C.A. Title 39");
    expect(detectOutOfScopeQuery("Summarize TCA section 40 procedures")?.matchedTerms)
      .toContain("T.C.A. Title 40");
    expect(detectOutOfScopeQuery("Explain title 55 registration rules")?.matchedTerms)
      .toContain("T.C.A. Title 55");
  });

  it("does not block juvenile-court topics that mention delinquency or transfer", () => {
    expect(detectOutOfScopeQuery("What is the juvenile transfer standard?"))
      .toBeNull();
    expect(detectOutOfScopeQuery("What detention factors apply to a delinquent child?"))
      .toBeNull();
  });

  it("builds a refusal that names the V1 corpus boundary", () => {
    const result = detectOutOfScopeQuery("Explain T.C.A. § 40-35-101 sentencing")!;
    const refusal = buildScopeRefusal(result);
    expect(refusal).toContain("outside the V1 BenchBook.AI corpus");
    expect(refusal).toContain("T.C.A. Titles 36 and 37");
    expect(refusal).toContain("Title 39, Title 40, Title 55");
  });
});
