// T2 (F5-04 / M1): MR-01..MR-10 through the real route with injected
// mock adapter/model/audit deps. Scenario canon: scenarios/
// mock_retrieval_scenarios.json (checksum-locked to F5-02).

import { describe, expect, it } from "vitest";
import {
  auditKinds,
  buildHarness,
  qaRequest,
  parseSse,
  runQuery,
  TEST_AS_OF_DATE,
} from "./support/harness";
import { createMockRetrievalAdapter } from "../../lib/qa-research/mock-retrieval-adapter";
import type { LegalRetrievalAdapter } from "../../lib/qa-research/retrieval-adapter";

describe("MR retrieval scenarios", () => {
  it("MR-01: exact citation hit answers with verified_retrieved citations", async () => {
    const { sse, sink } = await runQuery(
      {},
      { query: "What does T.C.A. SYN-37-901 provide?" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    const citations = sse.first("citations").citations;
    expect(citations.length).toBeGreaterThanOrEqual(1);
    for (const c of citations) {
      expect(c.verification.level).toBe("verified_retrieved");
      expect(c.canonical_citation).toContain("SYNTHETIC");
    }
    expect(auditKinds(sink)).toEqual([
      "retrieval_logs",
      "answer_audit_records",
      "citation_verification_records",
    ]);
  });

  it("MR-02: topical full-text query returns multiple displayable rows and answers", async () => {
    const { sse } = await runQuery(
      {},
      { query: "What are the orchard harvest rules?" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    expect(sse.first("coverage").answer_support_count).toBe(3);
    for (const c of sse.first("citations").citations) {
      expect(c.verification.level).toBe("verified_retrieved");
    }
  });

  it("MR-03: exact plus full-text paths merge without duplicate chunks", async () => {
    const { sse } = await runQuery(
      {},
      { query: "How does T.C.A. SYN-37-903 treat the lantern procession?" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    const ids = sse
      .first("citations")
      .citations.map((c: { authority_chunk_id: string }) => c.authority_chunk_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("MR-04: evidentiary intent admits TRE rows into answer support with the evidentiary tag", async () => {
    const { sse } = await runQuery(
      {},
      { query: "Is the hearsay statement admissible here?" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    const citations = sse.first("citations").citations;
    expect(citations.length).toBeGreaterThanOrEqual(1);
    for (const c of citations) {
      expect(c.source_family).toBe("tenn_rules_evidence");
      expect(c.scope_tag).toBe("evidentiary");
    }
  });

  it("MR-05: an injected TRE row is dropped from a general-intent request and the drop is logged", async () => {
    const { sse } = await runQuery(
      {
        adapterOptions: { injectOutOfFilterFamilies: ["tenn_rules_evidence"] },
      },
      { query: "What is the rule for the harbor seal schedule?" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    const citations = sse.first("citations").citations;
    expect(
      citations.filter(
        (c: { source_family: string }) => c.source_family === "tenn_rules_evidence"
      )
    ).toEqual([]);
    expect(sse.first("coverage").drops.length).toBeGreaterThanOrEqual(1);
  });

  it("MR-06: DCS rows divert to the reference envelope; response class REFERENCE", async () => {
    const { sse } = await runQuery(
      {},
      { query: "What does DCS policy say about placement visit scheduling?" }
    );
    const done = sse.first("done");
    expect(done.response_class).toBe("REFERENCE");
    expect(done.model_called).toBe(false);
    const coverage = sse.first("coverage");
    expect(coverage.answer_support_count).toBe(0);
    expect(coverage.reference_material_count).toBe(2);
    for (const ref of sse.first("citations").reference_material) {
      expect(ref.reference_tag).toBe("not_controlling_authority");
      expect(ref.scope_tag).toBe("reference_only");
    }
  });

  it("MR-07: zero results yield a mandatory no-authority refusal with no model call", async () => {
    const { sse, sink } = await runQuery(
      { profile: "not_called" },
      { query: "What about the moonlit regatta?" }
    );
    const done = sse.first("done");
    expect(done.response_class).toBe("REFUSE_NO_AUTHORITY");
    expect(done.model_called).toBe(false);
    expect(sse.first("refusal").refusal_kind).toBe("no_authority_support");
    expect(sse.byName("delta")).toEqual([]);
    expect(auditKinds(sink)).toEqual(["retrieval_logs", "refusal_records"]);
  });

  it("MR-08: adapter failure fails closed with a retrieval_error refusal and audit intact", async () => {
    const { sse, sink } = await runQuery(
      { profile: "not_called", adapterOptions: { failMode: "throw_on_search" } },
      { query: "What are the orchard harvest rules?" }
    );
    const done = sse.first("done");
    expect(done.response_class).toBe("REFUSE_NO_AUTHORITY");
    expect(done.model_called).toBe(false);
    expect(sse.first("refusal").refusal_variant).toBe("retrieval_error");
    expect(sse.byName("delta")).toEqual([]);
    expect(auditKinds(sink)).toEqual(["retrieval_logs", "refusal_records"]);
  });

  it("MR-09: a row outside the as-of window triggers the internal-error refusal with a defect alert", async () => {
    const { sse } = await runQuery(
      { profile: "not_called", adapterOptions: { injectGateViolatingRow: true } },
      { query: "Tell me about the lantern festival permit." }
    );
    expect(sse.first("done").response_class).toBe("REFUSE_NO_AUTHORITY");
    const refusal = sse.first("refusal");
    expect(refusal.refusal_variant).toBe("internal_gate_error");
    expect(refusal.defect_alert).toBe(true);
  });

  it("MR-10: a result limit above the cap is clamped to 50 before the adapter call", async () => {
    const inner = createMockRetrievalAdapter();
    let observedLimit: number | null = null;
    const spy: LegalRetrievalAdapter = {
      ...inner,
      async searchDisplayableChunks(terms, asOf, families, limit) {
        observedLimit = limit;
        return inner.searchDisplayableChunks(terms, asOf, families, limit);
      },
    };
    const { handler } = buildHarness({ depsOverride: { adapter: spy } });
    const res = await handler(
      qaRequest({ query: "orchard harvest rules", result_limit: 200 })
    );
    const sse = await parseSse(res);
    expect(observedLimit).toBe(50);
    expect(sse.first("done").response_class).toBe("ANSWER");
  });

  it("every retrieval response pins the as-of date in the environment event", async () => {
    const { sse } = await runQuery({}, { query: "orchard harvest rules" });
    expect(sse.first("environment").as_of_date).toBe(TEST_AS_OF_DATE);
  });
});
