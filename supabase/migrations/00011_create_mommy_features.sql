CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type gallery_item_type NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT TRUE,
  token_cost INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.gallery_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gallery_item_id UUID REFERENCES public.gallery_items(id),
  owner_id UUID NOT NULL REFERENCES public.users(id),
  unlock_type TEXT NOT NULL,
  token_cost INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, gallery_item_id)
);

CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mommy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.mommy_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mommy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  gross_amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  net_amount_cents INTEGER NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  payout_status payout_status NOT NULL DEFAULT 'pending',
  payout_batch_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.spotlight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mommy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  nomination_count INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mommy_id, week_start)
);

CREATE INDEX idx_gallery_items_owner ON public.gallery_items(owner_id);
CREATE INDEX idx_gallery_unlocks_user ON public.gallery_unlocks(user_id);
CREATE INDEX idx_availability_mommy ON public.availability_slots(mommy_id);
CREATE INDEX idx_mommy_earnings_mommy ON public.mommy_earnings(mommy_id);
CREATE INDEX idx_spotlight_week ON public.spotlight_history(week_start);
