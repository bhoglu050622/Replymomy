-- Function to expire stale matches (called by cron or on-demand)
CREATE OR REPLACE FUNCTION public.expire_stale_matches()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.matches
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: pg_cron job (uncomment if pg_cron extension is enabled on your Supabase project)
-- SELECT cron.schedule('expire-stale-matches', '0 * * * *', 'SELECT public.expire_stale_matches()');
