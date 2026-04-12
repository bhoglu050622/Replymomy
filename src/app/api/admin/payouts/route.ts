import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { user, supabase, response } = await requireAuth();
  if (response) return { error: response };
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (userRecord?.role !== "admin")
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { admin: createAdminClient(), userId: user!.id };
}

export async function GET(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
  const limit = 50;
  const from = page * limit;
  const to = from + limit - 1;

  let query = admin
    .from("payout_requests")
    .select(
      `id, mommy_id, amount_cents, status, method, notes, requested_at, processed_at, transaction_reference,
       mommy:mommy_id(display_name, email)`,
      { count: "exact" }
    )
    .order("requested_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ payouts: data ?? [], total: count ?? 0, page, limit });
}

const createSchema = z.object({
  mommy_id: z.string().uuid(),
  amount_cents: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
  earning_ids: z.array(z.string().uuid()).min(1),
});

export async function POST(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin, userId } = result;

  try {
    const body = createSchema.parse(await req.json());

    // Create payout request
    const { data: payout, error: payoutErr } = await admin
      .from("payout_requests")
      .insert({
        mommy_id: body.mommy_id,
        amount_cents: body.amount_cents,
        notes: body.notes ?? null,
      })
      .select()
      .single();

    if (payoutErr) return NextResponse.json({ error: payoutErr.message }, { status: 500 });

    // Link earnings to payout request
    const earningLinks = body.earning_ids.map((eid) => ({
      payout_request_id: payout.id,
      earning_id: eid,
    }));
    await admin.from("payout_request_earnings").insert(earningLinks);

    // Mark earnings as processing
    await admin
      .from("mommy_earnings")
      .update({ payout_status: "processing", payout_batch_id: payout.id })
      .in("id", body.earning_ids);

    // Log
    await admin.from("admin_activity_log").insert({
      actor_id: userId,
      action: "payout_created",
      entity_type: "payout_request",
      entity_id: payout.id,
      metadata: { mommy_id: body.mommy_id, amount_cents: body.amount_cents, earning_count: body.earning_ids.length },
    });

    return NextResponse.json({ payout });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
