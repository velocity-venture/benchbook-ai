-- Persist answer trust metadata so saved research sessions keep their
-- confidence, warning, and coverage context after reload.

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS trust_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
