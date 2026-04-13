import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/managed-profiles
// Returns all "__managed__" profiles with their active mutual matches + last message
export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  const admin = createAdminClient();

  // Verify admin role
  const { data: userRecord } = await admin
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (userRecord?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all managed profiles
  const { data: profiles, error } = await admin
    .from("profiles")
    .select(`
      user_id,
      display_name,
      headline,
      location_city,
      desires,
      photo_urls,
      users!profiles_user_id_fkey(role, member_tier, mommy_tier, status)
    `)
    .eq("response_commitment", "__managed__");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!profiles?.length) return NextResponse.json({ profiles: [] });

  const userIds = profiles.map((p) => p.user_id);

  // Fetch mutual matches for these profiles (as either member or mommy)
  const { data: matches } = await admin
    .from("matches")
    .select(`
      id, member_id, mommy_id, status, created_at,
      member:users!matches_member_id_fkey(id, profiles!profiles_user_id_fkey(display_name)),
      mommy:users!matches_mommy_id_fkey(id, profiles!profiles_user_id_fkey(display_name))
    `)
    .eq("status", "mutual")
    .or(`member_id.in.(${userIds.join(",")}),mommy_id.in.(${userIds.join(",")})`)
    .order("created_at", { ascending: false });

  // Fetch last message for each match
  const matchIds = (matches ?? []).map((m) => m.id);
  let lastMessages: Record<string, { content: string | null; sender_id: string; created_at: string }> = {};

  if (matchIds.length > 0) {
    for (const matchId of matchIds) {
      const { data: msgs } = await admin
        .from("messages")
        .select("content, sender_id, created_at")
        .eq("chat_id", `match-${matchId}`)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(1);
      if (msgs?.[0]) lastMessages[matchId] = msgs[0];
    }
  }

  // Group matches by managed profile
  const matchesByProfile: Record<string, typeof matches> = {};
  for (const m of matches ?? []) {
    const key = userIds.includes(m.member_id) ? m.member_id : m.mommy_id;
    if (!matchesByProfile[key]) matchesByProfile[key] = [];
    matchesByProfile[key]!.push(m);
  }

  const result = profiles.map((p) => ({
    userId: p.user_id,
    displayName: p.display_name,
    headline: p.headline,
    city: p.location_city,
    desires: p.desires,
    photoUrls: p.photo_urls,
    role: (p.users as { role: string } | null)?.role,
    tier: (p.users as { member_tier?: string; mommy_tier?: string } | null)?.member_tier
      ?? (p.users as { member_tier?: string; mommy_tier?: string } | null)?.mommy_tier,
    conversations: (matchesByProfile[p.user_id] ?? []).map((m) => {
      const isAsMember = m.member_id === p.user_id;
      const otherParty = isAsMember
        ? (m.mommy as { id: string; profiles: { display_name: string } | null } | null)
        : (m.member as { id: string; profiles: { display_name: string } | null } | null);
      const lastMsg = lastMessages[m.id];
      return {
        matchId: m.id,
        otherUserId: otherParty?.id,
        otherName: (otherParty?.profiles as { display_name?: string } | null)?.display_name ?? "User",
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.created_at ?? null,
        lastSenderId: lastMsg?.sender_id ?? null,
      };
    }),
  }));

  return NextResponse.json({ profiles: result });
}
