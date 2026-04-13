import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

export async function GET() {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { data, error } = await admin
    .from("invitation_codes")
    .select("id, code, role, max_uses, use_count, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data ?? [] });
}

export async function POST() {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { user, admin } = result;

  const code = `GOLD-RM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const { data, error } = await admin
    .from("invitation_codes")
    .insert({ code, created_by: user.id, role: "member", max_uses: 1 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data });
}

const deleteSchema = z.object({ id: z.string() });

export async function DELETE(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const body = deleteSchema.parse(await req.json());

  const { error } = await admin
    .from("invitation_codes")
    .update({ is_active: false })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
