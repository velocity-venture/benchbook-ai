-- BenchBook AI - Demo Seed Data
-- Run AFTER creating a user account (signup via the app first)
-- Then replace USER_ID below with the actual auth.users UUID
--
-- Usage: Copy/paste into Supabase SQL Editor after replacing USER_ID
-- ============================================================================

-- IMPORTANT: Replace this with the actual user UUID from auth.users
-- You can find it in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
  v_user_id UUID;
  v_case1 UUID;
  v_case2 UUID;
  v_case3 UUID;
  v_case4 UUID;
  v_case5 UUID;
BEGIN
  -- Get the first user (the demo judge account)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Sign up via the app first, then run this script.';
  END IF;

  -- Update profile with judge details
  UPDATE profiles SET
    full_name = 'M.O. Eckel III',
    title = 'General Sessions & Juvenile Court Judge',
    county = 'Tipton County',
    district = '25th Judicial District',
    organization = 'Tipton County Courts',
    settings = jsonb_build_object(
      'signature_line', 'Hon. M.O. Eckel III',
      'court_name', 'Tipton County Juvenile Court',
      'default_font', 'Times New Roman',
      'show_seal', true
    )
  WHERE id = v_user_id;

  -- ========================================================================
  -- CASES — 5 realistic juvenile cases
  -- ========================================================================

  INSERT INTO cases (id, user_id, case_number, child_initials, child_age, case_type, status, allegation, filed_date, next_hearing, attorney, notes_count)
  VALUES
    (gen_random_uuid(), v_user_id, 'JV-2026-0042', 'J.D.', 15, 'delinquent', 'active',
     'Aggravated burglary - T.C.A. § 39-14-403', '2026-01-15', '2026-02-12', 'Sarah Mitchell, PD', 3)
  RETURNING id INTO v_case1;

  INSERT INTO cases (id, user_id, case_number, child_initials, child_age, case_type, status, allegation, filed_date, next_hearing, attorney, notes_count)
  VALUES
    (gen_random_uuid(), v_user_id, 'JV-2026-0038', 'A.R.', 13, 'dependent_neglect', 'review',
     'Educational neglect - failure to ensure school attendance', '2025-11-20', '2026-02-10', 'James Cooper, GAL', 5)
  RETURNING id INTO v_case2;

  INSERT INTO cases (id, user_id, case_number, child_initials, child_age, case_type, status, allegation, filed_date, next_hearing, attorney, notes_count)
  VALUES
    (gen_random_uuid(), v_user_id, 'JV-2026-0055', 'M.T.', 16, 'delinquent', 'detention_review',
     'Simple assault on school grounds - T.C.A. § 39-13-101', '2026-02-03', '2026-02-11', 'David Park, PD', 2)
  RETURNING id INTO v_case3;

  INSERT INTO cases (id, user_id, case_number, child_initials, child_age, case_type, status, allegation, filed_date, next_hearing, attorney, notes_count)
  VALUES
    (gen_random_uuid(), v_user_id, 'JV-2026-0061', 'K.W.', 14, 'unruly', 'active',
     'Truancy - 10+ unexcused absences', '2026-02-01', '2026-02-14', 'Lisa Nguyen, PD', 1)
  RETURNING id INTO v_case4;

  INSERT INTO cases (id, user_id, case_number, child_initials, child_age, case_type, status, allegation, filed_date, next_hearing, attorney, notes_count)
  VALUES
    (gen_random_uuid(), v_user_id, 'JV-2025-0198', 'B.H.', 12, 'dependent_neglect', 'pending_disposition',
     'Physical abuse substantiated by DCS investigation', '2025-09-10', '2026-02-13', 'Rachel Adams, GAL', 7)
  RETURNING id INTO v_case5;

  -- ========================================================================
  -- HEARINGS — Upcoming docket for next 2 weeks
  -- ========================================================================

  INSERT INTO hearings (user_id, case_id, case_number, hearing_type, hearing_date, start_time, duration_minutes, child_initials, attorney, room, is_virtual)
  VALUES
    (v_user_id, v_case3, 'JV-2026-0055', 'detention_review', CURRENT_DATE + 1, '09:00', 30, 'M.T.', 'David Park, PD', 'Courtroom A', false),
    (v_user_id, v_case2, 'JV-2026-0038', 'review', CURRENT_DATE + 2, '10:00', 45, 'A.R.', 'James Cooper, GAL', 'Courtroom A', false),
    (v_user_id, v_case1, 'JV-2026-0042', 'adjudicatory', CURRENT_DATE + 3, '09:30', 60, 'J.D.', 'Sarah Mitchell, PD', 'Courtroom A', false),
    (v_user_id, v_case5, 'JV-2025-0198', 'disposition', CURRENT_DATE + 4, '14:00', 45, 'B.H.', 'Rachel Adams, GAL', 'Courtroom A', false),
    (v_user_id, v_case4, 'JV-2026-0061', 'preliminary', CURRENT_DATE + 5, '10:30', 30, 'K.W.', 'Lisa Nguyen, PD', 'Courtroom B', true),
    (v_user_id, v_case3, 'JV-2026-0055', 'adjudicatory', CURRENT_DATE + 8, '09:00', 90, 'M.T.', 'David Park, PD', 'Courtroom A', false),
    (v_user_id, v_case2, 'JV-2026-0038', 'disposition', CURRENT_DATE + 10, '14:00', 60, 'A.R.', 'James Cooper, GAL', 'Courtroom A', false);

  -- ========================================================================
  -- DOCUMENTS — Sample generated documents
  -- ========================================================================

  INSERT INTO documents (user_id, case_id, template_id, name, case_number, status, field_values, content)
  VALUES
    (v_user_id, v_case3, 'detention-order', 'Detention Order - M.T.', 'JV-2026-0055', 'signed',
     '{"child_name": "M.T.", "dob": "2009-08-15", "case_number": "JV-2026-0055", "offense": "Simple assault on school grounds", "judge_name": "M.O. Eckel III", "county": "Tipton County"}'::jsonb,
     'ORDER OF DETENTION\n\nIn the matter of M.T., Case No. JV-2026-0055\n\nThe Court having found probable cause to believe the child committed the offense of simple assault...'),
    (v_user_id, v_case1, 'summons', 'Summons - J.D. Adjudicatory', 'JV-2026-0042', 'pending_signature',
     '{"child_name": "J.D.", "case_number": "JV-2026-0042", "hearing_date": "2026-02-12", "hearing_time": "09:30", "judge_name": "M.O. Eckel III"}'::jsonb,
     'SUMMONS\n\nYou are hereby summoned to appear before the Tipton County Juvenile Court...'),
    (v_user_id, v_case5, 'findings-fact', 'Findings of Fact - B.H.', 'JV-2025-0198', 'draft',
     '{"child_name": "B.H.", "case_number": "JV-2025-0198", "judge_name": "M.O. Eckel III"}'::jsonb,
     'FINDINGS OF FACT AND CONCLUSIONS OF LAW\n\nIn the matter of B.H., Case No. JV-2025-0198\n\nThe Court makes the following findings...');

  -- ========================================================================
  -- COMPLIANCE DEADLINES
  -- ========================================================================

  INSERT INTO compliance_deadlines (user_id, case_id, deadline_type, description, due_date, completed)
  VALUES
    (v_user_id, v_case3, 'Detention Review', '72-hour detention review required per T.C.A. § 37-1-117', CURRENT_DATE + 1, false),
    (v_user_id, v_case2, 'FERPA Review', 'Annual FERPA compliance review for educational records', CURRENT_DATE + 7, false),
    (v_user_id, v_case5, 'Disposition Deadline', '30-day disposition deadline from adjudication', CURRENT_DATE + 5, false),
    (v_user_id, v_case1, 'Probable Cause', 'Probable cause determination required within 48 hours', CURRENT_DATE - 2, true),
    (v_user_id, v_case4, 'School Report', 'Request updated school attendance records', CURRENT_DATE + 3, false);

  RAISE NOTICE 'Demo data seeded successfully for user %', v_user_id;
END $$;
