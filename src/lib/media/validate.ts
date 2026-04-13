import type { SupabaseClient } from "@supabase/supabase-js";
import { ALLOWED_MIME, MAGIC_BYTES, MEDIA_CONFIG } from "./config";

/**
 * Inspects the first 12 bytes of a buffer and returns the detected MIME type,
 * or null if no signature matches. This prevents content-type spoofing.
 */
export function validateMagicBytes(buffer: Buffer): string | null {
  for (const sig of MAGIC_BYTES) {
    const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length);
    if (sig.bytes.every((b, i) => slice[i] === b)) {
      // Extra check for WebP: bytes 8-11 must be "WEBP"
      if (sig.mime === "image/webp") {
        const webp = buffer.slice(8, 12).toString("ascii");
        if (webp !== "WEBP") continue;
      }
      return sig.mime;
    }
  }
  return null;
}

/**
 * Validates a file's declared MIME type and size against allowed limits.
 */
export function validateUpload(
  declaredMime: string,
  sizeBytes: number,
  maxBytes: number
): { ok: true } | { ok: false; error: string; status: number } {
  if (!(declaredMime in ALLOWED_MIME)) {
    return { ok: false, error: `File type not allowed: ${declaredMime}`, status: 400 };
  }
  if (sizeBytes > maxBytes) {
    const mb = (maxBytes / 1024 / 1024).toFixed(0);
    return { ok: false, error: `File exceeds ${mb} MB limit`, status: 413 };
  }
  return { ok: true };
}

/**
 * Checks whether the user has exceeded their daily upload quota (100 MB/day).
 * Returns true if within quota, false if exceeded.
 */
export async function checkDailyQuota(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("media_assets")
    .select("size_bytes")
    .eq("owner_id", userId)
    .gte("created_at", since)
    .is("deleted_at", null);

  const totalBytes = (data ?? []).reduce((sum, row) => sum + (row.size_bytes ?? 0), 0);
  return totalBytes < MEDIA_CONFIG.MAX_DAILY_UPLOAD_BYTES;
}
