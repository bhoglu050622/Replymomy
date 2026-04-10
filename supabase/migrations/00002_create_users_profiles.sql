-- Core users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  status user_status NOT NULL DEFAULT 'pending_invite',
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  invitation_code_id UUID,
  verification_status verification_status NOT NULL DEFAULT 'not_started',
  persona_inquiry_id TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_connect_account_id TEXT UNIQUE,
  member_tier member_tier,
  mommy_tier mommy_tier,
  mommy_badge mommy_badge,
  token_balance INTEGER NOT NULL DEFAULT 0,
  is_spotlight BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT CHECK (LENGTH(bio) <= 400),
  date_of_birth DATE,
  location_city TEXT,
  location_country TEXT,
  photo_urls TEXT[] CHECK (array_length(photo_urls, 1) <= 3),
  voice_note_url TEXT,
  desires TEXT[] CHECK (array_length(desires, 1) <= 3),
  preferred_age_min INTEGER,
  preferred_age_max INTEGER,
  preferred_locations TEXT[],
  preferred_interests TEXT[],
  show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
  show_last_active BOOLEAN NOT NULL DEFAULT TRUE,
  allow_direct_messages BOOLEAN NOT NULL DEFAULT TRUE,
  blur_photos_for_free BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX idx_profiles_user ON public.profiles(user_id);
CREATE INDEX idx_profiles_location ON public.profiles(location_city, location_country);
