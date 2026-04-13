import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

export async function GET(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const mommyId = searchParams.get("mommy_id");

  if (!mommyId) {
    // Return all mommies who have pending earnings (with totals)
    const { data, error } = await admin
      .from("mommy_earnings")
      .select("mommy_id, net_amount_cents, users:mommy_id(display_name, email)")
      .eq("payout_status", "pending");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by mommy_id
    const grouped = new Map<
      string,
      { mommy_id: string; total_cents: number; user: { display_name: string | null; email: string } | null }
    >();
    for (const row of data ?? []) {
      const existing = grouped.get(row.mommy_id);
      if (existing) {
        existing.total_cents += row.net_amount_cents ?? 0;
      } else {
        grouped.set(row.mommy_id, {
          mommy_id: row.mommy_id,
          total_cents: row.net_amount_cents ?? 0,
          user: (row.users as unknown as { display_name: string | null; email: string } | null),
        });
      }
    }

    return NextResponse.json({ mommies: Array.from(grouped.values()) });
  }

  // Return earnings for a specific mommy
  const { data, error } = await admin
    .from("mommy_earnings")
    .select("id, source_type, gross_amount_cents, platform_fee_cents, net_amount_cents, payout_status, created_at")
    .eq("mommy_id", mommyId)
    .eq("payout_status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalPending = (data ?? []).reduce((sum, e) => sum + (e.net_amount_cents ?? 0), 0);

  return NextResponse.json({ earnings: data ?? [], totalPending });
}
