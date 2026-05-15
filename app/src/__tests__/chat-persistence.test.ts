import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

import {
  createSession,
  deleteSession,
  getSessionMessages,
  getSessions,
  saveMessage,
  toggleFeedback,
} from '../lib/chat-persistence';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('chat persistence auth boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('lists sessions through the RLS-protected sessions table in newest-first order', async () => {
    const sessions = [{ id: 'session-2' }, { id: 'session-1' }];
    const order = vi.fn().mockResolvedValue({ data: sessions, error: null });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });

    mockCreateClient.mockReturnValue({ from });

    await expect(getSessions()).resolves.toEqual(sessions);
    expect(from).toHaveBeenCalledWith('chat_sessions');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });

  it('reads messages for a single session in chronological order', async () => {
    const messages = [{ id: 'message-1' }, { id: 'message-2' }];
    const order = vi.fn().mockResolvedValue({ data: messages, error: null });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    mockCreateClient.mockReturnValue({ from });

    await expect(getSessionMessages('session-1')).resolves.toEqual(messages);
    expect(from).toHaveBeenCalledWith('chat_messages');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('session_id', 'session-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('saves a message and touches the parent session timestamp', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-14T12:00:00.000Z'));

    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq: updateEq });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === 'chat_messages') return { insert };
      if (table === 'chat_sessions') return { update };
      throw new Error(`Unexpected table ${table}`);
    });

    mockCreateClient.mockReturnValue({ from });

    await expect(saveMessage('session-1', 'user', 'What is the standard?')).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith('chat_messages');
    expect(insert).toHaveBeenCalledWith({
      session_id: 'session-1',
      role: 'user',
      content: 'What is the standard?',
    });
    expect(from).toHaveBeenCalledWith('chat_sessions');
    expect(update).toHaveBeenCalledWith({ updated_at: '2026-05-14T12:00:00.000Z' });
    expect(updateEq).toHaveBeenCalledWith('id', 'session-1');
  });

  it('removes existing feedback instead of inserting a duplicate', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'feedback-1' }, error: null });
    const eqUser = vi.fn().mockReturnValue({ maybeSingle });
    const eqType = vi.fn().mockReturnValue({ eq: eqUser });
    const eqMessage = vi.fn().mockReturnValue({ eq: eqType });
    const select = vi.fn().mockReturnValue({ eq: eqMessage });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const deleteFn = vi.fn().mockReturnValue({ eq: deleteEq });
    const insert = vi.fn();
    const from = vi.fn().mockReturnValue({ select, delete: deleteFn, insert });

    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from,
    });

    await expect(toggleFeedback('message-1', 'bookmark')).resolves.toEqual({ action: 'removed' });
    expect(from).toHaveBeenCalledWith('chat_feedback');
    expect(eqMessage).toHaveBeenCalledWith('message_id', 'message-1');
    expect(eqType).toHaveBeenCalledWith('feedback_type', 'bookmark');
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
    expect(deleteEq).toHaveBeenCalledWith('id', 'feedback-1');
    expect(insert).not.toHaveBeenCalled();
  });

  it('inserts feedback with the authenticated user when none exists', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqUser = vi.fn().mockReturnValue({ maybeSingle });
    const eqType = vi.fn().mockReturnValue({ eq: eqUser });
    const eqMessage = vi.fn().mockReturnValue({ eq: eqType });
    const select = vi.fn().mockReturnValue({ eq: eqMessage });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const deleteFn = vi.fn();
    const from = vi.fn().mockReturnValue({ select, delete: deleteFn, insert });

    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from,
    });

    await expect(toggleFeedback('message-1', 'thumbs_up')).resolves.toEqual({ action: 'added' });
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      message_id: 'message-1',
      feedback_type: 'thumbs_up',
    });
    expect(deleteFn).not.toHaveBeenCalled();
  });
});

describe('chat persistence RLS migration coverage', () => {
  it('defines user-isolating RLS policies for sessions, messages, and feedback', () => {
    const initialSchema = readFileSync(
      resolve(process.cwd(), '../supabase/migrations/20260204_initial_schema.sql'),
      'utf8'
    );
    const chatPersistence = readFileSync(
      resolve(process.cwd(), '../supabase/migrations/20260209003525_init_chat_persistence.sql'),
      'utf8'
    );

    expect(initialSchema).toContain(
      'CREATE POLICY chat_sessions_select ON chat_sessions FOR SELECT USING (auth.uid() = user_id);'
    );
    expect(initialSchema).toContain(
      'CREATE POLICY chat_sessions_insert ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);'
    );
    expect(initialSchema).toContain(
      'CREATE POLICY chat_sessions_delete ON chat_sessions FOR DELETE USING (auth.uid() = user_id);'
    );
    expect(initialSchema).toContain('CREATE POLICY chat_messages_select ON chat_messages FOR SELECT');
    expect(initialSchema).toContain('chat_sessions.user_id = auth.uid()');
    expect(initialSchema).toContain('CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT');
    expect(chatPersistence).toContain('CREATE POLICY chat_sessions_update ON chat_sessions');
    expect(chatPersistence).toContain('WITH CHECK (auth.uid() = user_id);');
    expect(chatPersistence).toContain('CREATE POLICY chat_messages_delete ON chat_messages');
    expect(chatPersistence).toContain('CREATE POLICY chat_feedback_select ON chat_feedback');
    expect(chatPersistence).toContain('CREATE POLICY chat_feedback_insert ON chat_feedback');
    expect(chatPersistence).toContain('CREATE POLICY chat_feedback_delete ON chat_feedback');
    expect(chatPersistence).toContain('UNIQUE(user_id, message_id, feedback_type)');
  });
});
