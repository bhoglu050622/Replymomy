import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEDIA_CONFIG } from "@/lib/media/config";

// GET /api/admin/storage-health
// Returns media storage metrics and upgrade-recommended flag for the admin dashboard.
export async function GET() {
  const { user, supabase: userClient, response } = await requireAuth();
  if (response) return response;

  // Admin check
  const { data: userRecord } = await userClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (userRecord?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Live assets
  const { data: liveRows } = await supabase
    .from("media_assets")
    .select("size_bytes")
    .is("deleted_at", null);
  const totalLiveAssets = liveRows?.length ?? 0;
  const totalLiveBytes  = (liveRows ?? []).reduce((s, r) => s + (r.size_bytes ?? 0), 0);

  // Soft-deleted (pending purge)
  const { data: deletedRows } = await supabase
    .from("media_assets")
    .select("size_bytes")
    .not("deleted_at", "is", null);
  const totalSoftDeleted  = deletedRows?.length ?? 0;
  const pendingPurgeBytes = (deletedRows ?? []).reduce((s, r) => s + (r.size_bytes ?? 0), 0);

  // Uploads last 24h
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: last24hRows } = await supabase
    .from("media_assets")
    .select("id")
    .gte("created_at", since24h);
  const uploadsLast24h = last24hRows?.length ?? 0;

  // Uploads + bytes last 7d
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: last7dRows } = await supabase
    .from("media_assets")
    .select("size_bytes")
    .gte("created_at", since7d);
  const uploadsLast7d = last7dRows?.length ?? 0;
  const bytesLast7d   = (last7dRows ?? []).reduce((s, r) => s + (r.size_bytes ?? 0), 0);

  // Top 5 uploaders by live bytes
  const { data: allLive } = await supabase
    .from("media_assets")
    .select("owner_id, size_bytes")
    .is("deleted_at", null);

  const byUser = new Map<string, number>();
  for (const row of allLive ?? []) {
    byUser.set(row.owner_id, (byUser.get(row.owner_id) ?? 0) + (row.size_bytes ?? 0));
  }
  const topUploaders = Array.from(byUser.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, bytes]) => ({ userId, bytes }));

  // Threshold calculation
  const storageLimit   = MEDIA_CONFIG.CLOUDINARY_STORAGE_LIMIT_GB * 1024 * 1024 * 1024;
  const storageUsedPct = storageLimit > 0 ? (totalLiveBytes / storageLimit) * 100 : 0;
  const upgradeRecommended = storageUsedPct >= MEDIA_CONFIG.UPGRADE_WARN_PCT;

  return NextResponse.json({
    totalLiveAssets,
    totalLiveBytes,
    totalSoftDeleted,
    pendingPurgeBytes,
    uploadsLast24h,
    uploadsLast7d,
    bytesLast7d,
    topUploaders,
    thresholds: {
      storageUsedPct: Math.round(storageUsedPct * 10) / 10,
      upgradeRecommended,
    },
  });
}
