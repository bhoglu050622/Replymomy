-- Add gender identity, pronouns, and multi-photo support to both application tables

ALTER TABLE public.member_applications
  ADD COLUMN IF NOT EXISTS gender      TEXT,
  ADD COLUMN IF NOT EXISTS pronouns    TEXT,
  ADD COLUMN IF NOT EXISTS photo_urls  TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.mommy_applications
  ADD COLUMN IF NOT EXISTS gender      TEXT,
  ADD COLUMN IF NOT EXISTS pronouns    TEXT;
