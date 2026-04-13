import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteAsset } from "@/lib/media/cloudinary";
import { MEDIA_CONFIG } from "@/lib/media/config";

// GET /api/cron/cleanup-media
// Runs daily at 3 AM UTC (see vercel.json).
// Pass 1: Hard-delete assets soft-deleted > 30 days ago.
// Pass 2: Hard-delete orphans (uploaded but never attached to a message, > 24h old).
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let purged = 0;
  let orphansRemoved = 0;

  // --- Pass 1: Hard-delete soft-deleted assets past retention window ---
  const purgeCutoff = new Date(
    Date.now() - MEDIA_CONFIG.SOFT_DELETE_PURGE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: toHardDelete } = await supabase
    .from("media_assets")
    .select("id, cloudinary_public_id")
    .not("deleted_at", "is", null)
    .lt("deleted_at", purgeCutoff);

  for (const asset of toHardDelete ?? []) {
    await deleteAsset(asset.cloudinary_public_id, "image");
    await deleteAsset(`${asset.cloudinary_public_id.replace("-main", "-thumb")}`, "image");
    await supabase.from("media_assets").delete().eq("id", asset.id);
    purged++;
  }

  // --- Pass 2: Hard-delete orphans (no message attached, > 24h old) ---
  const orphanCutoff = new Date(
    Date.now() - MEDIA_CONFIG.ORPHAN_TTL_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data: orphans } = await supabase
    .from("media_assets")
    .select("id, cloudinary_public_id")
    .is("stream_message_id", null)
    .is("deleted_at", null)
    .lt("created_at", orphanCutoff);

  for (const asset of orphans ?? []) {
    await deleteAsset(asset.cloudinary_public_id, "image");
    await deleteAsset(`${asset.cloudinary_public_id.replace("-main", "-thumb")}`, "image");
    await supabase.from("media_assets").delete().eq("id", asset.id);
    orphansRemoved++;
  }

  return NextResponse.json({ purged, orphansRemoved, timestamp: new Date().toISOString() });
}
