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
