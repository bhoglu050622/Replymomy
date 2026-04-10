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

  // Promote elite → icon tier
  await supabase
    .from("users")
    .update({ mommy_tier: "icon" })
    .eq("id", mommyId)
    .eq("mommy_tier", "elite");

  return NextResponse.json({
    success: true,
    spotlightId: spotlight.id,
    mommyId,
    giftCount,
    giftTotalCents,
  });
}
