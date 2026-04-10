import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { user, supabase, response } = await requireAuth();
  if (response) return { user: null, response };
  const { data } = await supabase.from("users").select("role").eq("id", user!.id).single();
  if (data?.role !== "admin") {
    return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, response: null };
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("mommy_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ applications: data });
}

export async function PATCH(req: Request) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const { id, action } = await req.json(); // action: "approve" | "reject"
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === "reject") {
    await supabase
      .from("mommy_applications")
      .update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  // Approve: generate mommy invitation code
  const code = `MOMMY-RM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { error: codeErr } = await supabase
    .from("invitation_codes")
    .insert({ code, role: "mommy", max_uses: 1, created_by: user!.id });

  if (codeErr) return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });

  await supabase
    .from("mommy_applications")
    .update({
      status: "approved",
      invitation_code: code,
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ success: true, code });
}
