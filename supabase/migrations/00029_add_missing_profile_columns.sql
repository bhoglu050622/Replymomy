-- Add columns that are referenced in the API but missing from the profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS headline TEXT CHECK (LENGTH(headline) <= 80),
  ADD COLUMN IF NOT EXISTS preferred_member_tiers TEXT[],
  ADD COLUMN IF NOT EXISTS max_active_matches INTEGER,
  ADD COLUMN IF NOT EXISTS response_commitment TEXT;
