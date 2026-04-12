-- Atomic gallery unlock: deducts tokens and records the unlock in a single transaction.
-- Replaces the two-step approach in the API route that could lose tokens on INSERT failure.
CREATE OR REPLACE FUNCTION public.unlock_gallery(
  p_user_id     UUID,
  p_owner_id    UUID,
  p_unlock_type TEXT,
  p_token_cost  INTEGER,
  p_item_id     UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_balance     INTEGER;
  v_unlock_id   UUID;
BEGIN
  -- Lock the user row and check balance
  SELECT token_balance INTO v_balance
    FROM public.users
    WHERE id = p_user_id
    FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_token_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance');
  END IF;

  -- Check if already unlocked (full_gallery or matching single item)
  IF p_unlock_type = 'full_gallery' THEN
    IF EXISTS (
      SELECT 1 FROM public.gallery_unlocks
        WHERE user_id = p_user_id
          AND owner_id = p_owner_id
          AND unlock_type = 'full_gallery'
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'already_unlocked');
    END IF;
  ELSIF p_item_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.gallery_unlocks
        WHERE user_id = p_user_id
          AND gallery_item_id = p_item_id
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'already_unlocked');
    END IF;
  END IF;

  -- Deduct tokens
  UPDATE public.users
    SET token_balance = token_balance - p_token_cost
    WHERE id = p_user_id;

  INSERT INTO public.token_ledger
    (user_id, amount, balance_after, reason)
    VALUES (p_user_id, -p_token_cost, v_balance - p_token_cost, 'gallery_' || p_unlock_type);

  -- Record the unlock
  INSERT INTO public.gallery_unlocks
    (user_id, owner_id, gallery_item_id, unlock_type, token_cost)
    VALUES (p_user_id, p_owner_id, p_item_id, p_unlock_type, p_token_cost)
    RETURNING id INTO v_unlock_id;

  RETURN jsonb_build_object('success', true, 'unlock_id', v_unlock_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
