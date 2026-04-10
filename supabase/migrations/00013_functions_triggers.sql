-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Atomic token deduction with row lock
CREATE OR REPLACE FUNCTION public.deduct_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT token_balance INTO v_balance FROM public.users
    WHERE id = p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  UPDATE public.users SET token_balance = token_balance - p_amount
    WHERE id = p_user_id;
  INSERT INTO public.token_ledger
    (user_id, amount, balance_after, reason, reference_id)
    VALUES (p_user_id, -p_amount, v_balance - p_amount, p_reason, p_reference_id);
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic token credit
CREATE OR REPLACE FUNCTION public.credit_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  UPDATE public.users SET token_balance = token_balance + p_amount
    WHERE id = p_user_id
    RETURNING token_balance INTO v_balance;
  INSERT INTO public.token_ledger
    (user_id, amount, balance_after, reason, reference_id)
    VALUES (p_user_id, p_amount, v_balance, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Detect mutual match
CREATE OR REPLACE FUNCTION public.check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_responded AND NEW.mommy_responded
     AND NEW.member_response = 'accepted'
     AND NEW.mommy_response = 'accepted' THEN
    NEW.status = 'mutual';
  ELSIF NEW.member_response = 'declined' OR NEW.mommy_response = 'declined' THEN
    NEW.status = 'declined';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_check_mutual_match BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.check_mutual_match();

-- Validate invitation code
CREATE OR REPLACE FUNCTION public.validate_invitation_code(p_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, code_id UUID, target_role user_role) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE,
    ic.id,
    ic.target_role
  FROM public.invitation_codes ic
  WHERE ic.code = p_code
    AND ic.status = 'active'
    AND ic.current_uses < ic.max_uses
    AND (ic.expires_at IS NULL OR ic.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use invitation code (increment + maybe mark used)
CREATE OR REPLACE FUNCTION public.use_invitation_code(p_code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.invitation_codes
  SET current_uses = current_uses + 1,
      status = CASE
        WHEN current_uses + 1 >= max_uses THEN 'used'::invitation_status
        ELSE status
      END
  WHERE id = p_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: when auth.users row is created, create matching public.users row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, status)
  VALUES (NEW.id, NEW.email, 'pending_invite');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
