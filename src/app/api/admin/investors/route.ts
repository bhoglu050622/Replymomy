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

  return { user: user!, admin: createAdminClient() };
}

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { data, error } = await admin
    .from("investors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ investors: data ?? [] });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "reviewed", "interested", "passed"]),
});

export async function PATCH(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const body = patchSchema.parse(await req.json());

  const { error } = await admin
    .from("investors")
    .update({ status: body.status })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
