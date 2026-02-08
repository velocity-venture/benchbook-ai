-- Waitlist signups from the landing page
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'landing_page',
  created_at timestamptz DEFAULT now()
);

-- Allow anonymous inserts (landing page has no auth)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- Index for quick duplicate checks
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);
