import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Aggregate gifts sent in the past 7 days, grouped by recipient (mommy)
  const { data: giftRows, error: giftError } = await supabase
    .from("gifts_sent")
    .select("recipient_id, amount_cents")
    .gte("created_at", weekAgo);

  if (giftError) {
    return NextResponse.json({ error: giftError.message }, { status: 500 });
  }

  if (!giftRows || giftRows.length === 0) {
    return NextResponse.json({ success: true, spotlightId: null, reason: "no_gifts" });
  }

  // Aggregate by recipient client-side
  const totals: Record<string, { count: number; total: number }> = {};
  for (const row of giftRows) {
    if (!row.recipient_id) continue;
    if (!totals[row.recipient_id]) totals[row.recipient_id] = { count: 0, total: 0 };
    totals[row.recipient_id].count += 1;
    totals[row.recipient_id].total += row.amount_cents ?? 0;
  }

  const entries = Object.entries(totals).sort((a, b) => b[1].total - a[1].total);
  if (entries.length === 0) {
    return NextResponse.json({ success: true, spotlightId: null, reason: "no_gifts" });
  }

  const [mommyId, { count: giftCount, total: giftTotalCents }] = entries[0];

  // Insert spotlight record
  const { data: spotlight, error: insertError } = await supabase
    .from("spotlight_history")
    .insert({
      mommy_id: mommyId,
      week_start: weekAgo,
      gift_count: giftCount,
      gift_total_cents: giftTotalCents,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Clear previous spotlight winner
  await supabase
    .from("users")
    .update({ is_spotlight: false })
    .eq("is_spotlight", true);

  // Crown new spotlight winner + promote elite → icon tier if applicable
  await supabase
    .from("users")
    .update({ is_spotlight: true, mommy_tier: "icon" })
    .eq("id", mommyId)
    .eq("mommy_tier", "elite");

  // Also set is_spotlight even if not elite tier
  await supabase
    .from("users")
    .update({ is_spotlight: true })
    .eq("id", mommyId);

  // Notify winner via email (non-blocking — don't fail cron if email fails)
  try {
    const { data: winnerUser } = await supabase
      .from("users")
      .select("email, display_name")
      .eq("id", mommyId)
      .single();

    if (winnerUser?.email) {
      const { resend } = await import("@/lib/resend/client");
      await resend.emails.send({
        from: "The Midnight Guild <noreply@replymommy.com>",
        to: winnerUser.email,
        subject: "You're this week's Spotlight Mommy ✦",
        html: `<p>Congratulations, ${winnerUser.display_name ?? "valued member"}!</p>
               <p>You've been selected as this week's Spotlight Mommy based on your exceptional engagement. Your profile will be featured prominently to all members this week.</p>
               <p style="font-style:italic;color:#C9A84C">— The Midnight Guild</p>`,
      });
    }
  } catch (emailErr) {
    console.error("[weekly-spotlight] failed to send winner email", emailErr);
  }

  return NextResponse.json({
    success: true,
    spotlightId: spotlight.id,
    mommyId,
    giftCount,
    giftTotalCents,
  });
}
