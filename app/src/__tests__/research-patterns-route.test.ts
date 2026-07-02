import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

import { GET, POST } from '../app/api/research-patterns/route';

describe('research patterns API route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires authentication before reading research patterns', async () => {
    const from = vi.fn();
    const rpc = vi.fn();
    const getUser = vi.fn().mockResolvedValue({ data: { user: null } });
    mockCreateClient.mockReturnValue({ auth: { getUser }, from, rpc });

    const response = await GET();

    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('returns formatted research patterns for the authenticated user', async () => {
    const patterns = [
      {
        pattern_type: 'top_queries',
        pattern_data: {
          queries: [
            { query: 'detention criteria', count: 3 },
            { query: 'reasonable efforts', count: 2 },
          ],
        },
        last_updated: '2026-05-14T12:00:00.000Z',
      },
      {
        pattern_type: 'frequent_citations',
        pattern_data: {
          citations: [{ citation: 'T.C.A. 37-1-114', count: 2 }],
        },
        last_updated: '2026-05-14T12:01:00.000Z',
      },
    ];
    const eq = vi.fn().mockResolvedValue({ data: patterns, error: null });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'research-user' } },
    });
    mockCreateClient.mockReturnValue({ auth: { getUser }, from });

    const response = await GET();

    await expect(response.json()).resolves.toEqual({
      topQueries: patterns[0].pattern_data.queries,
      frequentCitations: patterns[1].pattern_data.citations,
      lastUpdated: '2026-05-14T12:00:00.000Z',
    });
    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith('research_patterns');
    expect(select).toHaveBeenCalledWith('pattern_type, pattern_data, last_updated');
    expect(eq).toHaveBeenCalledWith('user_id', 'research-user');
  });

  it('returns a safe 500 when research pattern reads fail', async () => {
    const eq = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('database detail that should not be returned'),
    });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'research-user' } },
    });
    mockCreateClient.mockReturnValue({ auth: { getUser }, from });

    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(JSON.parse(body)).toEqual({ error: 'Failed to retrieve research patterns' });
    expect(body).not.toContain('database detail');
    expect(body).not.toContain('stack');
    expect(body).not.toContain('Error:');
  });

  it('requires authentication before forcing a research-pattern update', async () => {
    const rpc = vi.fn();
    const getUser = vi.fn().mockResolvedValue({ data: { user: null } });
    mockCreateClient.mockReturnValue({ auth: { getUser }, rpc });

    const response = await POST();

    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('forces a research-pattern refresh for the authenticated user', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'research-user' } },
    });
    mockCreateClient.mockReturnValue({ auth: { getUser }, rpc });

    const response = await POST();

    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'Research patterns updated',
    });
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('update_user_research_patterns', {
      target_user_id: 'research-user',
    });
  });

  it('returns a safe 500 when forced research-pattern refresh fails', async () => {
    const rpc = vi.fn().mockResolvedValue({
      error: new Error('rpc detail that should not be returned'),
    });
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'research-user' } },
    });
    mockCreateClient.mockReturnValue({ auth: { getUser }, rpc });

    const response = await POST();
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(JSON.parse(body)).toEqual({ error: 'Failed to update research patterns' });
    expect(body).not.toContain('rpc detail');
    expect(body).not.toContain('stack');
    expect(body).not.toContain('Error:');
  });
});
