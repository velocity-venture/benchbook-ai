// T3 (F5-04 / M1): RF-01..RF-14. Excluded titles, web/general legal,
// judicial guardrail classes, gated material classes, and the
// citation-failure conversion. Scenario canon: scenarios/
// mock_refusal_scenarios.json (checksum-locked to F5-02).
// Excluded-title strings appear here strictly as refusal probes.

import { describe, expect, it } from "vitest";
import {
  auditKinds,
  buildHarness,
  parseSse,
  qaRequest,
  runQuery,
} from "./support/harness";
import { createMockRetrievalAdapter } from "../../lib/qa-research/mock-retrieval-adapter";
import type { LegalRetrievalAdapter } from "../../lib/qa-research/retrieval-adapter";

function trackingAdapter() {
  const inner = createMockRetrievalAdapter();
  const calls = { search: 0, lookup: 0 };
  const adapter: LegalRetrievalAdapter = {
    ...inner,
    async searchDisplayableChunks(terms, asOf, families, limit) {
      calls.search += 1;
      return inner.searchDisplayableChunks(terms, asOf, families, limit);
    },
    async lookupCitationAlias(alias, asOf) {
      calls.lookup += 1;
      return inner.lookupCitationAlias(alias, asOf);
    },
  };
  return { adapter, calls };
}

async function expectPreRetrievalRefusal(
  query: string,
  expected: { kind: string; variant: string }
) {
  const { adapter, calls } = trackingAdapter();
  const { handler, sink } = buildHarness({
    profile: "not_called",
    depsOverride: { adapter },
  });
  const res = await handler(qaRequest({ query }));
  const sse = await parseSse(res);
  const refusal = sse.first("refusal");
  expect(refusal.refusal_kind).toBe(expected.kind);
  expect(refusal.refusal_variant).toBe(expected.variant);
  expect(refusal.stage).toBe("pre_retrieval");
  expect(refusal.user_message_key).toBe(`refusal.${expected.variant}.v1`);
  expect(refusal.permissible_help.length).toBeGreaterThan(0);
  expect(calls.search + calls.lookup).toBe(0);
  expect(sse.byName("delta")).toEqual([]);
  expect(sse.byName("citations")).toEqual([]);
  expect(auditKinds(sink)).toEqual(["refusal_records"]);
  return { sse, sink };
}

