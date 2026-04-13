CREATE TABLE IF NOT EXISTS public.media_assets (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id             UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chat_id              TEXT,                          -- Stream channel ID
  stream_message_id    TEXT,                          -- NULL = orphan; set after message confirmed sent
  cloudinary_public_id TEXT        NOT NULL,
  url                  TEXT        NOT NULL,          -- main image (≤1920px) Cloudinary URL
  thumb_url            TEXT,                          -- 320px thumb URL
  mime_type            TEXT        NOT NULL,
  size_bytes           INTEGER     NOT NULL,          -- processed output size in bytes
  width                INTEGER,
  height               INTEGER,
  sha256               TEXT,                          -- hex digest for deduplication
  deleted_at           TIMESTAMPTZ,                   -- soft-delete; hard-purged by cron after 30d
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orphan detection index: assets uploaded but never attached to a message
CREATE INDEX IF NOT EXISTS idx_media_assets_orphan
  ON public.media_assets(owner_id, created_at)
  WHERE stream_message_id IS NULL AND deleted_at IS NULL;

-- Per-user daily quota queries
CREATE INDEX IF NOT EXISTS idx_media_assets_owner_created
  ON public.media_assets(owner_id, created_at)
  WHERE deleted_at IS NULL;

-- Admin storage health: sum bytes across all live assets
CREATE INDEX IF NOT EXISTS idx_media_assets_live
  ON public.media_assets(created_at)
  WHERE deleted_at IS NULL;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_media"
  ON public.media_assets FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "users_insert_own_media"
  ON public.media_assets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "users_update_own_media"
  ON public.media_assets FOR UPDATE
  USING (auth.uid() = owner_id);
