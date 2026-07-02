import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

type CapturedAnthropicCall = {
  system?: Array<{ text?: string }>;
};

const TEST_CORPUS = {
  tcaTitle37: 'TITLE 37 SENTINEL: juvenile detention under 37-1-114.',
  tcaTitle36: 'TITLE 36 SENTINEL: custody and domestic relations.',
  trjppRules: 'TRJPP SENTINEL: preliminary hearing procedure.',
  dcsText: 'DCS SENTINEL: removal and safety plan policy.',
};

function chatRequest(query: string): NextRequest {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  }) as NextRequest;
}

async function readStream(response: Response): Promise<string> {
  return response.text();
}

async function importRouteWithMocks() {
  const capturedAnthropicCalls: CapturedAnthropicCall[] = [];
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ insert }));
  const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: 'corpus-test-user' } },
  });
  const createClient = vi.fn(() => ({ auth: { getUser }, rpc, from }));
  const buildCitationIndex = vi.fn(() => ({ test: 'citation-index' }));
  const buildCoverageReport = vi.fn(() => ({ test: 'coverage-report' }));

  vi.doMock('@anthropic-ai/sdk', () => ({
    default: vi.fn().mockImplementation(function MockAnthropic() {
      return {
        messages: {
          stream: vi.fn((call: CapturedAnthropicCall) => {
            capturedAnthropicCalls.push(call);
            return {
              on: vi.fn((event: string, callback: (text: string) => void) => {
                if (event === 'text') {
                  callback('T.C.A. § 37-1-114 applies.');
                }
              }),
              finalMessage: vi.fn().mockResolvedValue({
                usage: {
                  input_tokens: 1,
                  output_tokens: 1,
                  cache_creation_input_tokens: 0,
                  cache_read_input_tokens: 0,
                },
              }),
            };
          }),
        },
      };
    }),
  }));

  vi.doMock('@/lib/supabase/server', () => ({
    createClient,
  }));

  vi.doMock('@/lib/citation-validator', () => ({
    buildCitationIndex,
  }));

  vi.doMock('@/lib/hallucination-guard', () => ({
    HALLUCINATION_GUARDRAILS: 'Test guardrails',
    runHallucinationGuard: vi.fn(() => ({
      citations: [],
      confidence: 'HIGH',
      confidenceReason: 'Test confidence',
      warnings: [],
    })),
  }));

  vi.doMock('@/lib/query-router', () => ({
    classifyQueryComplexity: vi.fn(() => 'simple'),
  }));

  vi.doMock('@/lib/corpus-coverage', () => ({
    annotateCoverage: vi.fn(() => []),
    buildCoverageReport,
    coverageSummaryLine: vi.fn(() => 'Test coverage summary'),
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
    capturedAnthropicCalls,
    buildCitationIndex,
    buildCoverageReport,
    rpc,
    from,
    insert,
  };
}

function legalCorpusBlock(call: CapturedAnthropicCall): string {
  return call.system?.find((block) =>
    block.text?.includes('You have access to the following Tennessee legal corpus')
  )?.text ?? '';
}

describe('chat API legal corpus loading and cache behavior', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('loads the baseline juvenile corpus while excluding Title 36 and DCS when query keywords do not require them', async () => {
    const { POST, capturedAnthropicCalls, buildCitationIndex, buildCoverageReport } =
      await importRouteWithMocks();

    const response = await POST(chatRequest('What are the detention hearing deadlines?'));
    await readStream(response);

    expect(response.status).toBe(200);
    expect(capturedAnthropicCalls).toHaveLength(1);
    const corpusBlock = legalCorpusBlock(capturedAnthropicCalls[0]);

    expect(corpusBlock).toContain(TEST_CORPUS.tcaTitle37);
    expect(corpusBlock).toContain(TEST_CORPUS.trjppRules);
    expect(corpusBlock).not.toContain(TEST_CORPUS.tcaTitle36);
    expect(corpusBlock).not.toContain(TEST_CORPUS.dcsText);
    expect(buildCitationIndex).toHaveBeenCalledTimes(1);
    expect(buildCitationIndex).toHaveBeenCalledWith(
      TEST_CORPUS.tcaTitle37,
      TEST_CORPUS.tcaTitle36,
      TEST_CORPUS.trjppRules,
      TEST_CORPUS.dcsText
    );
    expect(buildCoverageReport).toHaveBeenCalledTimes(1);
  });

  it('adds Title 36 and DCS corpus sections only when query terms require those bodies of law', async () => {
    const { POST, capturedAnthropicCalls } = await importRouteWithMocks();

    const response = await POST(
      chatRequest('What should the court consider for parent custody after DCS removal?')
    );
    await readStream(response);

    expect(response.status).toBe(200);
    const corpusBlock = legalCorpusBlock(capturedAnthropicCalls[0]);

    expect(corpusBlock).toContain(TEST_CORPUS.tcaTitle37);
    expect(corpusBlock).toContain(TEST_CORPUS.tcaTitle36);
    expect(corpusBlock).toContain(TEST_CORPUS.trjppRules);
    expect(corpusBlock).toContain(TEST_CORPUS.dcsText);
  });

  it('reuses the module corpus cache within the TTL instead of rebuilding citation and coverage indexes', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-14T12:00:00.000Z'));

    const { POST, capturedAnthropicCalls, buildCitationIndex, buildCoverageReport } =
      await importRouteWithMocks();

    const firstResponse = await POST(chatRequest('What are juvenile detention deadlines?'));
    await readStream(firstResponse);

    vi.setSystemTime(new Date('2026-05-14T12:04:00.000Z'));
    const secondResponse = await POST(chatRequest('What are preliminary hearing deadlines?'));
    await readStream(secondResponse);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(capturedAnthropicCalls).toHaveLength(2);
    expect(buildCitationIndex).toHaveBeenCalledTimes(1);
    expect(buildCoverageReport).toHaveBeenCalledTimes(1);
    expect(legalCorpusBlock(capturedAnthropicCalls[1])).toContain(TEST_CORPUS.tcaTitle37);

    vi.useRealTimers();
  });
});
