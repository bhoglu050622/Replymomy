import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  tier: z.enum(["pro", "unlimited"]),
  amount_display: z.string().min(1).max(20),
});

export async function POST(req: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Prevent duplicate pending requests for same user+tier
  const { data: existing } = await supabase
    .from("manual_payments")
    .select("id")
    .eq("user_id", user!.id)
    .eq("tier", body.tier)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id }); // idempotent
  }

  const { data, error } = await supabase
    .from("manual_payments")
    .insert({
      user_id: user!.id,
      tier: body.tier,
      amount_display: body.amount_display,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
