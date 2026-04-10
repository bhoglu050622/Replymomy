CREATE TABLE public.invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  status invitation_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES public.users(id),
  target_role user_role NOT NULL DEFAULT 'member',
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add the FK from users to invitation_codes (deferred from 00002)
ALTER TABLE public.users
  ADD CONSTRAINT users_invitation_code_fk
  FOREIGN KEY (invitation_code_id) REFERENCES public.invitation_codes(id);

CREATE INDEX idx_invitation_codes_code ON public.invitation_codes(code);
CREATE INDEX idx_invitation_codes_status ON public.invitation_codes(status);
