-- Manual (GPay) payment requests submitted by users before admin approval

CREATE TABLE IF NOT EXISTS public.manual_payments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier            TEXT        NOT NULL,            -- 'pro' | 'unlimited'
  amount_display  TEXT        NOT NULL,            -- e.g. '₹499' for display
  status          TEXT        NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at     TIMESTAMPTZ,
  approved_by     UUID        REFERENCES public.users(id),
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_manual_payments_user
  ON public.manual_payments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_manual_payments_pending
  ON public.manual_payments(created_at DESC)
  WHERE status = 'pending';

ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;

-- Users can see and insert their own payment requests
CREATE POLICY "users_select_own_payments"
  ON public.manual_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_payments"
  ON public.manual_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
