-- Enable RLS on all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mommy_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotlight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_read_matched" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT mommy_id FROM public.matches
      WHERE member_id = auth.uid() AND status = 'mutual'
      UNION
      SELECT member_id FROM public.matches
      WHERE mommy_id = auth.uid() AND status = 'mutual'
    )
  );

-- PROFILES
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_read_active" ON public.profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE status = 'active')
  );

-- MATCHES
CREATE POLICY "matches_read_own" ON public.matches
  FOR SELECT USING (member_id = auth.uid() OR mommy_id = auth.uid());
CREATE POLICY "matches_update_own" ON public.matches
  FOR UPDATE USING (member_id = auth.uid() OR mommy_id = auth.uid());

-- MESSAGE METADATA
CREATE POLICY "messages_read_own" ON public.message_metadata
  FOR SELECT USING (
    sender_id = auth.uid() OR
    match_id IN (
      SELECT id FROM public.matches
      WHERE member_id = auth.uid() OR mommy_id = auth.uid()
    )
  );

-- SUBSCRIPTIONS
CREATE POLICY "subscriptions_read_own" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- TRANSACTIONS
CREATE POLICY "transactions_read_own" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

-- TOKEN LEDGER
CREATE POLICY "token_ledger_read_own" ON public.token_ledger
  FOR SELECT USING (user_id = auth.uid());

-- GIFT CATALOG (public)
CREATE POLICY "gift_catalog_read_all" ON public.gift_catalog
  FOR SELECT USING (is_active = TRUE);

-- GIFTS SENT
CREATE POLICY "gifts_sent_read" ON public.gifts_sent
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- GALLERY ITEMS
CREATE POLICY "gallery_items_owner_all" ON public.gallery_items
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "gallery_items_read_public" ON public.gallery_items
  FOR SELECT USING (is_premium = FALSE);
CREATE POLICY "gallery_items_read_unlocked" ON public.gallery_items
  FOR SELECT USING (
    id IN (SELECT gallery_item_id FROM public.gallery_unlocks WHERE user_id = auth.uid())
  );

-- GALLERY UNLOCKS
CREATE POLICY "gallery_unlocks_read_own" ON public.gallery_unlocks
  FOR SELECT USING (user_id = auth.uid());

-- AVAILABILITY
CREATE POLICY "availability_owner_all" ON public.availability_slots
  FOR ALL USING (mommy_id = auth.uid());
CREATE POLICY "availability_read_all" ON public.availability_slots
  FOR SELECT USING (TRUE);

-- MOMMY EARNINGS
CREATE POLICY "earnings_read_own" ON public.mommy_earnings
  FOR SELECT USING (mommy_id = auth.uid());

-- SPOTLIGHT
CREATE POLICY "spotlight_read_all" ON public.spotlight_history
  FOR SELECT USING (TRUE);

-- EVENTS
CREATE POLICY "events_read_all" ON public.events FOR SELECT USING (TRUE);
CREATE POLICY "event_invitations_read_own" ON public.event_invitations
  FOR SELECT USING (user_id = auth.uid());

-- WAITLIST: insert only (anyone can join, no one reads via client)
CREATE POLICY "waitlist_insert" ON public.waitlist
  FOR INSERT WITH CHECK (TRUE);
