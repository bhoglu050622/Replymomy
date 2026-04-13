-- Deprecate preferred_member_tiers from profiles.
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS preferred_member_tiers;
