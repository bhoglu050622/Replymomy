-- Drop overly restrictive CHECK constraints on profiles
-- desires was limited to 3 but mommy specialties UI allows up to 4+
-- photo_urls was limited to 3 but profile edit allows up to 3 (keep consistent)

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_desires_check;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_photo_urls_check;

-- Re-add with generous limits
ALTER TABLE profiles
  ADD CONSTRAINT profiles_desires_check CHECK (array_length(desires, 1) IS NULL OR array_length(desires, 1) <= 12);

ALTER TABLE profiles
  ADD CONSTRAINT profiles_photo_urls_check CHECK (array_length(photo_urls, 1) IS NULL OR array_length(photo_urls, 1) <= 8);
