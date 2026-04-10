-- ReplyMommy enums
CREATE TYPE user_role AS ENUM ('member', 'mommy', 'admin');
CREATE TYPE user_status AS ENUM (
  'pending_invite',
  'pending_verification',
  'pending_profile',
  'pending_preferences',
  'active',
  'suspended',
  'banned'
);
CREATE TYPE verification_status AS ENUM (
  'not_started',
  'pending',
  'approved',
  'declined',
  'needs_review'
);
CREATE TYPE member_tier AS ENUM ('gold', 'platinum', 'black_card');
CREATE TYPE mommy_tier AS ENUM ('standard', 'elite', 'icon');
CREATE TYPE mommy_badge AS ENUM ('rising', 'elite', 'icon');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'mutual');
CREATE TYPE gift_type AS ENUM ('virtual', 'irl');
CREATE TYPE transaction_type AS ENUM (
  'subscription',
  'token_purchase',
  'gift_purchase',
  'spotlight_boost',
  'profile_unlock',
  'priority_reply',
  'payout',
  'platform_fee'
);
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE gallery_item_type AS ENUM ('photo', 'video');
CREATE TYPE invitation_status AS ENUM ('active', 'used', 'expired', 'revoked');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
