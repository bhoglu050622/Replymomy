-- Note: actual messages live in Stream.io. This table is for metadata only,
-- e.g., to track priority replies and message-related billing.

CREATE TABLE public.message_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stream_message_id TEXT,
  is_priority_reply BOOLEAN NOT NULL DEFAULT FALSE,
  priority_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_metadata_match ON public.message_metadata(match_id);
CREATE INDEX idx_message_metadata_sender ON public.message_metadata(sender_id);
