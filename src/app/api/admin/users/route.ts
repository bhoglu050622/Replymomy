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

  if (userRecord?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin: createAdminClient(), userId: user!.id };
}

export async function GET(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const from = page * limit;
  const to = from + limit - 1;
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";
  const tier = searchParams.get("tier") ?? "";

  let query = admin
    .from("users")
    .select(
      "id, email, display_name, role, status, member_tier, mommy_tier, verification_status, token_balance, last_active_at, is_spotlight, created_at",
      { count: "exact" }
    );

  if (search) {
    query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
  }
  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);
  if (tier) query = query.eq("member_tier", tier);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [], total: count ?? 0, page, limit });
}

const patchSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "suspended", "banned"]),
  reason: z.string().max(500).optional(),
});

export async function PATCH(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin, userId } = result;

  try {
    const { userId: targetId, status, reason } = patchSchema.parse(await req.json());

    // Fetch current status for history
    const { data: currentUser } = await admin
      .from("users")
      .select("status")
      .eq("id", targetId)
      .single();

    const { error } = await admin
      .from("users")
      .update({ status })
      .eq("id", targetId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log status change to history
    await admin.from("user_status_history").insert({
      user_id: targetId,
      old_status: currentUser?.status ?? null,
      new_status: status,
      changed_by: userId,
      reason: reason ?? null,
    });

    // Log to activity log
    await admin.from("admin_activity_log").insert({
      actor_id: userId,
      action: "user_status_changed",
      entity_type: "user",
      entity_id: targetId,
      metadata: {
        old_status: currentUser?.status,
        new_status: status,
        reason: reason ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
