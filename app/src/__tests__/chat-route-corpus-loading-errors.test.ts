import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

function chatRequest(): NextRequest {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "What are detention criteria?" }),
  }) as NextRequest;
}

async function importRouteWithCorpusMock(corpusMock: () => unknown) {
  const messagesStream = vi.fn();
  const anthropicConstructor = vi.fn().mockImplementation(function MockAnthropic() {
    return {
      messages: {
        stream: messagesStream,
      },
    };
  });
  const insert = vi.fn();
  const from = vi.fn(() => ({ insert }));
  const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: "corpus-error-user" } },
  });
  const createClient = vi.fn(() => ({ auth: { getUser }, rpc, from }));
  const buildCitationIndex = vi.fn(() => ({
    tcaSections: new Set(),
    trjppRules: new Set(),
    dcsPolicies: new Set(),
  }));
  const buildCoverageReport = vi.fn(() => ({ summary: "empty corpus" }));

  vi.doMock("@anthropic-ai/sdk", () => ({
    default: anthropicConstructor,
  }));

  vi.doMock("@/lib/supabase/server", () => ({
    createClient,
  }));

  vi.doMock("@/lib/citation-validator", () => ({
    buildCitationIndex,
  }));

  vi.doMock("@/lib/hallucination-guard", () => ({
    HALLUCINATION_GUARDRAILS: "Test guardrails",
    runHallucinationGuard: vi.fn(),
  }));

  vi.doMock("@/lib/query-router", () => ({
    classifyQueryComplexity: vi.fn(() => "simple"),
  }));

  vi.doMock("@/lib/corpus-coverage", () => ({
    annotateCoverage: vi.fn(),
    buildCoverageReport,
    coverageSummaryLine: vi.fn(),
  }));

  vi.doMock("@/lib/scope-guard", () => ({
    buildScopeRefusal: vi.fn(),
    detectOutOfScopeQuery: vi.fn(() => null),
  }));

  vi.doMock("@/lib/legal-corpus-data.json", corpusMock);

  vi.stubEnv("USE_CLAUDE_API", "true");
  vi.stubEnv("ANTHROPIC_API_KEY", "configured-for-test");

  const route = await import("../app/api/chat/route");

  return {
    POST: route.POST as (request: NextRequest) => Promise<Response>,
    anthropicConstructor,
    buildCitationIndex,
    buildCoverageReport,
    from,
    messagesStream,
  };
}

async function expectSafeCorpusUnavailable(corpusMock: () => unknown) {
  const mocks = await importRouteWithCorpusMock(corpusMock);

  const response = await mocks.POST(chatRequest());
  const bodyText = await response.text();
  const body = JSON.parse(bodyText);

  expect(response.status).toBe(503);
  expect(body).toEqual({
    error: "Legal corpus is temporarily unavailable. Please try again later.",
  });
  expect(bodyText).not.toContain("Error:");
  expect(bodyText).not.toContain("stack");
  expect(bodyText).not.toContain("legal-corpus-data");
  expect(mocks.anthropicConstructor).toHaveBeenCalledTimes(1);
  expect(mocks.messagesStream).not.toHaveBeenCalled();
  expect(mocks.from).not.toHaveBeenCalled();
  expect(mocks.buildCitationIndex).toHaveBeenCalledWith(
    undefined,
    undefined,
    undefined,
    undefined
  );
  expect(mocks.buildCoverageReport).toHaveBeenCalledTimes(1);
}

describe("chat API corpus loading error handling", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns a safe unavailable response when the prebuilt corpus module cannot be loaded", async () => {
    await expectSafeCorpusUnavailable(() => {
      throw new Error("simulated corpus module load failure");
    });
  });

  it("returns a safe unavailable response when the prebuilt corpus default export is malformed", async () => {
    await expectSafeCorpusUnavailable(() => ({
      default: null,
    }));
  });

  it("returns a safe unavailable response when the prebuilt corpus has no usable string fields", async () => {
    await expectSafeCorpusUnavailable(() => ({
      default: {
        tcaTitle37: "",
        tcaTitle36: 37,
        trjppRules: [],
        dcsText: {},
      },
    }));
  });
});
