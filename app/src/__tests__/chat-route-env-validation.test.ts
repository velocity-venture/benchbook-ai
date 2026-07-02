import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

function chatRequest(): NextRequest {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "What are detention criteria?" }),
  }) as NextRequest;
}

async function importRouteWithMocks() {
  const anthropicConstructor = vi.fn();
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: "env-test-user" } },
  });
  const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
  const from = vi.fn();
  const createClient = vi.fn(() => ({ auth: { getUser }, rpc, from }));

  vi.doMock("@anthropic-ai/sdk", () => ({
    default: anthropicConstructor,
  }));

  vi.doMock("@/lib/supabase/server", () => ({
    createClient,
  }));

  vi.doMock("@/lib/citation-validator", () => ({
    buildCitationIndex: vi.fn(),
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
    buildCoverageReport: vi.fn(),
    coverageSummaryLine: vi.fn(),
  }));

  vi.doMock("@/lib/scope-guard", () => ({
    buildScopeRefusal: vi.fn(),
    detectOutOfScopeQuery: vi.fn(() => null),
  }));

  vi.doMock("@/lib/legal-corpus-data.json", () => ({
    default: {},
  }));

  const route = await import("../app/api/chat/route");

  return {
    POST: route.POST as (request: NextRequest) => Promise<Response>,
    anthropicConstructor,
    from,
  };
}

describe("chat API environment validation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("USE_CLAUDE_API", "true");
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns a safe explicit error when Anthropic is enabled without ANTHROPIC_API_KEY", async () => {
    const { POST, anthropicConstructor, from } = await importRouteWithMocks();

    const response = await POST(chatRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY in environment.",
    });
    expect(JSON.stringify(body)).toContain("ANTHROPIC_API_KEY");
    expect(JSON.stringify(body)).not.toContain("Error:");
    expect(JSON.stringify(body)).not.toContain("stack");
    expect(anthropicConstructor).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
  });
});
