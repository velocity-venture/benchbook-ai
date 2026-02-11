-- ============================================================================
-- Chat Persistence & Feedback (DM-02, DM-08)
-- Adds missing columns, policies, triggers, and feedback table to make
-- chat_sessions and chat_messages fully functional for persistence.
-- ============================================================================

-- 1. Add message_count to chat_sessions (mirrors cases.notes_count pattern)
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS message_count INT DEFAULT 0;

-- 2. Missing RLS policies
--    chat_sessions: has SELECT, INSERT, DELETE but no UPDATE
--    chat_messages: has SELECT, INSERT but no UPDATE or DELETE

CREATE POLICY chat_sessions_update ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY chat_messages_delete ON chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- 3. Trigger to maintain message_count on chat_sessions
CREATE OR REPLACE FUNCTION update_chat_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_sessions
    SET message_count = message_count + 1, updated_at = now()
    WHERE id = NEW.session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_sessions
    SET message_count = message_count - 1, updated_at = now()
    WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_chat_message_change
  AFTER INSERT OR DELETE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_message_count();

-- 4. Chat feedback table (thumbs up/down, bookmarks)
CREATE TABLE chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'bookmark')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, message_id, feedback_type)
);

CREATE INDEX idx_chat_feedback_user ON chat_feedback(user_id);
CREATE INDEX idx_chat_feedback_message ON chat_feedback(message_id);

ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_feedback_select ON chat_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_feedback_insert ON chat_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_feedback_delete ON chat_feedback
  FOR DELETE USING (auth.uid() = user_id);
