import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

import {
  createSession,
  deleteSession,
  toggleFeedback,
} from '../lib/chat-persistence';

describe('chat persistence auth boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects session creation when no user is authenticated', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    await expect(createSession('Bench memo')).rejects.toThrow('Unauthorized');
  });

  it('rejects session deletion when no user is authenticated', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    await expect(deleteSession('session-1')).rejects.toThrow('Unauthorized');
  });

  it('rejects feedback changes when no user is authenticated', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    await expect(toggleFeedback('message-1', 'bookmark')).rejects.toThrow('Unauthorized');
  });

  it('creates sessions for the authenticated user only', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'session-1' }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from,
    });

    await expect(createSession('Bench memo')).resolves.toEqual({ id: 'session-1' });
    expect(from).toHaveBeenCalledWith('chat_sessions');
    expect(insert).toHaveBeenCalledWith({ user_id: 'user-1', title: 'Bench memo' });
  });

  it('scopes session deletion by both session id and user id', async () => {
    const eqUser = vi.fn().mockResolvedValue({ error: null });
    const eqSession = vi.fn().mockReturnValue({ eq: eqUser });
    const deleteFn = vi.fn().mockReturnValue({ eq: eqSession });
    const from = vi.fn().mockReturnValue({ delete: deleteFn });

    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from,
    });

    await expect(deleteSession('session-1')).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith('chat_sessions');
    expect(eqSession).toHaveBeenCalledWith('id', 'session-1');
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
