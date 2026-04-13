import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  targetUserId: z.string().uuid(),
});

// POST /api/matches/request
// Allows any authenticated member to initiate a connect request to a mommy.
// Free users: max 5 requests per day. Paid users: unlimited.
export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const body = schema.parse(await req.json());

  // Verify requester is an active member
  const { data: requester } = await supabase
    .from("users")
    .select("role, status, member_tier")
    .eq("id", user!.id)
    .single();

  if (!requester || requester.role !== "member" || requester.status !== "active") {
    return NextResponse.json({ error: "Only active members can send connect requests" }, { status: 403 });
  }

  // Verify target is an active mommy
  const { data: target } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", body.targetUserId)
    .single();

  if (!target || target.role !== "mommy" || target.status !== "active") {
    return NextResponse.json({ error: "Target profile not found" }, { status: 404 });
  }

  // Check for duplicate — any non-expired match between these two
  const { data: existing } = await supabase
    .from("matches")
    .select("id, status")
    .eq("member_id", user!.id)
    .eq("mommy_id", body.targetUserId)
    .not("status", "eq", "expired")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already connected", matchId: existing.id }, { status: 409 });
  }

  // Rate limit for free users: max 5 requests per day
  if (!requester.member_tier) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("member_id", user!.id)
      .gte("created_at", oneDayAgo);

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to send unlimited requests." },
        { status: 429 }
      );
    }
  }

  // Create the pending match
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: match, error } = await supabase
    .from("matches")
    .insert({
      member_id: user!.id,
      mommy_id: body.targetUserId,
      status: "pending",
      member_responded: true,
      member_response: "accepted",
      mommy_responded: false,
      mommy_response: null,
      match_score: null,
      match_date: today,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ matchId: match.id });
}
