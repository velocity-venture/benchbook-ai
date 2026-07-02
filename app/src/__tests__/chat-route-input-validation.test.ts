import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

type ChatBody = {
  query?: unknown;
  messages?: unknown;
};

const MAX_QUERY_LENGTH = 2000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

function jsonRequest(body: ChatBody): NextRequest {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest;
}

function rawRequest(body?: string): NextRequest {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }) as NextRequest;
}

async function importRouteWithMocks() {
  const messagesStream = vi.fn();
  const anthropicConstructor = vi.fn().mockImplementation(function MockAnthropic() {
    return {
      messages: {
        stream: messagesStream,
      },
    };
  });
  const from = vi.fn();
  const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: 'input-validation-user' } },
  });
  const createClient = vi.fn(() => ({ auth: { getUser }, rpc, from }));
  const buildCitationIndex = vi.fn();
  const buildCoverageReport = vi.fn();
  const classifyQueryComplexity = vi.fn(() => 'simple');
  const detectOutOfScopeQuery = vi.fn(() => null);

  vi.doMock('@anthropic-ai/sdk', () => ({
    default: anthropicConstructor,
  }));

  vi.doMock('@/lib/supabase/server', () => ({
    createClient,
  }));

  vi.doMock('@/lib/citation-validator', () => ({
    buildCitationIndex,
  }));

  vi.doMock('@/lib/hallucination-guard', () => ({
    HALLUCINATION_GUARDRAILS: 'Test guardrails',
    runHallucinationGuard: vi.fn(),
  }));

  vi.doMock('@/lib/query-router', () => ({
    classifyQueryComplexity,
  }));

  vi.doMock('@/lib/corpus-coverage', () => ({
    annotateCoverage: vi.fn(),
    buildCoverageReport,
    coverageSummaryLine: vi.fn(),
  }));

  vi.doMock('@/lib/scope-guard', () => ({
    buildScopeRefusal: vi.fn(),
    detectOutOfScopeQuery,
  }));

  vi.doMock('@/lib/legal-corpus-data.json', () => ({
    default: {},
  }));

  const route = await import('../app/api/chat/route');

  return {
    POST: route.POST as (request: NextRequest) => Promise<Response>,
    anthropicConstructor,
    buildCitationIndex,
    buildCoverageReport,
    classifyQueryComplexity,
    detectOutOfScopeQuery,
    messagesStream,
  };
}

function expectValidationStoppedBeforeProvider(mocks: Awaited<ReturnType<typeof importRouteWithMocks>>) {
  expect(mocks.classifyQueryComplexity).not.toHaveBeenCalled();
  expect(mocks.detectOutOfScopeQuery).not.toHaveBeenCalled();
  expect(mocks.buildCitationIndex).not.toHaveBeenCalled();
  expect(mocks.buildCoverageReport).not.toHaveBeenCalled();
  expect(mocks.messagesStream).not.toHaveBeenCalled();
}

async function expectSafeBadRequest(
  request: NextRequest,
  expectedError: string,
): Promise<void> {
  const mocks = await importRouteWithMocks();
  const response = await mocks.POST(request);
  const body = await response.text();

  expect(response.status).toBe(400);
  expect(JSON.parse(body)).toEqual({ error: expectedError });
  expect(body).not.toContain('Error:');
  expect(body).not.toContain('at ');
  expect(body).not.toContain('stack');
  expectValidationStoppedBeforeProvider(mocks);
}

describe('chat API input validation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('rejects missing or invalid JSON request bodies with a safe 400 response', async () => {
    await expectSafeBadRequest(rawRequest(), 'Invalid JSON request body');
    vi.resetModules();
    await expectSafeBadRequest(rawRequest('{'), 'Invalid JSON request body');
  });

  it.each([
    ['missing query', {}, 'Query is required and must be a string'],
    ['null query', { query: null }, 'Query is required and must be a string'],
    ['non-string query', { query: ['detention criteria'] }, 'Query is required and must be a string'],
    ['empty query', { query: '' }, 'Query is required and must be a string'],
    [
      'oversized query',
      { query: 'q'.repeat(MAX_QUERY_LENGTH + 1) },
      `Query must be under ${MAX_QUERY_LENGTH} characters`,
    ],
  ])('rejects %s before routing or provider calls', async (_name, body, expectedError) => {
    await expectSafeBadRequest(jsonRequest(body), expectedError);
  });

  it.each([
    ['non-array messages', { query: 'What are detention criteria?', messages: {} }, 'Messages must be an array'],
    [
      'too many messages',
      {
        query: 'What are detention criteria?',
        messages: Array.from({ length: MAX_MESSAGES + 1 }, () => ({
          role: 'user',
          content: 'Prior question',
        })),
      },
      `Maximum ${MAX_MESSAGES} messages allowed`,
    ],
    [
      'missing message content',
      { query: 'What are detention criteria?', messages: [{ role: 'user' }] },
      'Each message must have a valid role and content',
    ],
    [
      'non-string message content',
      { query: 'What are detention criteria?', messages: [{ role: 'user', content: { text: 'Prior question' } }] },
      'Each message must have a valid role and content',
    ],
    [
      'invalid message role',
      { query: 'What are detention criteria?', messages: [{ role: 'system', content: 'Prior question' }] },
      'Each message must have a valid role and content',
    ],
    [
      'oversized message content',
      {
        query: 'What are detention criteria?',
        messages: [{ role: 'user', content: 'm'.repeat(MAX_MESSAGE_LENGTH + 1) }],
      },
      `Message content must be under ${MAX_MESSAGE_LENGTH} characters`,
    ],
  ])('rejects %s before corpus or provider calls', async (_name, body, expectedError) => {
    await expectSafeBadRequest(jsonRequest(body), expectedError);
  });
});
