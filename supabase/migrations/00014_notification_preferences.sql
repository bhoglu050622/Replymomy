-- Add notification_preferences column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}';

-- Add index for gallery_items lookups
CREATE INDEX IF NOT EXISTS gallery_items_owner_id_idx ON gallery_items(owner_id);
CREATE INDEX IF NOT EXISTS gallery_unlocks_user_owner_idx ON gallery_unlocks(user_id, owner_id);

-- Add mommy_earnings table if it doesn't exist (may have been created in 00011)
CREATE TABLE IF NOT EXISTS mommy_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mommy_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type text NOT NULL DEFAULT 'gift',
  gross_amount_cents integer NOT NULL DEFAULT 0,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  net_amount_cents integer NOT NULL DEFAULT 0,
  gift_id uuid REFERENCES gift_catalog(id),
  payout_status text NOT NULL DEFAULT 'pending',
  stripe_transfer_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for mommy_earnings
ALTER TABLE mommy_earnings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mommy_earnings' AND policyname = 'mommy_earnings_self'
  ) THEN
    CREATE POLICY mommy_earnings_self ON mommy_earnings
      FOR ALL USING (mommy_id = auth.uid());
  END IF;
END $$;
