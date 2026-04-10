import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  matchId: z.string(),
  response: z.enum(["accepted", "declined"]),
});

// POST /api/matches/respond — accept or decline a match.
// On mutual accept, updates status to 'mutual' and sets the stream channel ID.
export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const { matchId, response: userResponse } = schema.parse(await req.json());

    const { data: match, error: fetchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (fetchError || !match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const isMember = match.member_id === user!.id;
    const isMommy = match.mommy_id === user!.id;

    if (!isMember && !isMommy) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData = isMember
      ? { member_responded: true, member_response: userResponse }
      : { mommy_responded: true, mommy_response: userResponse };

    const { data: updated, error: updateError } = await supabase
      .from("matches")
      .update(updateData)
      .eq("id", matchId)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
    }

    const isMutual =
      updated.member_responded &&
      updated.mommy_responded &&
      updated.member_response === "accepted" &&
      updated.mommy_response === "accepted";

    const isDeclined = userResponse === "declined";

    if (isMutual) {
      const streamChannelId = `match-${matchId}`;
      await supabase
        .from("matches")
        .update({ status: "mutual", stream_channel_id: streamChannelId })
        .eq("id", matchId);

      // Send mutual match emails (non-blocking)
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder") {
        try {
          const { resend } = await import("@/lib/resend/client");
          const { mutualMatchHtml } = await import("@/lib/resend/mutual-match-email");
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const admin = createAdminClient();

          const { data: users } = await admin
            .from("users")
            .select("id, email")
            .in("id", [match.member_id, match.mommy_id]);

          const { data: profiles } = await admin
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", [match.member_id, match.mommy_id]);

          if (users && profiles) {
            const memberUser = users.find((u) => u.id === match.member_id);
            const mommyUser = users.find((u) => u.id === match.mommy_id);
            const memberProfile = profiles.find((p) => p.user_id === match.member_id);
            const mommyProfile = profiles.find((p) => p.user_id === match.mommy_id);

            await Promise.all([
              memberUser && mommyProfile && resend.emails.send({
                from: "ReplyMommy <hello@replymommy.com>",
                to: memberUser.email,
                subject: "It's mutual.",
                html: mutualMatchHtml(memberProfile?.display_name ?? "You", mommyProfile.display_name),
              }),
              mommyUser && memberProfile && resend.emails.send({
                from: "ReplyMommy <hello@replymommy.com>",
                to: mommyUser.email,
                subject: "It's mutual.",
                html: mutualMatchHtml(mommyProfile?.display_name ?? "You", memberProfile.display_name),
              }),
            ].filter(Boolean));
          }
        } catch {
          // Email failure is non-blocking
        }
      }

      return NextResponse.json({
        success: true,
        matchId,
        newStatus: "mutual",
        isMutual: true,
        streamChannelId,
      });
    }

    if (isDeclined) {
      await supabase
        .from("matches")
        .update({ status: "declined" })
        .eq("id", matchId);
    }

    return NextResponse.json({
      success: true,
      matchId,
      newStatus: isDeclined ? "declined" : "pending",
      isMutual: false,
      streamChannelId: null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
