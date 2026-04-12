-- ============================================================
-- Member Applications + Application CRM Infrastructure
-- ============================================================

-- 1. member_applications table (mirrors mommy_applications)
CREATE TABLE IF NOT EXISTS public.member_applications (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL,
  full_name        TEXT        NOT NULL,
  age              INT         NOT NULL CHECK (age >= 21 AND age <= 75),
  city             TEXT        NOT NULL,
  occupation       TEXT        NOT NULL,
  income_bracket   TEXT        NOT NULL
                               CHECK (income_bracket IN ('200k_500k', '500k_1m', '1m_plus')),
  motivation       TEXT        NOT NULL,
  photo_url        TEXT,
  referral_source  TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by      UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  invitation_code  TEXT,
  ai_review        JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_applications_status
  ON public.member_applications(status);
CREATE INDEX IF NOT EXISTS idx_member_applications_email
  ON public.member_applications(email);

-- RLS
ALTER TABLE public.member_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can apply as member"
  ON public.member_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage member applications"
  ON public.member_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 2. Widen admin_notes entity_type CHECK to support applicants
-- ============================================================
ALTER TABLE public.admin_notes
  DROP CONSTRAINT IF EXISTS admin_notes_entity_type_check;

ALTER TABLE public.admin_notes
  ADD CONSTRAINT admin_notes_entity_type_check
  CHECK (entity_type IN ('user', 'application', 'member_application', 'mommy_application'));

-- ============================================================
-- 3. application_tags — tagging pre-signup applicants
--    (cannot reuse user_tags; it has a non-nullable FK to users.id)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.application_tags (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type TEXT        NOT NULL CHECK (application_type IN ('member', 'mommy')),
  application_id   UUID        NOT NULL,
  tag              TEXT        NOT NULL,
  added_by         UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(application_type, application_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_application_tags_entity
  ON public.application_tags(application_type, application_id);

ALTER TABLE public.application_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins only on application_tags"
  ON public.application_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 4. Link signed-up users back to their originating application
-- ============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS member_application_id UUID
    REFERENCES public.member_applications(id) ON DELETE SET NULL;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS mommy_application_id UUID
    REFERENCES public.mommy_applications(id) ON DELETE SET NULL;
