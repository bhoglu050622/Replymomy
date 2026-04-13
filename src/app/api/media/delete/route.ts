import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// DELETE /api/media/delete?assetId=xxx
// Soft-deletes an asset. Cloudinary hard-delete happens via the cleanup cron after 30d.
export async function DELETE(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const assetId = new URL(req.url).searchParams.get("assetId");
  if (!assetId) {
    return NextResponse.json({ error: "assetId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("media_assets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", assetId)
    .eq("owner_id", user.id)
    .is("deleted_at", null);

  if (error) {
    console.error("[media/delete]", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
