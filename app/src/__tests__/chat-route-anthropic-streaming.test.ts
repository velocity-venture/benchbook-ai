import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

type StreamScenario = {
  chunks: string[];
  finalMessage?: {
    usage: {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };
  finalError?: Error;
};

const TEST_SOURCE = {
  title: 'T.C.A. § 37-1-114',
  citation: 'T.C.A. § 37-1-114',
  type: 'TCA',
  snippet: 'A child may be detained only under the statutory criteria.',
  verified: true,
  coverageScope: 'covered',
};

const TEST_CORPUS = {
  tcaTitle37: 'T.C.A. § 37-1-114 detention criteria text.',
  trjppRules: 'TRJPP detention hearing rule text.',
};

function chatRequest(query = 'What are the detention criteria?'): NextRequest {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  }) as NextRequest;
}

function parseSseEvents(body: string): Array<Record<string, unknown>> {
  return body
    .split('\n\n')
    .filter(Boolean)
    .map((event) => {
      expect(event.startsWith('data: ')).toBe(true);
      return JSON.parse(event.slice('data: '.length));
    });
}

async function importRouteWithMocks(scenario: StreamScenario) {
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ insert }));
  const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: 'stream-test-user' } },
  });
  const createClient = vi.fn(() => ({ auth: { getUser }, rpc, from }));
  const messagesStream = vi.fn(() => ({
    on: vi.fn((event: string, callback: (text: string) => void) => {
      if (event === 'text') {
        scenario.chunks.forEach((chunk) => callback(chunk));
      }
    }),
    finalMessage: vi.fn(() => {
      if (scenario.finalError) {
        return Promise.reject(scenario.finalError);
      }
      return Promise.resolve(scenario.finalMessage);
    }),
  }));

  vi.doMock('@anthropic-ai/sdk', () => ({
    default: vi.fn().mockImplementation(function MockAnthropic() {
      return {
        messages: {
          stream: messagesStream,
        },
      };
    }),
  }));

  vi.doMock('@/lib/supabase/server', () => ({
    createClient,
  }));

  vi.doMock('@/lib/citation-validator', () => ({
    buildCitationIndex: vi.fn(() => ({ citation: 'index' })),
  }));

  vi.doMock('@/lib/hallucination-guard', () => ({
    HALLUCINATION_GUARDRAILS: 'Test guardrails',
    runHallucinationGuard: vi.fn(() => ({
      citations: [TEST_SOURCE],
      confidence: 'HIGH',
      confidenceReason: 'Citations verified in test corpus.',
      warnings: [],
    })),
  }));

  vi.doMock('@/lib/query-router', () => ({
    classifyQueryComplexity: vi.fn(() => 'simple'),
  }));

  vi.doMock('@/lib/corpus-coverage', () => ({
    annotateCoverage: vi.fn((citations) => citations),
    buildCoverageReport: vi.fn(() => ({ covered: true })),
    coverageSummaryLine: vi.fn(() => 'Coverage verified.'),
  }));

  vi.doMock('@/lib/scope-guard', () => ({
    buildScopeRefusal: vi.fn(),
    detectOutOfScopeQuery: vi.fn(() => null),
  }));

  vi.doMock('@/lib/legal-corpus-data.json', () => ({
    default: TEST_CORPUS,
  }));

  vi.stubEnv('USE_CLAUDE_API', 'true');
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key');

  const route = await import('../app/api/chat/route');

  return {
    POST: route.POST as (request: NextRequest) => Promise<Response>,
    createClient,
    insert,
    messagesStream,
    rpc,
  };
}

describe('chat API Anthropic streaming integration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('emits text chunks and final usage metadata including cache token fields', async () => {
    const { POST, insert, messagesStream } = await importRouteWithMocks({
      chunks: ['Detention requires ', 'statutory criteria.'],
      finalMessage: {
        usage: {
          input_tokens: 11,
          output_tokens: 7,
          cache_creation_input_tokens: 5,
          cache_read_input_tokens: 13,
        },
      },
    });

    const response = await POST(chatRequest());
    const events = parseSseEvents(await response.text());

    expect(response.status).toBe(200);
    expect(messagesStream).toHaveBeenCalledTimes(1);
    expect(events).toEqual([
      { type: 'delta', text: 'Detention requires ' },
      { type: 'delta', text: 'statutory criteria.' },
      { type: 'sources', sources: [TEST_SOURCE] },
      {
        type: 'confidence',
        level: 'HIGH',
        reason: 'Citations verified in test corpus.',
        warnings: [],
      },
      { type: 'coverage', summary: 'Coverage verified.', warnings: [] },
      {
        type: 'done',
        tokens_used: 18,
        cache_creation_input_tokens: 5,
        cache_read_input_tokens: 13,
        cache_hit: true,
        model_used: 'haiku',
      },
    ]);
    expect(insert).toHaveBeenCalledWith({
      user_id: 'stream-test-user',
      query: 'What are the detention criteria?',
      query_type: 'chat',
      response_sources: [
        {
          title: TEST_SOURCE.title,
          citation: TEST_SOURCE.citation,
          type: TEST_SOURCE.type,
          snippet: TEST_SOURCE.snippet,
        },
      ],
    });
  });

  it('returns a safe stream error when finalMessage fails and does not record successful usage', async () => {
    const upstreamFailure = new Error('upstream failed with provider internal detail');
    const { POST, insert } = await importRouteWithMocks({
      chunks: ['Partial answer before failure.'],
      finalError: upstreamFailure,
    });

    const response = await POST(chatRequest());
    const body = await response.text();
    const events = parseSseEvents(body);

    expect(response.status).toBe(200);
    expect(events).toEqual([
      { type: 'delta', text: 'Partial answer before failure.' },
      { type: 'error', message: 'Failed to generate response' },
    ]);
    expect(body).not.toContain('provider internal detail');
    expect(body).not.toContain('done');
    expect(insert).not.toHaveBeenCalled();
  });
});
