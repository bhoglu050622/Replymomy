CREATE TABLE public.gift_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type gift_type NOT NULL,
  price_cents INTEGER NOT NULL,
  token_cost INTEGER,
  image_url TEXT,
  animation_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.gifts_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gift_id UUID NOT NULL REFERENCES public.gift_catalog(id),
  transaction_id UUID REFERENCES public.transactions(id),
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gifts_sent_sender ON public.gifts_sent(sender_id);
CREATE INDEX idx_gifts_sent_recipient ON public.gifts_sent(recipient_id);

-- Seed initial gift catalog
INSERT INTO public.gift_catalog (name, description, type, price_cents, token_cost, animation_key, sort_order) VALUES
  ('Single Rose', 'A simple gesture', 'virtual', 500, 5, 'rose', 1),
  ('Champagne Toast', 'Raise a glass', 'virtual', 1500, 15, 'champagne', 2),
  ('Diamond Whisper', 'A glimmer of intent', 'virtual', 2500, 25, 'diamond', 3),
  ('Bouquet of Peonies', 'Real flowers, hand-delivered', 'irl', 7500, NULL, NULL, 4),
  ('Vintage Champagne', 'Bottle of Dom Pérignon', 'irl', 25000, NULL, NULL, 5),
  ('Cartier Trinity', 'A token to remember the night', 'irl', 50000, NULL, NULL, 6);
