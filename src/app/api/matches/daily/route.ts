import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// GET /api/matches/daily — returns today's curated matches for the current user.
export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("match_date", today)
    .or(`member_id.eq.${user!.id},mommy_id.eq.${user!.id}`)
    .neq("status", "expired")
    .order("match_score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }

  return NextResponse.json({ matches: data ?? [] });
}
