import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

// GET /api/admin/manual-payments — list all (default: pending first)
export async function GET() {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { data, error } = await admin
    .from("manual_payments")
    .select(`
      id,
      tier,
      amount_display,
      status,
      created_at,
      approved_at,
      notes,
      user:users!manual_payments_user_id_fkey (
        id,
        email,
        display_name,
        role,
        status,
        member_tier
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ payments: data });
}

// PATCH /api/admin/manual-payments — approve or reject
export async function PATCH(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { user, admin } = result;

  const { id, action, notes } = await req.json() as {
    id: string;
    action: "approve" | "reject";
    notes?: string;
  };

  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  // Fetch the payment to get user_id + tier
  const { data: payment, error: fetchErr } = await admin
    .from("manual_payments")
    .select("user_id, tier, status")
    .eq("id", id)
    .single();

  if (fetchErr || !payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (payment.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 409 });
  }

  // Update payment status
  await admin
    .from("manual_payments")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      notes: notes ?? null,
    })
    .eq("id", id);

  // On approval: upgrade user tier + ensure status is active
  if (action === "approve") {
    await admin
      .from("users")
      .update({
        member_tier: payment.tier,
        status: "active",
      })
      .eq("id", payment.user_id);
  }

  return NextResponse.json({ ok: true });
}
