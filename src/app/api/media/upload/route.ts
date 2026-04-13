import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { requireAuth } from "@/lib/supabase/require-auth";
import { ALLOWED_MIME, MEDIA_CONFIG } from "@/lib/media/config";
import { validateMagicBytes, validateUpload, checkDailyQuota } from "@/lib/media/validate";
import { processImage } from "@/lib/media/process";
import { uploadToHostinger } from "@/lib/media/hostinger";

export const runtime = "nodejs"; // sharp requires Node.js runtime

// POST /api/media/upload
// Accepts multipart/form-data with fields: file, chatId
// Returns: { assetId, url, thumbUrl, width, height, bytes }
export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  // Parse multipart
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

  // --- Declared MIME + size check ---
  const declaredMime = file.type.toLowerCase();
  const check = validateUpload(declaredMime, file.size, MEDIA_CONFIG.MAX_IMAGE_BYTES);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  // --- Daily quota check ---
  const withinQuota = await checkDailyQuota(user.id, supabase);
  if (!withinQuota) {
    return NextResponse.json(
      { error: "Daily upload limit reached. Try again tomorrow." },
      { status: 429 }
    );
  }

  // --- Read buffer & magic bytes check ---
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const detectedMime = validateMagicBytes(buffer);

  if (!detectedMime) {
    return NextResponse.json({ error: "File type not recognised" }, { status: 400 });
  }
  if (detectedMime !== declaredMime && !(declaredMime === "image/jpeg" && detectedMime === "image/jpeg")) {
    // Allow declared mime to be a subtype match
    const detectedKind = ALLOWED_MIME[detectedMime];
    if (!detectedKind) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }
  }

  const fileKind = ALLOWED_MIME[detectedMime] ?? ALLOWED_MIME[declaredMime];

  if (fileKind === "pdf") {
    // PDF: validate size limit only, no processing
    if (file.size > MEDIA_CONFIG.MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF exceeds 10 MB limit" }, { status: 413 });
    }
    // PDF upload path (simplified — no processing)
    const assetId = randomUUID();
    const remotePath = `rm/${user.id}/chat/${chatId ?? "general"}/${assetId}.pdf`;
    let pdfUrl: string;
    try {
      pdfUrl = await uploadToHostinger(buffer, remotePath);
    } catch (err) {
      console.error("[media/upload] PDF upload failed:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    await supabase.from("media_assets").insert({
      id: assetId,
      owner_id: user.id,
      chat_id: chatId,
      url: pdfUrl,
      mime_type: detectedMime,
      size_bytes: buffer.length,
    });

    return NextResponse.json({ assetId, url: pdfUrl, thumbUrl: null });
  }

  // --- Image processing ---
  let processed: Awaited<ReturnType<typeof processImage>>;
  try {
    processed = await processImage(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Image processing failed";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  // --- SHA-256 dedup ---
  const sha256 = createHash("sha256").update(processed.main).digest("hex");
  const { data: existing } = await supabase
    .from("media_assets")
    .select("id, url, thumb_url")
    .eq("owner_id", user.id)
    .eq("sha256", sha256)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      assetId:  existing.id,
      url:      existing.url,
      thumbUrl: existing.thumb_url,
      width:    processed.width,
      height:   processed.height,
      bytes:    processed.bytes,
    });
  }

  // --- Upload to Hostinger ---
  const assetId = randomUUID();
  const baseRemotePath = `rm/${user.id}/chat/${chatId ?? "general"}/${assetId}`;

  let mainUrl: string;
  let thumbUrl: string;
  try {
    [mainUrl, thumbUrl] = await Promise.all([
      uploadToHostinger(processed.main,  `${baseRemotePath}-main.webp`),
      uploadToHostinger(processed.thumb, `${baseRemotePath}-thumb.webp`),
    ]);
  } catch (err) {
    console.error("[media/upload] Hostinger upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // --- Persist metadata ---
  await supabase.from("media_assets").insert({
    id:         assetId,
    owner_id:   user.id,
    chat_id:    chatId,
    url:        mainUrl,
    thumb_url:  thumbUrl,
    mime_type:  "image/webp",
    size_bytes: processed.bytes,
    width:      processed.width,
    height:     processed.height,
    sha256,
  });

  return NextResponse.json({
    assetId,
    url:      mainUrl,
    thumbUrl: thumbUrl,
    width:    processed.width,
    height:   processed.height,
    bytes:    processed.bytes,
  });
}
