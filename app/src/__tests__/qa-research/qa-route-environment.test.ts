// T7 (F5-04 / M1): ME-01..ME-06. Banner event, target chip data, echo
// match, production sentinel, mismatch refusal, and boot integration.
// Scenario canon: scenarios/mock_environment_target_scenarios.json
// (checksum-locked to F5-02). ME-01/ME-02 page-side rendering is covered
// by static assertions on the page source (no DOM renderer dependency).

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bootValidate } from "../../lib/qa-research/environment";
import {
  buildHarness,
  parseSse,
  qaRequest,
  runQuery,
} from "./support/harness";

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE_SOURCE = readFileSync(
  resolve(HERE, "../../app/(dashboard)/qa-research/page.tsx"),
  "utf-8"
);

describe("ME environment target scenarios", () => {
  it("ME-01: the environment event with the mock banner is the FIRST event on answers and refusals", async () => {
    const answer = await runQuery({}, { query: "orchard harvest rules" });
    expect(answer.sse.events[0].event).toBe("environment");
    expect(answer.sse.events[0].data.banner).toBe(
      "MOCK ONLY - SYNTHETIC DATA - NOT FOR JUDICIAL RELIANCE"
    );
    const refusal = await runQuery(
      { profile: "not_called" },
      { query: "How should I rule here?" }
    );
    expect(refusal.sse.events[0].event).toBe("environment");
    expect(refusal.sse.events[0].data.banner).toContain("MOCK ONLY");
  });

  it("ME-01/ME-02 (page side): the QA page renders banner, chip, trace, and notices from events", () => {
    // The page is a pure renderer of SSE events; these static assertions
    // pin the required frame elements without a DOM test dependency.
    expect(PAGE_SOURCE).toContain("environment.banner");
    expect(PAGE_SOURCE).toContain("environment.label");
    expect(PAGE_SOURCE).toContain("no_production_notice");
    expect(PAGE_SOURCE).toContain("fixture_manifest_sha256");
    expect(PAGE_SOURCE).toContain("Trace");
    expect(PAGE_SOURCE).toContain("not controlling authority");
    expect(PAGE_SOURCE).toContain("evidentiary");
  });

  it("ME-02: the environment event carries the target chip data", async () => {
    const { sse } = await runQuery({}, { query: "orchard harvest rules" });
    const env = sse.first("environment");
    expect(env.target).toBe("mock_only");
    expect(env.label).toBe("MOCK_ONLY");
    expect(env.tier).toBe("mock");
    expect(env.fixture_manifest_sha256).toMatch(/^f504/);
    expect(env.no_production_notice).toContain("cannot connect to production");
  });

  it("ME-03: a matching environment echo lets requests proceed normally", async () => {
    const { sse } = await runQuery({}, { query: "orchard harvest rules" });
    expect(sse.first("done").response_class).toBe("ANSWER");
  });

  it("ME-04: the production sentinel refuses every request with target_control and a boot alert", async () => {
    const bootReport = bootValidate({
      QA_RESEARCH_TARGET: "production_prohibited",
      QA_RESEARCH_ENABLED: "true",
    });
    const { handler } = buildHarness({ bootReport, profile: "not_called" });
    for (const query of ["orchard harvest rules", "lantern festival permit"]) {
      const sse = await parseSse(await handler(qaRequest({ query })));
      expect(sse.first("refusal").refusal_variant).toBe("target_control");
      expect(sse.first("done").response_class).toBe("REFUSE_TARGET");
      expect(sse.first("environment").boot_alert).toBe(true);
    }
  });

  it("ME-05: an adapter echo differing from the pinned target refuses with an alert (SC-1)", async () => {
    const { sse } = await runQuery(
      {
        profile: "not_called",
        adapterOptions: { echoTarget: "preview_internal_qa" },
      },
      { query: "orchard harvest rules" }
    );
    const refusal = sse.first("refusal");
    expect(refusal.refusal_variant).toBe("target_control");
    expect(refusal.defect_alert).toBe(true);
    expect(sse.first("done").response_class).toBe("REFUSE_TARGET");
  });

  it("ME-06: a failed boot makes the route unavailable (503), never a degraded answer", async () => {
    const cases = [
      { QA_RESEARCH_ENABLED: "true" }, // missing target
      { QA_RESEARCH_TARGET: "preview_internal_qa", QA_RESEARCH_ENABLED: "true" },
      { QA_RESEARCH_TARGET: "mock_only" }, // flag off
      {
        QA_RESEARCH_TARGET: "mock_only",
        QA_RESEARCH_ENABLED: "true",
        QA_RESEARCH_MODEL: "not-a-valid-model!",
      },
    ];
    for (const env of cases) {
      const { handler } = buildHarness({ bootReport: bootValidate(env) });
      const res = await handler(qaRequest({ query: "orchard harvest rules" }));
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.available).toBe(false);
    }
  });

  it("responses carry the MOCK_ONLY header on the transport layer too", async () => {
    const { res } = await runQuery({}, { query: "orchard harvest rules" });
    expect(res.headers.get("X-Environment-Label")).toBe("MOCK_ONLY");
  });

  it("malformed input yields the input_invalid refusal without processing", async () => {
    const { handler } = buildHarness({ profile: "not_called" });
    const bad = [
      {},
      { query: "" },
      { query: "x".repeat(2001) },
      { query: "valid", unexpected_field: 1 },
      { query: "valid", as_of_date: "07/02/2026" },
    ];
    for (const body of bad) {
      const res = await handler(qaRequest(body));
      expect(res.status).toBe(400);
      const parsed = await res.json();
      expect(parsed.refusal.refusal_variant).toBe("input_invalid");
    }
  });
});
