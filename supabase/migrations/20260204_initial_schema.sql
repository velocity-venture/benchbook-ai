-- BenchBook AI - Initial Database Schema
-- For Tennessee Juvenile Court Case Management
--
-- Run against a Supabase project:
--   supabase db push
-- Or paste into Supabase SQL Editor

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE case_type AS ENUM ('delinquent', 'dependent_neglect', 'unruly');
CREATE TYPE case_status AS ENUM ('active', 'pending_disposition', 'review', 'detention_review', 'closed');
CREATE TYPE hearing_type AS ENUM ('preliminary', 'detention_review', 'adjudicatory', 'disposition', 'review', 'transfer');
CREATE TYPE document_status AS ENUM ('draft', 'pending_signature', 'signed');
CREATE TYPE document_category AS ENUM ('orders', 'notices', 'petitions', 'findings');

-- ============================================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  title TEXT DEFAULT 'Judge',
  county TEXT,
  district TEXT,
  email TEXT,
  phone TEXT,
  organization TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- CASES
-- ============================================================================

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  child_initials TEXT NOT NULL,
  child_age INTEGER,
  case_type case_type NOT NULL,
  status case_status NOT NULL DEFAULT 'active',
  allegation TEXT,
  filed_date DATE,
  next_hearing DATE,
  attorney TEXT,
  notes_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, case_number)
);

CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_next_hearing ON cases(next_hearing);

-- ============================================================================
-- HEARINGS (Docket entries)
-- ============================================================================

CREATE TABLE hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  case_number TEXT NOT NULL,
  hearing_type hearing_type NOT NULL,
  hearing_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  child_initials TEXT,
  attorney TEXT,
  room TEXT DEFAULT 'Courtroom A',
  is_virtual BOOLEAN DEFAULT false,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hearings_user_id ON hearings(user_id);
CREATE INDEX idx_hearings_date ON hearings(hearing_date);
CREATE INDEX idx_hearings_case_id ON hearings(case_id);

-- ============================================================================
-- DOCUMENT TEMPLATES
-- ============================================================================

CREATE TABLE document_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category document_category NOT NULL,
  content_template TEXT,
  fields JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default templates
INSERT INTO document_templates (id, name, description, category) VALUES
  ('detention-order', 'Detention Order', 'Order to detain a juvenile in secure custody', 'orders'),
  ('disposition-order', 'Disposition Order', 'Final disposition order for adjudicated cases', 'orders'),
  ('transfer-order', 'Transfer Order', 'Order to transfer case to criminal court', 'orders'),
  ('release-order', 'Release Order', 'Order releasing juvenile from detention', 'orders'),
  ('summons', 'Summons', 'Court summons for hearing appearance', 'notices'),
  ('petition-delinquent', 'Delinquency Petition', 'Petition alleging delinquent conduct', 'petitions'),
  ('petition-dependent', 'Dependency Petition', 'Petition for dependent/neglected child', 'petitions'),
  ('findings-fact', 'Findings of Fact', 'Written findings supporting court orders', 'findings');

-- ============================================================================
-- DOCUMENTS (generated from templates)
-- ============================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  template_id TEXT REFERENCES document_templates(id),
  name TEXT NOT NULL,
  case_number TEXT,
  status document_status NOT NULL DEFAULT 'draft',
  content TEXT,
  field_values JSONB DEFAULT '{}',
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================================================
-- CASE NOTES
-- ============================================================================

CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_case_notes_case_id ON case_notes(case_id);

-- Update notes_count on cases when notes are added/removed
CREATE OR REPLACE FUNCTION update_notes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cases SET notes_count = notes_count + 1, updated_at = now()
    WHERE id = NEW.case_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cases SET notes_count = notes_count - 1, updated_at = now()
    WHERE id = OLD.case_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_case_note_change
  AFTER INSERT OR DELETE ON case_notes
  FOR EACH ROW EXECUTE FUNCTION update_notes_count();

-- ============================================================================
-- CHAT HISTORY (AI research conversations)
-- ============================================================================

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Research',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- ============================================================================
-- COMPLIANCE TRACKING
-- ============================================================================

CREATE TABLE compliance_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  deadline_type TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_compliance_user_id ON compliance_deadlines(user_id);
CREATE INDEX idx_compliance_due_date ON compliance_deadlines(due_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_deadlines ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cases: users can only CRUD their own cases
CREATE POLICY cases_select ON cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cases_insert ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cases_update ON cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cases_delete ON cases FOR DELETE USING (auth.uid() = user_id);

-- Hearings: users can only CRUD their own hearings
CREATE POLICY hearings_select ON hearings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY hearings_insert ON hearings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY hearings_update ON hearings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY hearings_delete ON hearings FOR DELETE USING (auth.uid() = user_id);

-- Documents: users can only CRUD their own documents
CREATE POLICY documents_select ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY documents_insert ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY documents_update ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY documents_delete ON documents FOR DELETE USING (auth.uid() = user_id);

-- Case notes: users can only CRUD their own notes
CREATE POLICY case_notes_select ON case_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY case_notes_insert ON case_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY case_notes_update ON case_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY case_notes_delete ON case_notes FOR DELETE USING (auth.uid() = user_id);

-- Chat: users can only access their own sessions
CREATE POLICY chat_sessions_select ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_insert ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_sessions_delete ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages: users can access messages in their sessions
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  ));
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  ));

-- Compliance: users can only access their own deadlines
CREATE POLICY compliance_select ON compliance_deadlines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY compliance_insert ON compliance_deadlines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY compliance_update ON compliance_deadlines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY compliance_delete ON compliance_deadlines FOR DELETE USING (auth.uid() = user_id);

-- Document templates: readable by all authenticated users
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_select ON document_templates FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON hearings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON case_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
