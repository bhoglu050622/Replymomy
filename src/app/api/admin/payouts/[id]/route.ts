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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;
  const { id } = await params;

  const { data: payout, error } = await admin
    .from("payout_requests")
    .select(
      `id, mommy_id, amount_cents, status, method, notes, requested_at, processed_at, transaction_reference, processed_by,
       mommy:mommy_id(display_name, email),
       processor:processed_by(display_name, email)`
    )
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch linked earnings
  const { data: earningLinks } = await admin
    .from("payout_request_earnings")
    .select("earning_id, mommy_earnings:earning_id(id, source_type, gross_amount_cents, net_amount_cents, payout_status, created_at)")
    .eq("payout_request_id", id);

  return NextResponse.json({
    payout,
    earnings: earningLinks?.map((l) => l.mommy_earnings).filter(Boolean) ?? [],
  });
}

const patchSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "rejected"]).optional(),
  transaction_reference: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin, userId } = result;
  const { id } = await params;

  try {
    const body = patchSchema.parse(await req.json());

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.transaction_reference !== undefined) updateData.transaction_reference = body.transaction_reference;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status === "completed" || body.status === "rejected") {
      updateData.processed_at = new Date().toISOString();
      updateData.processed_by = userId;
    }

    const { data: payout, error } = await admin
      .from("payout_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update linked earnings status based on payout status
    if (body.status === "completed" || body.status === "rejected") {
      const { data: earningLinks } = await admin
        .from("payout_request_earnings")
        .select("earning_id")
        .eq("payout_request_id", id);

      const earningIds = (earningLinks ?? []).map((l) => l.earning_id);

      if (earningIds.length > 0) {
        if (body.status === "completed") {
          await admin
            .from("mommy_earnings")
            .update({ payout_status: "completed" })
            .in("id", earningIds);
        } else if (body.status === "rejected") {
          await admin
            .from("mommy_earnings")
            .update({ payout_status: "pending", payout_batch_id: null })
            .in("id", earningIds);
        }
      }
    }

    // Log activity
    await admin.from("admin_activity_log").insert({
      actor_id: userId,
      action: "payout_updated",
      entity_type: "payout_request",
      entity_id: id,
      metadata: { ...body },
    });

    return NextResponse.json({ payout });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
