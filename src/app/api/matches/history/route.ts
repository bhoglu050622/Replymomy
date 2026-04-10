import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// GET /api/matches/history — past matches for the current user.
export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`member_id.eq.${user!.id},mommy_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }

  return NextResponse.json({ matches: data ?? [] });
}
