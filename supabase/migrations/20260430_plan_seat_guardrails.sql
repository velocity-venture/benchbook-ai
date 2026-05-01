-- ============================================================================
-- Plan and Seat Guardrails
-- Adds minimal launch-safe commercial structure without implementing billing.
-- ============================================================================

CREATE TYPE subscription_plan AS ENUM ('solo', 'court', 'enterprise');
CREATE TYPE court_account_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE local_rules_status AS ENUM ('unknown', 'not_applicable', 'available', 'uploaded');

CREATE TABLE court_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  county TEXT,
  plan subscription_plan NOT NULL DEFAULT 'solo',
  seat_limit INT NOT NULL DEFAULT 1,
  local_rules_status local_rules_status NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT court_accounts_seat_limit_check CHECK (
    (plan = 'solo' AND seat_limit = 1)
    OR (plan = 'court' AND seat_limit BETWEEN 1 AND 4)
    OR (plan = 'enterprise' AND seat_limit >= 5)
  )
);

CREATE TABLE court_account_members (
  court_account_id UUID NOT NULL REFERENCES court_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role court_account_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (court_account_id, user_id)
);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan subscription_plan NOT NULL DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS court_account_id UUID REFERENCES court_accounts(id) ON DELETE SET NULL;

ALTER TABLE court_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_account_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY court_accounts_member_select ON court_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM court_account_members
      WHERE court_account_members.court_account_id = court_accounts.id
      AND court_account_members.user_id = auth.uid()
    )
  );

CREATE POLICY court_accounts_admin_update ON court_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM court_account_members
      WHERE court_account_members.court_account_id = court_accounts.id
      AND court_account_members.user_id = auth.uid()
      AND court_account_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM court_account_members
      WHERE court_account_members.court_account_id = court_accounts.id
      AND court_account_members.user_id = auth.uid()
      AND court_account_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY court_account_members_select ON court_account_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM court_account_members viewer
      WHERE viewer.court_account_id = court_account_members.court_account_id
      AND viewer.user_id = auth.uid()
      AND viewer.role IN ('owner', 'admin')
    )
  );

CREATE POLICY court_account_members_admin_insert ON court_account_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM court_account_members viewer
      JOIN court_accounts account ON account.id = viewer.court_account_id
      WHERE viewer.court_account_id = court_account_members.court_account_id
      AND viewer.user_id = auth.uid()
      AND viewer.role IN ('owner', 'admin')
      AND (
        account.plan = 'enterprise'
        OR (
          SELECT COUNT(*)
          FROM court_account_members existing
          WHERE existing.court_account_id = court_account_members.court_account_id
        ) < account.seat_limit
      )
    )
  );

CREATE POLICY court_account_members_admin_delete ON court_account_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM court_account_members viewer
      WHERE viewer.court_account_id = court_account_members.court_account_id
      AND viewer.user_id = auth.uid()
      AND viewer.role IN ('owner', 'admin')
    )
  );

CREATE TRIGGER set_updated_at BEFORE UPDATE ON court_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
