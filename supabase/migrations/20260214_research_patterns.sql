-- ============================================================================
-- Research Patterns Tracking (Personal Legal Research Enhancement)
-- Tracks user search queries, document views, and citation patterns
-- to build personalized legal research shortcuts and analytics.
-- ============================================================================

-- 1. Research queries tracking table
CREATE TABLE research_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  query_type TEXT DEFAULT 'chat' CHECK (query_type IN ('chat', 'search', 'browse')),
  response_sources JSONB, -- Store source citations that were returned
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Document views tracking (when user clicks on TCA, TRJPP, DCS sections)
CREATE TABLE document_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('TCA', 'TRJPP', 'DCS', 'LOCAL')),
  document_id TEXT NOT NULL, -- e.g., "37-1-114", "TRJPP-1.02", "DCS-9.1"
  document_title TEXT NOT NULL,
  view_duration_seconds INT DEFAULT 0,
  accessed_from TEXT DEFAULT 'direct' CHECK (accessed_from IN ('direct', 'chat', 'search', 'suggestion')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Research patterns analytics table (computed/cached data)
CREATE TABLE research_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('top_queries', 'frequent_citations', 'document_usage', 'search_themes')),
  pattern_data JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pattern_type)
);

-- 4. Indexes for performance
CREATE INDEX idx_research_queries_user ON research_queries(user_id);
CREATE INDEX idx_research_queries_created ON research_queries(created_at DESC);
CREATE INDEX idx_document_views_user ON document_views(user_id);
CREATE INDEX idx_document_views_type ON document_views(document_type);
CREATE INDEX idx_document_views_created ON document_views(created_at DESC);
CREATE INDEX idx_research_patterns_user ON research_patterns(user_id);

-- 5. Row Level Security
ALTER TABLE research_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_patterns ENABLE ROW LEVEL SECURITY;

-- Policies for research_queries
CREATE POLICY research_queries_select ON research_queries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY research_queries_insert ON research_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for document_views
CREATE POLICY document_views_select ON document_views
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY document_views_insert ON document_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY document_views_update ON document_views
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for research_patterns
CREATE POLICY research_patterns_select ON research_patterns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY research_patterns_insert ON research_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY research_patterns_update ON research_patterns
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Function to update research patterns (called by background job or trigger)
CREATE OR REPLACE FUNCTION update_user_research_patterns(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Update top queries (most frequent in last 30 days)
  INSERT INTO research_patterns (user_id, pattern_type, pattern_data)
  VALUES (target_user_id, 'top_queries', (
    SELECT jsonb_build_object(
      'queries', jsonb_agg(
        jsonb_build_object(
          'query', query,
          'count', query_count,
          'last_used', last_used
        ) ORDER BY query_count DESC
      ),
      'updated_at', now()
    )
    FROM (
      SELECT 
        query, 
        COUNT(*) as query_count,
        MAX(created_at) as last_used
      FROM research_queries 
      WHERE user_id = target_user_id 
        AND created_at > now() - INTERVAL '30 days'
      GROUP BY query
      ORDER BY query_count DESC
      LIMIT 10
    ) top_q
  ))
  ON CONFLICT (user_id, pattern_type) 
  DO UPDATE SET 
    pattern_data = EXCLUDED.pattern_data,
    last_updated = now();

  -- Update frequent citations (most accessed documents)
  INSERT INTO research_patterns (user_id, pattern_type, pattern_data)
  VALUES (target_user_id, 'frequent_citations', (
    SELECT jsonb_build_object(
      'citations', jsonb_agg(
        jsonb_build_object(
          'document_type', document_type,
          'document_id', document_id,
          'title', document_title,
          'view_count', view_count,
          'last_viewed', last_viewed
        ) ORDER BY view_count DESC
      ),
      'updated_at', now()
    )
    FROM (
      SELECT 
        document_type,
        document_id,
        document_title,
        COUNT(*) as view_count,
        MAX(created_at) as last_viewed
      FROM document_views 
      WHERE user_id = target_user_id 
        AND created_at > now() - INTERVAL '30 days'
      GROUP BY document_type, document_id, document_title
      ORDER BY view_count DESC
      LIMIT 15
    ) freq_docs
  ))
  ON CONFLICT (user_id, pattern_type) 
  DO UPDATE SET 
    pattern_data = EXCLUDED.pattern_data,
    last_updated = now();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;