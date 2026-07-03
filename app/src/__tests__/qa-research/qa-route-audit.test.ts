// T6 (F5-04 / M1): MA-01..MA-07 plus sink content-rule rejections and
// trace propagation. Scenario canon: scenarios/mock_audit_log_scenarios.json
// (checksum-locked to F5-02).

import { describe, expect, it } from "vitest";
import { auditKinds, runQuery } from "./support/harness";
import { createMockAuditLogger } from "../../lib/qa-research/mock-audit-logger";
import { AuditContentRuleError } from "../../lib/qa-research/types";

const SHA256_HEX = /^[0-9a-f]{64}$/;

describe("MA audit scenarios", () => {
  it("MA-01: an answer writes retrieval log, answer audit, citation records, in order, hash-only", async () => {
    const { sse, sink } = await runQuery(
      {},
      { query: "What does T.C.A. SYN-37-901 provide?", request_id: "SYNREQ-MA01" }
    );
    expect(sse.first("done").response_class).toBe("ANSWER");
    expect(auditKinds(sink)).toEqual([
      "retrieval_logs",
      "answer_audit_records",
      "citation_verification_records",
    ]);
    const retrieval = sink.entries()[0].entry as Record<string, unknown>;
    expect(retrieval.query_hash).toMatch(SHA256_HEX);
    const serialized = JSON.stringify(sink.entries());
    expect(serialized).not.toContain("What does T.C.A.");
    expect(serialized).not.toContain("PLACEHOLDER PASSAGE");
  });

  it("MA-02: a pre-model guardrail refusal writes only the refusal record", async () => {
    const { sse, sink } = await runQuery(
      { profile: "not_called" },
      { query: "How should I rule on the petition before me?" }
    );
    expect(sse.first("refusal").refusal_variant).toBe("ruling_recommendation");
    expect(auditKinds(sink)).toEqual(["refusal_records"]);
    expect(sse.first("done").model_called).toBe(false);
  });

  it("MA-03: a zero-result refusal writes retrieval log then refusal record, flagged pre-generation", async () => {
    const { sink } = await runQuery(
      { profile: "not_called" },
      { query: "What governs the moonlit regatta pageant?" }
    );
    expect(auditKinds(sink)).toEqual(["retrieval_logs", "refusal_records"]);
    const retrieval = sink.entries()[0].entry as Record<string, unknown>;
    expect(retrieval.refused_before_generation).toBe(true);
  });

  it("MA-04: a citation-failure conversion writes the suppressed answer audit linked to the refusal", async () => {
    const { sink } = await runQuery(
      { profile: "fabricates_citation" },
      { query: "What does the lantern festival permit require?" }
    );
    const answerAudit = sink
      .entries()
      .find((e) => e.kind === "answer_audit_records")!.entry as Record<string, unknown>;
    expect(answerAudit.answer_suppressed).toBe(true);
    expect(answerAudit.answer_hash).toMatch(SHA256_HEX);
    expect(answerAudit.refusal_record_id).toBeTruthy();
    const refusal = sink
      .entries()
      .find((e) => e.kind === "refusal_records")!.entry as Record<string, unknown>;
    expect(answerAudit.refusal_record_id).toBe(refusal.refusal_record_id);
  });

  it("MA-05: each gated-class refusal writes a refusal record with an enum-valid kind", async () => {
    const shapes: Array<[string, string]> = [
      ["Show me the annotations under that statute.", "restricted_display_only"],
      ["What happened at the mill pond?", "no_authority_support"],
      ["What are the windmill requirements?", "no_authority_support"],
      ["What are the beacon requirements?", "future_effective_only"],
    ];
    for (const [query, expectedKind] of shapes) {
      const { sink } = await runQuery({ profile: "not_called" }, { query });
      const refusal = sink
        .entries()
        .find((e) => e.kind === "refusal_records")!.entry as Record<string, unknown>;
      expect(refusal.refusal_kind).toBe(expectedKind);
    }
  });

  it("MA-06: an answer is reconstructable from sink rows alone", async () => {
    const requestId = "SYNREQ-MA06";
    const { sink } = await runQuery(
      {},
      { query: "What does T.C.A. SYN-37-901 provide?", request_id: requestId }
    );
    const rows = sink.entriesFor(requestId);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    const retrieval = rows.find((r) => r.kind === "retrieval_logs")!.entry as Record<string, unknown>;
    const answer = rows.find((r) => r.kind === "answer_audit_records")!.entry as Record<string, unknown>;
    const citations = rows.filter((r) => r.kind === "citation_verification_records");
    expect(retrieval.query_hash).toMatch(SHA256_HEX);
    expect(retrieval.returned_chunk_ids).toBeDefined();
    expect(answer.prompt_package_hash).toMatch(SHA256_HEX);
    expect(answer.system_prompt_version).toBe("qa-route-prompt-contract-v1");
    expect(answer.answer_hash).toMatch(SHA256_HEX);
    expect(citations.length).toBeGreaterThanOrEqual(1);
    for (const c of citations) {
      expect((c.entry as Record<string, unknown>).verification_level).toBe(
        "verified_retrieved"
      );
    }
    expect(retrieval.environment_target).toBe("mock_only");
    expect(answer.environment_target).toBe("mock_only");
  });

  it("MA-07: a retrieval-log write failure blocks the answer with a user-safe refusal", async () => {
    const { sse } = await runQuery(
      { auditOptions: { failMode: "throw_on_retrieval" } },
      { query: "What are the orchard harvest rules?" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_variant).toBe("audit_write_failure");
    expect(refusal.defect_alert).toBe(true);
    expect(sse.byName("delta")).toEqual([]);
    expect(sse.first("done").response_class).toBe("REFUSE_NO_AUTHORITY");
  });

  it("an answer-audit write failure also fails closed (no unaudited answer)", async () => {
    const { sse } = await runQuery(
      { auditOptions: { failMode: "throw_on_answer" } },
      { query: "What are the orchard harvest rules?" }
    );
    expect(sse.first("refusal").refusal_variant).toBe("audit_write_failure");
    expect(sse.byName("delta")).toEqual([]);
  });

  it("the sink rejects prohibited body-text field names structurally", async () => {
    const sink = createMockAuditLogger();
    await expect(
      sink.logRefusal({
        request_id: "SYNREQ-CONTENT",
        retrieval_log_id: null,
        refusal_kind: "out_of_scope",
        refusal_variant: "excluded_title",
        stage: "pre_retrieval",
        user_message_key: "refusal.excluded_title.v1",
        matched_terms_hash: null,
        environment_target: "mock_only",
        // A prohibited field smuggled in must throw.
        ...({ chunk_text: "anything" } as object),
      })
    ).rejects.toThrow(AuditContentRuleError);
  });

  it("the sink rejects passage-length strings and unhashed queries", async () => {
    const sink = createMockAuditLogger();
    await expect(
      sink.logRetrieval({
        request_id: "SYNREQ-LONG",
        user_id: "SYNUSER-QA",
        corpus_build_id: "x".repeat(300),
        query_hash: "0".repeat(64),
        retrieval_mode: "full_text",
        as_of_date: "2026-07-02",
        filters: { families: ["tca_title_36"], answer_scope_intent: "general_answer" },
        candidate_chunk_ids_count: 0,
        returned_chunk_ids_count: 0,
        returned_chunk_ids: [],
        refused_before_generation: false,
        environment_target: "mock_only",
      })
    ).rejects.toThrow(AuditContentRuleError);

    await expect(
      sink.logRetrieval({
        request_id: "SYNREQ-RAW",
        user_id: "SYNUSER-QA",
        corpus_build_id: "build",
        query_hash: "not-a-hash",
        retrieval_mode: "full_text",
        as_of_date: "2026-07-02",
        filters: { families: ["tca_title_36"], answer_scope_intent: "general_answer" },
        candidate_chunk_ids_count: 0,
        returned_chunk_ids_count: 0,
        returned_chunk_ids: [],
        refused_before_generation: false,
        environment_target: "mock_only",
      })
    ).rejects.toThrow(AuditContentRuleError);
  });

  it("trace ids propagate: the done event's audit refs resolve in the sink", async () => {
    const { sse, sink } = await runQuery(
      {},
      { query: "What does T.C.A. SYN-37-901 provide?" }
    );
    const done = sse.first("done");
    const ids = sink.entries().map((e) => e.record_id);
    expect(ids).toContain(done.audit.retrieval_log_id);
    expect(ids).toContain(done.audit.answer_audit_record_id);
    expect(done.audit.citation_verification_record_count).toBeGreaterThanOrEqual(1);
  });
});
