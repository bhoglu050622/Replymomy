import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { requireAuth } from "@/lib/supabase/require-auth";
import { ALLOWED_MIME, MEDIA_CONFIG } from "@/lib/media/config";
import { validateMagicBytes, validateUpload, checkDailyQuota } from "@/lib/media/validate";
import { uploadBinaryAsset } from "@/lib/media/upload-backend";

export const runtime = "nodejs";

// POST /api/media/upload
// Accepts multipart/form-data with fields: file, chatId
// Supports images (JPEG/PNG/WebP), videos (MP4/WebM), and PDFs.
export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const chatId = formData.get("chatId") as string | null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const withinQuota = await checkDailyQuota(user.id, supabase);
  if (!withinQuota) {
    return NextResponse.json(
      { error: "Daily upload limit reached. Try again tomorrow." },
      { status: 429 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const detectedMime = validateMagicBytes(buffer);

  const cat = detectedMime ? ALLOWED_MIME[detectedMime] : undefined;
  if (!cat || !detectedMime) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const maxBytes =
    cat === "image" ? MEDIA_CONFIG.MAX_IMAGE_BYTES
    : cat === "video" ? MEDIA_CONFIG.MAX_VIDEO_BYTES
    : MEDIA_CONFIG.MAX_PDF_BYTES;

  const check = validateUpload(detectedMime, file.size, maxBytes);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const assetId = randomUUID();
  const chatPath = chatId ?? "general";

  let mainUrl: string;
  let thumbUrl: string | null = null;

  if (cat === "image") {
    // Resize main image to max 1920px, encode as WebP
    let mainBuffer: Buffer;
    try {
      mainBuffer = await sharp(buffer)
        .resize(MEDIA_CONFIG.IMAGE_MAIN_EDGE, MEDIA_CONFIG.IMAGE_MAIN_EDGE, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: MEDIA_CONFIG.WEBP_QUALITY })
        .toBuffer();

      // Re-encode at lower quality if still over limit
      if (mainBuffer.length > MEDIA_CONFIG.PROCESSED_MAX_BYTES) {
        mainBuffer = await sharp(buffer)
          .resize(MEDIA_CONFIG.IMAGE_MAIN_EDGE, MEDIA_CONFIG.IMAGE_MAIN_EDGE, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: MEDIA_CONFIG.WEBP_QUALITY_FALLBACK })
          .toBuffer();
      }
    } catch (err) {
      console.error("[media/upload] Image processing failed:", err);
      return NextResponse.json({ error: "Image processing failed" }, { status: 422 });
    }

    const mainPath = `rm/${user.id}/chat/${chatPath}/${assetId}.webp`;
    try {
      mainUrl = await uploadBinaryAsset(mainBuffer, mainPath, "image");
    } catch (err) {
      console.error("[media/upload] Image upload failed:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Generate thumbnail
    try {
      const thumbBuffer = await sharp(buffer)
        .resize(MEDIA_CONFIG.IMAGE_THUMB_EDGE, MEDIA_CONFIG.IMAGE_THUMB_EDGE, { fit: "cover" })
        .webp({ quality: MEDIA_CONFIG.WEBP_QUALITY })
        .toBuffer();
      const thumbPath = `rm/${user.id}/chat/${chatPath}/${assetId}_thumb.webp`;
      thumbUrl = await uploadBinaryAsset(thumbBuffer, thumbPath, "image");
    } catch {
      // Thumbnail failure is non-fatal; main image already uploaded
      thumbUrl = null;
    }
  } else if (cat === "video") {
    const ext = detectedMime === "video/mp4" ? "mp4" : "webm";
    const videoPath = `rm/${user.id}/chat/${chatPath}/${assetId}.${ext}`;
    try {
      mainUrl = await uploadBinaryAsset(buffer, videoPath, "video");
    } catch (err) {
      console.error("[media/upload] Video upload failed:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } else {
    // PDF — unchanged path
    const pdfPath = `rm/${user.id}/chat/${chatPath}/${assetId}.pdf`;
    try {
      mainUrl = await uploadBinaryAsset(buffer, pdfPath, "raw");
    } catch (err) {
      console.error("[media/upload] PDF upload failed:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  await supabase.from("media_assets").insert({
    id: assetId,
    owner_id: user.id,
    chat_id: chatId,
    url: mainUrl!,
    thumb_url: thumbUrl,
    mime_type: detectedMime,
    size_bytes: buffer.length,
  });

  return NextResponse.json({
    assetId,
    url: mainUrl!,
    thumbUrl,
    mimeType: detectedMime,
  });
}
