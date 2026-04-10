CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  referral_source TEXT,
  position INTEGER,
  promoted_at TIMESTAMPTZ,
  invitation_code_id UUID REFERENCES public.invitation_codes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_email ON public.waitlist(email);
