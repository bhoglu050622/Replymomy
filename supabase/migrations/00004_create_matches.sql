CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mommy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status match_status NOT NULL DEFAULT 'pending',
  member_responded BOOLEAN NOT NULL DEFAULT FALSE,
  mommy_responded BOOLEAN NOT NULL DEFAULT FALSE,
  member_response match_status,
  mommy_response match_status,
  match_score NUMERIC(5,2),
  match_date DATE NOT NULL DEFAULT CURRENT_DATE,
  stream_channel_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, mommy_id, match_date)
);

CREATE INDEX idx_matches_member ON public.matches(member_id, match_date);
CREATE INDEX idx_matches_mommy ON public.matches(mommy_id, match_date);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_date ON public.matches(match_date);
