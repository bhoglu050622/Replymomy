import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateIcebreakers, type ProfileSnippet } from "@/lib/ai/gemini";

export async function GET(req: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("match_id");
  if (!matchId) {
    return NextResponse.json({ error: "match_id required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch match — verify caller is the member party
  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("id, member_id, mommy_id, status")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.member_id !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (match.status !== "mutual") {
    return NextResponse.json({ error: "Match is not mutual yet" }, { status: 400 });
  }

  // Fetch both profiles
  const [{ data: memberProfile }, { data: mommyProfile }] = await Promise.all([
    admin
      .from("profiles")
      .select("display_name, bio, desires, location_city")
      .eq("user_id", match.member_id)
      .single(),
    admin
      .from("profiles")
      .select("display_name, bio, desires, location_city")
      .eq("user_id", match.mommy_id)
      .single(),
  ]);

  const memberSnippet: ProfileSnippet = {
    displayName: memberProfile?.display_name ?? "Member",
    bio: memberProfile?.bio ?? null,
    desires: memberProfile?.desires ?? null,
    locationCity: memberProfile?.location_city ?? null,
  };

  const mommySnippet: ProfileSnippet = {
    displayName: mommyProfile?.display_name ?? "Your match",
    bio: mommyProfile?.bio ?? null,
    desires: mommyProfile?.desires ?? null,
    locationCity: mommyProfile?.location_city ?? null,
  };

  try {
    const starters = await generateIcebreakers(memberSnippet, mommySnippet);
    return NextResponse.json({ starters });
  } catch (err) {
    console.error("[icebreakers]", err);
    return NextResponse.json({ error: "Could not generate suggestions" }, { status: 500 });
  }
}
