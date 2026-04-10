import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  selectDailyMatches,
  matchesPerDayForTier,
} from "@/lib/matching/algorithm";
import type { User, Profile } from "@/types/database";

type UserWithProfile = User & { profiles: Profile };

// POST /api/cron/daily-matches — generates daily curated matches for all active members.
// Protected by CRON_SECRET. Triggered by Vercel Cron at midnight UTC.
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Query all active members with profiles
  const { data: membersRaw, error: membersError } = await admin
    .from("users")
    .select("*, profiles(*)")
    .eq("status", "active")
    .eq("role", "member")
    .not("member_tier", "is", null);

  if (membersError) {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }

  // Query all active mommies with profiles
  const { data: mommiesRaw, error: mommiesError } = await admin
    .from("users")
    .select("*, profiles(*)")
    .eq("status", "active")
    .eq("role", "mommy");

  if (mommiesError) {
    return NextResponse.json({ error: "Failed to fetch mommies" }, { status: 500 });
  }

  const members = (membersRaw ?? []) as UserWithProfile[];
  const mommiesAll = (mommiesRaw ?? []) as UserWithProfile[];

  // Flatten profiles (Supabase returns as array due to one-to-many join)
  const normalizeUser = (u: UserWithProfile) => ({
    ...u,
    profile: Array.isArray(u.profiles) ? u.profiles[0] : u.profiles,
  });

  const normalizedMembers = members.map(normalizeUser).filter((m) => m.profile);
  const normalizedMommies = mommiesAll.map(normalizeUser).filter((m) => m.profile);

  let totalMatchesCreated = 0;
  const matchRows: {
    member_id: string;
    mommy_id: string;
    match_score: number;
    match_date: string;
    expires_at: string;
    status: string;
  }[] = [];

  for (const member of normalizedMembers) {
    const maxMatches = matchesPerDayForTier(member.member_tier);
    if (maxMatches === 0) continue;

    // Fetch existing match mommy IDs for today to avoid duplicates
    const { data: existing } = await admin
      .from("matches")
      .select("mommy_id")
      .eq("member_id", member.id)
      .eq("match_date", today);

    const excludeIds = new Set((existing ?? []).map((m) => m.mommy_id));

    // Run matching algorithm
    const scored = selectDailyMatches(
      member as Parameters<typeof selectDailyMatches>[0],
      normalizedMommies as Parameters<typeof selectDailyMatches>[1],
      maxMatches,
      excludeIds
    );

    for (const s of scored) {
      matchRows.push({
        member_id: member.id,
        mommy_id: s.candidateId,
        match_score: s.score,
        match_date: today,
        expires_at: expiresAt,
        status: "pending",
      });
    }
    totalMatchesCreated += scored.length;
  }

  if (matchRows.length > 0) {
    await admin.from("matches").insert(matchRows);
  }

  // Send match notification emails (non-blocking)
  if (
    matchRows.length > 0 &&
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_placeholder"
  ) {
    try {
      const { resend } = await import("@/lib/resend/client");
      const { matchNotificationHtml } = await import(
        "@/lib/resend/match-notification-email"
      );

      // Batch into chunks of 50
      const memberIds = [...new Set(matchRows.map((m) => m.member_id))];
      const { data: memberEmails } = await admin
        .from("users")
        .select("id, email")
        .in("id", memberIds);

      const emailMap = new Map(
        (memberEmails ?? []).map((u) => [u.id, u.email])
      );

      const chunks: typeof matchRows[] = [];
      for (let i = 0; i < memberIds.length; i += 50) {
        chunks.push(matchRows.slice(i, i + 50));
      }

      for (const chunk of chunks) {
        const uniqueIds = [...new Set(chunk.map((m) => m.member_id))];
        await Promise.all(
          uniqueIds.map(async (memberId) => {
            const email = emailMap.get(memberId);
            if (!email) return;
            await resend.emails.send({
              from: "ReplyMommy <hello@replymommy.com>",
              to: email,
              subject: "Your match is ready.",
              html: matchNotificationHtml(),
            });
          })
        );
      }
    } catch {
      // Email failure is non-blocking
    }
  }

  return NextResponse.json({
    success: true,
    matchesCreated: totalMatchesCreated,
    timestamp: new Date().toISOString(),
  });
}
