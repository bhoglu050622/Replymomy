-- Add 'unlimited' tier to member_tier enum (before legacy tiers)
ALTER TYPE public.member_tier ADD VALUE IF NOT EXISTS 'unlimited' BEFORE 'pro';
