// Manual database types for ReplyMommy.
// In production: generate via `npx supabase gen types typescript --project-id <id>`

export type UserRole = "member" | "mommy" | "admin";
export type UserStatus =
  | "pending_invite"
  | "pending_verification"
  | "pending_profile"
  | "pending_preferences"
  | "active"
  | "suspended"
  | "banned";
export type VerificationStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "declined"
  | "needs_review";
export type MemberTier = "gold" | "platinum" | "black_card";
export type MommyTier = "standard" | "elite" | "icon";
export type MommyBadge = "rising" | "elite" | "icon";
export type MatchStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "mutual";
export type GiftType = "virtual" | "irl";
export type GalleryItemType = "photo" | "video";

export interface User {
  id: string;
  role: UserRole;
  status: UserStatus;
  email: string;
  phone: string | null;
  invitation_code_id: string | null;
  verification_status: VerificationStatus;
  persona_inquiry_id: string | null;
  stripe_customer_id: string | null;
  stripe_connect_account_id: string | null;
  member_tier: MemberTier | null;
  mommy_tier: MommyTier | null;
  mommy_badge: MommyBadge | null;
  token_balance: number;
  is_spotlight: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  date_of_birth: string | null;
  location_city: string | null;
  location_country: string | null;
  photo_urls: string[] | null;
  voice_note_url: string | null;
  desires: string[] | null;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  preferred_locations: string[] | null;
  preferred_interests: string[] | null;
  show_online_status: boolean;
  show_last_active: boolean;
  allow_direct_messages: boolean;
  blur_photos_for_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  member_id: string;
  mommy_id: string;
  status: MatchStatus;
  member_responded: boolean;
  mommy_responded: boolean;
  member_response: MatchStatus | null;
  mommy_response: MatchStatus | null;
  match_score: number | null;
  match_date: string;
  stream_channel_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  status: "active" | "used" | "expired" | "revoked";
  target_role: UserRole;
  expires_at: string | null;
  created_at: string;
}

export interface GiftCatalogItem {
  id: string;
  name: string;
  description: string | null;
  type: GiftType;
  price_cents: number;
  token_cost: number | null;
  image_url: string | null;
  animation_key: string | null;
  is_active: boolean;
  sort_order: number;
}
