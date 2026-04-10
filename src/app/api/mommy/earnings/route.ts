import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: earnings, error } = await supabase
    .from("mommy_earnings")
    .select("source_type, gross_amount_cents, platform_fee_cents, net_amount_cents, payout_status, created_at")
    .eq("mommy_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({
      available: 0,
      thisMonth: 0,
      lifetime: 0,
      history: [],
    });
  }

  const rows = earnings ?? [];

  const lifetime = rows.reduce((sum, r) => sum + (r.net_amount_cents ?? 0), 0);
  const thisMonth = rows
    .filter((r) => r.created_at >= startOfMonth)
    .reduce((sum, r) => sum + (r.net_amount_cents ?? 0), 0);
  const available = rows
    .filter((r) => r.payout_status === "pending")
    .reduce((sum, r) => sum + (r.net_amount_cents ?? 0), 0);

  const history = rows.slice(0, 20).map((r) => ({
    date: r.created_at.split("T")[0],
    source: r.source_type === "gift" ? "Gift received" : r.source_type,
    gross: (r.gross_amount_cents ?? 0) / 100,
    fee: (r.platform_fee_cents ?? 0) / 100,
    net: (r.net_amount_cents ?? 0) / 100,
    status: r.payout_status,
  }));

  return NextResponse.json({
    available: available / 100,
    thisMonth: thisMonth / 100,
    lifetime: lifetime / 100,
    history,
  });
}
