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

  return { admin: createAdminClient() };
}

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { data, error } = await admin
    .from("users")
    .select("id, email, display_name, role, status, member_tier, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}

const patchSchema = z.object({
  userId: z.string(),
  status: z.enum(["active", "suspended"]),
});

export async function PATCH(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { userId, status } = patchSchema.parse(await req.json());

  const { error } = await admin
    .from("users")
    .update({ status })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
