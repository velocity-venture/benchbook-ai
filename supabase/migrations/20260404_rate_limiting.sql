-- Rate limiting table for distributed enforcement across server instances
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  UNIQUE(user_id, window_start)
);

CREATE INDEX idx_rate_limits_user_window ON rate_limits(user_id, window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RPC function: atomic rate limit check + increment
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_max_requests INT DEFAULT 20
) RETURNS BOOLEAN AS $$
DECLARE
  current_window TIMESTAMPTZ;
  current_count INT;
BEGIN
  -- Truncate to minute for 60-second windows
  current_window := date_trunc('minute', now());

  INSERT INTO rate_limits (user_id, window_start, request_count)
  VALUES (p_user_id, current_window, 1)
  ON CONFLICT (user_id, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO current_count;

  RETURN current_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for old rate limit windows (run periodically)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
