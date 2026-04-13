import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// GET /api/matches/incoming
// Returns pending match requests where the current user (mommy) hasn't responded yet.
export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  // Verify user is a mommy
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (currentUser?.role !== "mommy") {
    return NextResponse.json({ requests: [] });
  }

  // Fetch pending requests with member profile info
  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      id,
      member_id,
      created_at,
      member:users!matches_member_id_fkey(
        id,
        profiles!profiles_user_id_fkey(
          display_name,
          location_city,
          date_of_birth,
          desires,
          photo_urls,
          headline
        )
      )
    `)
    .eq("mommy_id", user!.id)
    .eq("mommy_responded", false)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check for gifts sent by each member to this mommy near the request time
  const requests = await Promise.all(
    (matches ?? []).map(async (m) => {
      const requestedAt = new Date(m.created_at);
      const windowStart = new Date(requestedAt.getTime() - 2 * 60 * 1000).toISOString();
      const windowEnd = new Date(requestedAt.getTime() + 5 * 60 * 1000).toISOString();

      const { data: gift } = await supabase
        .from("gifts_sent")
        .select("gift_catalog_id, gift_catalog:gift_catalog(name)")
        .eq("sender_id", m.member_id)
        .eq("recipient_id", user!.id)
        .gte("created_at", windowStart)
        .lte("created_at", windowEnd)
        .limit(1)
        .maybeSingle();

      const member = m.member as unknown as {
        id: string;
        profiles: {
          display_name: string;
          location_city: string | null;
          date_of_birth: string | null;
          desires: string[] | null;
          photo_urls: string[] | null;
          headline: string | null;
        } | null;
      } | null;

      const profile = member?.profiles;

      return {
        matchId: m.id,
        requestedAt: m.created_at,
        member: {
          userId: m.member_id,
          displayName: profile?.display_name ?? "Member",
          city: profile?.location_city ?? null,
          dateOfBirth: profile?.date_of_birth ?? null,
          desires: profile?.desires ?? [],
          photoUrls: profile?.photo_urls ?? [],
          headline: profile?.headline ?? null,
        },
        giftName: (gift?.gift_catalog as { name?: string } | null)?.name ?? null,
      };
    })
  );

  return NextResponse.json({ requests });
}
