-- ============================================================
-- Test User Seed — run this in Supabase SQL Editor
-- Member : test@gmail.com    / 1234
-- Admin  : admin@replymommy.com / admin123
-- ============================================================

DO $$
DECLARE
  v_uid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

  -- 1. Auth user (skip if already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@gmail.com') THEN

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at
    ) VALUES (
      v_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'test@gmail.com',
      crypt('1234', gen_salt('bf')),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      NOW(),
      NOW()
    );

    -- Identity record required for email/password login
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_uid,
      v_uid,
      'test@gmail.com',
      jsonb_build_object(
        'sub',            v_uid::text,
        'email',          'test@gmail.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

  ELSE
    SELECT id INTO v_uid FROM auth.users WHERE email = 'test@gmail.com';
  END IF;

  -- 2. Activate user (trigger already created the public.users row)
  UPDATE public.users
  SET
    status               = 'active',
    role                 = 'member',
    member_tier          = 'gold',
    token_balance        = 100,
    verification_status  = 'approved',
    last_active_at       = NOW(),
    updated_at           = NOW()
  WHERE id = v_uid;

  -- 3. Profile
  INSERT INTO public.profiles (
    user_id,
    display_name,
    bio,
    date_of_birth,
    location_city,
    location_country,
    desires,
    preferred_age_min,
    preferred_age_max,
    preferred_locations,
    preferred_interests
  ) VALUES (
    v_uid,
    'Alex',
    'A distinguished member of the guild. Discerning, private, always seeking exceptional company.',
    '1988-06-15',
    'New York',
    'US',
    ARRAY['Travel', 'Fine Dining', 'Art'],
    26,
    42,
    ARRAY['New York', 'London', 'Miami'],
    ARRAY['Travel', 'Fine Dining', 'Art', 'Wellness']
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    bio          = EXCLUDED.bio;

END $$;

-- ============================================================
-- Admin user
-- ============================================================
DO $$
DECLARE
  v_uid UUID := '00000000-0000-0000-0000-000000000002';
BEGIN

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@replymommy.com') THEN

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_sent_at, confirmation_token,
      recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      v_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'admin@replymommy.com',
      crypt('admin123', gen_salt('bf')),
      NOW(), NOW(), '', '', '', '',
      '{"provider": "email", "providers": ["email"]}',
      '{}', false, NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_uid, v_uid, 'admin@replymommy.com',
      jsonb_build_object('sub', v_uid::text, 'email', 'admin@replymommy.com', 'email_verified', true, 'phone_verified', false),
      'email', NOW(), NOW(), NOW()
    );

  ELSE
    SELECT id INTO v_uid FROM auth.users WHERE email = 'admin@replymommy.com';
  END IF;

  UPDATE public.users
  SET
    status              = 'active',
    role                = 'admin',
    verification_status = 'approved',
    last_active_at      = NOW(),
    updated_at          = NOW()
  WHERE id = v_uid;

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (v_uid, 'Admin')
  ON CONFLICT (user_id) DO UPDATE SET display_name = 'Admin';

END $$;

-- ============================================================
-- Mommy 1 — Priya Sharma (Indian, Mumbai) — Elite tier, Spotlight
-- ============================================================
DO $$
DECLARE
  v_uid UUID := '00000000-0000-0000-0000-000000000003';
  v_member UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'priya@replymommy.com') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_sent_at, confirmation_token,
      recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'priya@replymommy.com',
      crypt('test1234', gen_salt('bf')),
      NOW(), NOW(), '', '', '', '',
      '{"provider": "email", "providers": ["email"]}',
      '{}', false, NOW(), NOW()
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_uid, v_uid, 'priya@replymommy.com',
      jsonb_build_object('sub', v_uid::text, 'email', 'priya@replymommy.com', 'email_verified', true, 'phone_verified', false),
      'email', NOW(), NOW(), NOW());
  ELSE
    SELECT id INTO v_uid FROM auth.users WHERE email = 'priya@replymommy.com';
  END IF;

  UPDATE public.users SET
    status = 'active', role = 'mommy', mommy_tier = 'elite',
    mommy_badge = 'elite', is_spotlight = true,
    verification_status = 'approved', last_active_at = NOW(), updated_at = NOW()
  WHERE id = v_uid;

  INSERT INTO public.profiles (
    user_id, display_name, bio, date_of_birth,
    location_city, location_country, photo_urls,
    headline, desires,
    preferred_age_min, preferred_age_max,
    preferred_locations,
    max_active_matches, response_commitment
  ) VALUES (
    v_uid,
    'Priya',
    'Art curator and avid traveller based between Mumbai and London. I find meaning in slow mornings, gallery openings, and conversations that outlast the wine. I bring warmth, intellect, and a very particular taste in company.',
    '1991-03-18',
    'Mumbai', 'IN',
    ARRAY[
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/women/45.jpg',
      'https://randomuser.me/api/portraits/women/46.jpg'
    ],
    'Art curator. Reluctant morning person. Always overdressed.',
    ARRAY['Arts & Culture', 'Travel', 'Fine Dining'],
    28, 50,
    ARRAY['Mumbai', 'London', 'Dubai', 'Paris'],
    3, '24h'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name, bio = EXCLUDED.bio,
    photo_urls = EXCLUDED.photo_urls, headline = EXCLUDED.headline,
    desires = EXCLUDED.desires,
    preferred_locations = EXCLUDED.preferred_locations;

  -- Gallery items (2 free, 3 premium)
  INSERT INTO public.gallery_items (owner_id, type, cloudinary_public_id, url, thumbnail_url, is_premium, token_cost, sort_order)
  VALUES
    (v_uid, 'photo', 'seed/priya/g1', 'https://randomuser.me/api/portraits/women/49.jpg', 'https://randomuser.me/api/portraits/women/49.jpg', false, 0,  0),
    (v_uid, 'photo', 'seed/priya/g2', 'https://randomuser.me/api/portraits/women/50.jpg', 'https://randomuser.me/api/portraits/women/50.jpg', false, 0,  1),
    (v_uid, 'photo', 'seed/priya/g3', 'https://randomuser.me/api/portraits/women/51.jpg', 'https://randomuser.me/api/portraits/women/51.jpg', true,  10, 2),
    (v_uid, 'photo', 'seed/priya/g4', 'https://randomuser.me/api/portraits/women/52.jpg', 'https://randomuser.me/api/portraits/women/52.jpg', true,  10, 3),
    (v_uid, 'photo', 'seed/priya/g5', 'https://randomuser.me/api/portraits/women/53.jpg', 'https://randomuser.me/api/portraits/women/53.jpg', true,  15, 4)
  ON CONFLICT DO NOTHING;

  -- Match with test member
  INSERT INTO public.matches (member_id, mommy_id, status, match_score, match_date, expires_at)
  VALUES (v_member, v_uid, 'pending', 94.5, CURRENT_DATE, NOW() + INTERVAL '7 days')
  ON CONFLICT (member_id, mommy_id, match_date) DO NOTHING;

END $$;

-- ============================================================
-- Mommy 2 — Anika Mehta (Indian, Delhi) — Icon tier
-- ============================================================
DO $$
DECLARE
  v_uid UUID := '00000000-0000-0000-0000-000000000004';
  v_member UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anika@replymommy.com') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_sent_at, confirmation_token,
      recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'anika@replymommy.com',
      crypt('test1234', gen_salt('bf')),
      NOW(), NOW(), '', '', '', '',
      '{"provider": "email", "providers": ["email"]}',
      '{}', false, NOW(), NOW()
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_uid, v_uid, 'anika@replymommy.com',
      jsonb_build_object('sub', v_uid::text, 'email', 'anika@replymommy.com', 'email_verified', true, 'phone_verified', false),
      'email', NOW(), NOW(), NOW());
  ELSE
    SELECT id INTO v_uid FROM auth.users WHERE email = 'anika@replymommy.com';
  END IF;

  UPDATE public.users SET
    status = 'active', role = 'mommy', mommy_tier = 'icon',
    mommy_badge = 'icon', is_spotlight = false,
    verification_status = 'approved', last_active_at = NOW(), updated_at = NOW()
  WHERE id = v_uid;

  INSERT INTO public.profiles (
    user_id, display_name, bio, date_of_birth,
    location_city, location_country, photo_urls,
    headline, desires,
    preferred_age_min, preferred_age_max,
    preferred_locations,
    max_active_matches, response_commitment
  ) VALUES (
    v_uid,
    'Anika',
    'Former investment banker turned fashion entrepreneur. Delhi born, globally minded. I value directness, ambition, and the kind of dinner conversation that makes you forget to check your phone. Not here for anything casual.',
    '1989-11-02',
    'Delhi', 'IN',
    ARRAY[
      'https://randomuser.me/api/portraits/women/33.jpg',
      'https://randomuser.me/api/portraits/women/34.jpg',
      'https://randomuser.me/api/portraits/women/35.jpg'
    ],
    'Entrepreneur. Obsessed with good fabric and bad puns.',
    ARRAY['Fashion', 'Business', 'Fine Dining'],
    30, 55,
    ARRAY['Delhi', 'Dubai', 'Singapore', 'London', 'New York'],
    1, 'Same Day'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name, bio = EXCLUDED.bio,
    photo_urls = EXCLUDED.photo_urls, headline = EXCLUDED.headline,
    desires = EXCLUDED.desires,
    preferred_locations = EXCLUDED.preferred_locations;

  -- Gallery items
  INSERT INTO public.gallery_items (owner_id, type, cloudinary_public_id, url, thumbnail_url, is_premium, token_cost, sort_order)
  VALUES
    (v_uid, 'photo', 'seed/anika/g1', 'https://randomuser.me/api/portraits/women/38.jpg', 'https://randomuser.me/api/portraits/women/38.jpg', false, 0,  0),
    (v_uid, 'photo', 'seed/anika/g2', 'https://randomuser.me/api/portraits/women/39.jpg', 'https://randomuser.me/api/portraits/women/39.jpg', false, 0,  1),
    (v_uid, 'photo', 'seed/anika/g3', 'https://randomuser.me/api/portraits/women/40.jpg', 'https://randomuser.me/api/portraits/women/40.jpg', true,  10, 2),
    (v_uid, 'photo', 'seed/anika/g4', 'https://randomuser.me/api/portraits/women/41.jpg', 'https://randomuser.me/api/portraits/women/41.jpg', true,  10, 3),
    (v_uid, 'photo', 'seed/anika/g5', 'https://randomuser.me/api/portraits/women/42.jpg', 'https://randomuser.me/api/portraits/women/42.jpg', true,  20, 4)
  ON CONFLICT DO NOTHING;

  -- Match with test member (accepted — so it shows in match history)
  INSERT INTO public.matches (member_id, mommy_id, status, member_responded, mommy_responded, member_response, mommy_response, match_score, match_date, expires_at)
  VALUES (v_member, v_uid, 'mutual', true, true, 'accepted', 'accepted', 88.0, CURRENT_DATE - 1, NOW() + INTERVAL '30 days')
  ON CONFLICT (member_id, mommy_id, match_date) DO NOTHING;

END $$;

-- ============================================================
-- Mommy 3 — Sarah Mitchell (US, Los Angeles) — Standard tier
-- ============================================================
DO $$
DECLARE
  v_uid UUID := '00000000-0000-0000-0000-000000000005';
  v_member UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah@replymommy.com') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_sent_at, confirmation_token,
      recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'sarah@replymommy.com',
      crypt('test1234', gen_salt('bf')),
      NOW(), NOW(), '', '', '', '',
      '{"provider": "email", "providers": ["email"]}',
      '{}', false, NOW(), NOW()
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_uid, v_uid, 'sarah@replymommy.com',
      jsonb_build_object('sub', v_uid::text, 'email', 'sarah@replymommy.com', 'email_verified', true, 'phone_verified', false),
      'email', NOW(), NOW(), NOW());
  ELSE
    SELECT id INTO v_uid FROM auth.users WHERE email = 'sarah@replymommy.com';
  END IF;

  UPDATE public.users SET
    status = 'active', role = 'mommy', mommy_tier = 'standard',
    mommy_badge = 'rising',
    verification_status = 'approved', last_active_at = NOW(), updated_at = NOW()
  WHERE id = v_uid;

  INSERT INTO public.profiles (
    user_id, display_name, bio, date_of_birth,
    location_city, location_country, photo_urls,
    headline, desires,
    preferred_age_min, preferred_age_max,
    preferred_locations,
    max_active_matches, response_commitment
  ) VALUES (
    v_uid,
    'Sarah',
    'Wellness coach and ocean person based in Los Angeles. I spend my mornings in the water and my evenings at the kind of dinners that turn into late-night philosophy debates. Equal parts adventurous and grounded — I know exactly what I want.',
    '1993-07-22',
    'Los Angeles', 'US',
    ARRAY[
      'https://randomuser.me/api/portraits/women/21.jpg',
      'https://randomuser.me/api/portraits/women/22.jpg',
      'https://randomuser.me/api/portraits/women/23.jpg'
    ],
    'Wellness coach. Sun-chaser. Unapologetically selective.',
    ARRAY['Wellness', 'Adventure', 'Arts & Culture'],
    27, 48,
    ARRAY['Los Angeles', 'New York', 'Miami', 'London'],
    5, '48h'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name, bio = EXCLUDED.bio,
    photo_urls = EXCLUDED.photo_urls, headline = EXCLUDED.headline,
    desires = EXCLUDED.desires,
    preferred_locations = EXCLUDED.preferred_locations;

  -- Gallery items
  INSERT INTO public.gallery_items (owner_id, type, cloudinary_public_id, url, thumbnail_url, is_premium, token_cost, sort_order)
  VALUES
    (v_uid, 'photo', 'seed/sarah/g1', 'https://randomuser.me/api/portraits/women/26.jpg', 'https://randomuser.me/api/portraits/women/26.jpg', false, 0,  0),
    (v_uid, 'photo', 'seed/sarah/g2', 'https://randomuser.me/api/portraits/women/27.jpg', 'https://randomuser.me/api/portraits/women/27.jpg', false, 0,  1),
    (v_uid, 'photo', 'seed/sarah/g3', 'https://randomuser.me/api/portraits/women/28.jpg', 'https://randomuser.me/api/portraits/women/28.jpg', true,  10, 2),
    (v_uid, 'photo', 'seed/sarah/g4', 'https://randomuser.me/api/portraits/women/29.jpg', 'https://randomuser.me/api/portraits/women/29.jpg', true,  10, 3),
    (v_uid, 'photo', 'seed/sarah/g5', 'https://randomuser.me/api/portraits/women/30.jpg', 'https://randomuser.me/api/portraits/women/30.jpg', true,  15, 4)
  ON CONFLICT DO NOTHING;

  -- Match with test member (pending)
  INSERT INTO public.matches (member_id, mommy_id, status, match_score, match_date, expires_at)
  VALUES (v_member, v_uid, 'pending', 79.0, CURRENT_DATE, NOW() + INTERVAL '7 days')
  ON CONFLICT (member_id, mommy_id, match_date) DO NOTHING;

END $$;
