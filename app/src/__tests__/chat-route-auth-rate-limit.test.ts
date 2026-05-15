import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

vi.mock('@/lib/citation-validator', () => ({
  buildCitationIndex: vi.fn(),
}));

vi.mock('@/lib/hallucination-guard', () => ({
  HALLUCINATION_GUARDRAILS: 'Test guardrails',
  runHallucinationGuard: vi.fn(),
}));

vi.mock('@/lib/query-router', () => ({
  classifyQueryComplexity: vi.fn(() => 'simple'),
}));

vi.mock('@/lib/corpus-coverage', () => ({
  annotateCoverage: vi.fn(),
  buildCoverageReport: vi.fn(),
  coverageSummaryLine: vi.fn(),
}));

vi.mock('@/lib/scope-guard', () => ({
  buildScopeRefusal: vi.fn(),
  detectOutOfScopeQuery: vi.fn(() => null),
}));

vi.mock('@/lib/legal-corpus-data.json', () => ({
  default: {},
}));

import { POST } from '../app/api/chat/route';

function chatRequest(body: unknown): NextRequest {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe('chat API auth and rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated chat requests before body parsing or rate-limit RPCs', async () => {
    const rpc = vi.fn();
    const getUser = vi.fn().mockResolvedValue({ data: { user: null } });
    mockCreateClient.mockReturnValue({ auth: { getUser }, rpc });

    const response = await POST(chatRequest({ query: 'What are detention criteria?' }));

    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(response.status).toBe(401);
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects authenticated users when the Supabase rate-limit RPC denies the request', async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'rate-limited-user' } },
    });
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null });
    mockCreateClient.mockReturnValue({ auth: { getUser }, rpc });

    const response = await POST(chatRequest({ query: 'What are detention criteria?' }));

    await expect(response.json()).resolves.toEqual({
      error: 'Rate limit exceeded. Please wait before making more requests.',
    });
    expect(response.status).toBe(429);
    expect(rpc).toHaveBeenCalledWith('check_rate_limit', {
      p_user_id: 'rate-limited-user',
      p_max_requests: 20,
    });
  });
});
