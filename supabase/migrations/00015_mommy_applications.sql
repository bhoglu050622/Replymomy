-- Mommy applications (public, pre-auth)
CREATE TABLE IF NOT EXISTS public.mommy_applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  age               INT NOT NULL CHECK (age >= 18 AND age <= 65),
  instagram         TEXT,
  city              TEXT NOT NULL,
  motivation        TEXT NOT NULL,
  photo_urls        TEXT[] NOT NULL DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  invitation_code   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mommy_applications_status ON public.mommy_applications(status);
CREATE INDEX IF NOT EXISTS idx_mommy_applications_email ON public.mommy_applications(email);

-- Extra profile fields for mommy-specific onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline               TEXT,
  ADD COLUMN IF NOT EXISTS preferred_member_tiers TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_active_matches      INT     DEFAULT 5,
  ADD COLUMN IF NOT EXISTS response_commitment     TEXT    DEFAULT '48h';

-- RLS: anyone can insert an application; only admins can read/update
ALTER TABLE public.mommy_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can apply"
  ON public.mommy_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage applications"
  ON public.mommy_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
