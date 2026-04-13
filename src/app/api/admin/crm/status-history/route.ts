import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

export async function GET(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, error } = await admin
    .from("user_status_history")
    .select(
      "id, old_status, new_status, reason, created_at, changed_by, changer:changed_by(display_name, email)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ history: data ?? [] });
}
