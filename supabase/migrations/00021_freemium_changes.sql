-- Add 'pro' tier to member_tier enum (before 'gold' — cheapest paid tier)
-- ALTER TYPE ADD VALUE cannot run inside a transaction, so this is safe as a standalone statement.
ALTER TYPE public.member_tier ADD VALUE IF NOT EXISTS 'pro' BEFORE 'gold';

-- Track how many mommy profiles a member has browsed (for freemium limit enforcement)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profiles_browsed_count INTEGER NOT NULL DEFAULT 0;
