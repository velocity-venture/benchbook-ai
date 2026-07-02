// T4 (F5-04 / M1): MC-01..MC-08 plus the mandatory-citation failure
// (T-CIT-MISSING). Scenario canon: scenarios/
// mock_citation_validation_scenarios.json (checksum-locked to F5-02).

import { describe, expect, it } from "vitest";
import { runQuery } from "./support/harness";
import {
  extractCitationClaims,
  verifyGeneration,
} from "../../lib/qa-research/citation-verifier";
import { createMockRetrievalAdapter } from "../../lib/qa-research/mock-retrieval-adapter";
import fixtures from "../../lib/qa-research/mock-fixtures.json";
import type { ChunkResult } from "../../lib/qa-research/types";

const FIXTURE_ROWS = fixtures.chunks as unknown as ChunkResult[];

describe("MC citation validation scenarios", () => {
  it("MC-01: a citation of a retrieved chunk verifies as verified_retrieved with a record written", async () => {
    const { sse, sink } = await runQuery(
      {},
      { query: "What does T.C.A. SYN-37-901 provide?" }
    );
    const citations = sse.first("citations").citations;
    expect(citations[0].verification.level).toBe("verified_retrieved");
    const records = sink
      .entries()
      .filter((e) => e.kind === "citation_verification_records");
    expect(records.length).toBe(citations.length);
  });

  it("MC-02: an in-corpus citation outside the retrieval set demotes to verified_resolved", async () => {
    const { sse } = await runQuery(
      { profile: "cites_adjacent_authority" },
      { query: "What does the lantern festival permit require?" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    const citations = sse.first("citations").citations;
    expect(citations.length).toBe(1);
    expect(citations[0].verification.level).toBe("verified_resolved");
    expect(citations[0].normalized_citation).toBe("SYN-37-905");
    // Never the full verified badge: display_allowed but not
    // proposition_supported (M-2 demotion policy).
    expect(citations[0].verification.proposition_supported).toBeNull();
    expect(sse.first("confidence").value).toBe("MEDIUM");
  });

  it("MC-03: a citation-shaped string that does not resolve renders as a warning, not a citation", async () => {
    const answerSupport = FIXTURE_ROWS.filter(
      (r) => r.authority_chunk_id === "SYNCHUNK-37-901"
    );
    const outcome = await verifyGeneration({
      answerText:
        "SYNTHETIC MIXED ANSWER: supported by T.C.A. SYN-37-901 (SYNTHETIC) and also SYN-99-999.",
      answerSupport,
      knownRows: answerSupport,
      adapter: createMockRetrievalAdapter(),
      asOfDate: "2026-07-02",
      environmentTier: "mock",
    });
    expect(outcome.verifiedRetrievedCount).toBe(1);
    expect(outcome.unresolvedCount).toBe(1);
    expect(outcome.warnings[0].claim).toContain("SYN-99-999");
    expect(
      outcome.citations.some((c) => c.normalized_citation === "SYN-99-999")
    ).toBe(false);
  });

  it("MC-04: an excluded-title citation in the generation is suppressed with zero leakage", async () => {
    const { sse } = await runQuery(
      { profile: "cites_excluded_title" },
      { query: "What does the lantern festival permit require?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_kind).toBe("safety_guardrail");
    expect(refusal.stage).toBe("post_generation");
    expect(sse.byName("delta")).toEqual([]);
    expect(JSON.stringify(sse.events)).not.toContain("39-13-101");
  });

  it("MC-05: a subsection claim clamps to the parent section with its page span", async () => {
    const { sse } = await runQuery(
      { profile: "cites_subsection" },
      { query: "What does T.C.A. SYN-37-901 provide?" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    const citation = sse.first("citations").citations[0];
    expect(citation.granularity_clamped).toBe(true);
    expect(citation.canonical_citation).toBe("T.C.A. SYN-37-901 (SYNTHETIC)");
    expect(citation.page_start).toBe(12);
    expect(citation.page_end).toBe(14);
  });

  it("MC-06: a verified TRE citation carries the rendered evidentiary scope tag", async () => {
    const { sse } = await runQuery(
      {},
      { query: "Is the hearsay statement admissible here?" }
    );
    const citation = sse.first("citations").citations[0];
    expect(citation.scope_tag).toBe("evidentiary");
    const source = sse.first("sources")[0];
    expect(source.scope_tag).toBe("evidentiary");
  });

  it("MC-07: DCS reference cards ride alongside a statute answer without counting toward confidence", async () => {
    const { sse } = await runQuery(
      {
        adapterOptions: {
          injectOutOfFilterFamilies: ["dcs_policies_procedures"],
        },
      },
      { query: "lantern policy schedule" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    const payload = sse.first("citations");
    expect(payload.reference_material.length).toBeGreaterThanOrEqual(1);
    for (const ref of payload.reference_material) {
      expect(ref.source_family).toBe("dcs_policies_procedures");
      expect(ref.reference_tag).toBe("not_controlling_authority");
    }
    expect(
      payload.citations.some(
        (c: { source_family: string }) =>
          c.source_family === "dcs_policies_procedures"
      )
    ).toBe(false);
    // All answer citations verified_retrieved, so confidence stays HIGH:
    // reference cards contribute nothing.
    expect(sse.first("confidence").value).toBe("HIGH");
  });

  it("MC-08: a generation whose every citation is unresolved converts to refusal with the answer suppressed", async () => {
    const { sse, sink } = await runQuery(
      { profile: "fabricates_citation" },
      { query: "What does the lantern festival permit require?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_variant).toBe("citation_validation_failure");
    expect(sse.byName("delta")).toEqual([]);
    const answerAudit = sink
      .entries()
      .find((e) => e.kind === "answer_audit_records");
    expect(answerAudit).toBeDefined();
    expect((answerAudit!.entry as { answer_suppressed: boolean }).answer_suppressed).toBe(true);
  });

  it("T-CIT-MISSING: a citationless generation never reaches the user as an answer", async () => {
    const { sse } = await runQuery(
      { profile: "injection_compliant" },
      { query: "What does the lantern festival permit require?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_variant).toBe("citation_validation_failure");
    expect(refusal.refusal_kind).toBe("no_authority_support");
    expect(sse.first("done").response_class).toBe("REFUSE_NO_AUTHORITY");
    expect(sse.byName("delta")).toEqual([]);
  });

  it("claim extraction dedupes repeated citations and preserves subsection suffixes", () => {
    const claims = extractCitationClaims(
      "See SYN-37-901 and again SYN-37-901, plus SYN-37-901(b)(2)."
    );
    expect(claims.length).toBe(2);
    expect(claims.map((c) => c.subsection)).toContain("(b)(2)");
  });
});