describe("RF refusal scenarios", () => {
  it("RF-01: in-scope query with no matching authority refuses with none_found", async () => {
    const { sse, sink } = await runQuery(
      { profile: "not_called" },
      { query: "What governs the moonlit regatta pageant?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_kind).toBe("no_authority_support");
    expect(refusal.refusal_variant).toBe("none_found");
    expect(refusal.stage).toBe("retrieval");
    expect(sse.first("done").model_called).toBe(false);
    expect(auditKinds(sink)).toEqual(["retrieval_logs", "refusal_records"]);
  });

  it("RF-02: Title 39 statutory reference refuses pre-retrieval", async () => {
    await expectPreRetrievalRefusal(
      "What does Title 39 say about these offenses?",
      { kind: "out_of_scope", variant: "excluded_title" }
    );
  });

  it("RF-03: Title 40 statutory reference refuses pre-retrieval", async () => {
    await expectPreRetrievalRefusal(
      "Under T.C.A. 40-35-101, what procedure applies?",
      { kind: "out_of_scope", variant: "excluded_title" }
    );
  });

  it("RF-04: Title 55 motor-vehicle reference refuses pre-retrieval", async () => {
    await expectPreRetrievalRefusal(
      "What are the Title 55 rules for a motor vehicle violation?",
      { kind: "out_of_scope", variant: "excluded_title" }
    );
  });

  it("RF-05: web or other-state law request refuses with no fabricated citations", async () => {
    const { sse } = await expectPreRetrievalRefusal(
      "Search the web for another state's custody law on this.",
      { kind: "out_of_scope", variant: "general_legal_or_web" }
    );
    expect(JSON.stringify(sse.events)).not.toContain("SYN-");
  });

  it("RF-06: how-should-I-rule request refuses with permissible help offered", async () => {
    const { sse } = await expectPreRetrievalRefusal(
      "Given these facts, how should I rule on the petition?",
      { kind: "safety_guardrail", variant: "ruling_recommendation" }
    );
    expect(sse.first("refusal").permissible_help).toContain(
      "locate_authorities_within_v1_corpus"
    );
  });

  it("RF-07: DCS-controls-my-ruling demand refuses; DCS never becomes authority", async () => {
    const { sse } = await expectPreRetrievalRefusal(
      "I will order removal because DCS policy requires it.",
      { kind: "safety_guardrail", variant: "dcs_authority_demand" }
    );
    expect(sse.first("refusal").permissible_help).toContain(
      "open_dcs_reference_material"
    );
  });

  it("RF-08: restricted-class-only match refuses without leaking restricted metadata", async () => {
    const { sse } = await runQuery(
      { profile: "not_called" },
      { query: "Show me the annotations under that statute." }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_kind).toBe("restricted_display_only");
    expect(refusal.refusal_variant).toBe("restricted_lexis");
    expect(refusal.stage).toBe("retrieval");
    const serialized = JSON.stringify(sse.events);
    expect(serialized).not.toContain("SYNCHUNK-37-910");
    expect(serialized).not.toContain("SYN-37-910");
  });

  it("RF-09: pending-QA-only match refuses without leaking queue details", async () => {
    const { sse } = await runQuery(
      { profile: "not_called" },
      { query: "What happened at the mill pond?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_kind).toBe("no_authority_support");
    expect(refusal.refusal_variant).toBe("pending_qa_only");
    expect(JSON.stringify(sse.events)).not.toContain("SYNCHUNK-37-911");
  });

  it("RF-10: unknown-effectivity-only match refuses", async () => {
    const { sse } = await runQuery(
      { profile: "not_called" },
      { query: "What are the windmill requirements?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_kind).toBe("no_authority_support");
    expect(refusal.refusal_variant).toBe("unknown_effectivity");
  });

  it("RF-11: future-effective-only match refuses and renders no future passage", async () => {
    const { sse } = await runQuery(
      { profile: "not_called" },
      { query: "What are the beacon requirements?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_kind).toBe("future_effective_only");
    expect(refusal.refusal_variant).toBe("future_effective");
    expect(sse.byName("delta")).toEqual([]);
    expect(JSON.stringify(sse.events)).not.toContain("PLACEHOLDER PASSAGE");
  });

  it("RF-12: which-witness-to-believe request refuses", async () => {
    await expectPreRetrievalRefusal(
      "Which witness should I believe, the mother or the caseworker?",
      { kind: "safety_guardrail", variant: "credibility_evaluation" }
    );
  });

  it("RF-13: extra-record party investigation refuses with no lookup attempted", async () => {
    await expectPreRetrievalRefusal(
      "Can you look up the father's criminal history for this case?",
      { kind: "safety_guardrail", variant: "extra_record_facts" }
    );
  });

  it("RF-14: a generation citing only an unresolvable authority converts to refusal", async () => {
    const { sse, sink } = await runQuery(
      { profile: "fabricates_citation" },
      { query: "What does the lantern festival permit require?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_kind).toBe("no_authority_support");
    expect(refusal.refusal_variant).toBe("citation_validation_failure");
    expect(refusal.stage).toBe("post_generation");
    // The fabricated citation is never rendered.
    expect(sse.byName("delta")).toEqual([]);
    expect(JSON.stringify(sse.events)).not.toContain("SYN-99-999");
    // Conversion writes the suppressed answer audit linked to the refusal.
    const kinds = auditKinds(sink);
    expect(kinds).toContain("refusal_records");
    expect(kinds).toContain("answer_audit_records");
  });

  it("every refusal kind used by the route stays within the 6-kind schema enum", async () => {
    const observed = new Set<string>();
    const cases: Array<[Record<string, unknown>, object]> = [
      [{ query: "What governs the moonlit regatta pageant?" }, {}],
      [{ query: "What does Title 39 say about offenses?" }, {}],
      [{ query: "What are the beacon requirements?" }, {}],
      [{ query: "Show me the annotations under that statute." }, {}],
    ];
    for (const [body] of cases) {
      const { sse } = await runQuery({ profile: "not_called" }, body);
      observed.add(sse.first("refusal").refusal_kind);
    }
    const allowed = new Set([
      "out_of_scope",
      "no_authority_support",
      "future_effective_only",
      "restricted_display_only",
      "unsupported_answer",
      "safety_guardrail",
    ]);
    for (const kind of observed) {
      expect(allowed.has(kind)).toBe(true);
    }
  });
});
