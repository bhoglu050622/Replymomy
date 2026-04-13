import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/supabase/require-auth";
import { processImage } from "@/lib/media/process";
import { uploadBuffer } from "@/lib/media/cloudinary";
import { isHostingerConfigured, uploadToHostinger } from "@/lib/media/hostinger";

export const runtime = "nodejs"; // sharp requires Node.js runtime

// POST /api/upload
// General-purpose image upload endpoint. Accepts multipart/form-data with a
// single "file" field. Processes the image (resize, WebP, strip EXIF) then
// uploads to Hostinger via FTP.
// Returns: { url, thumbUrl, width, height, bytes }
export async function POST(req: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Basic type guard
  const mime = file.type.toLowerCase();
  if (!mime.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are supported" }, { status: 400 });
  }

  // 10 MB raw size cap before processing
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process image (resize to 1920px WebP, generate 320px thumb, strip EXIF)
  let processed: Awaited<ReturnType<typeof processImage>>;
  try {
    processed = await processImage(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Image processing failed";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const assetId = randomUUID();
  const basePath = `rm/${user.id}/${assetId}`;
  const cloudinaryConfigured =
    !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "your-cloud-name" &&
    !!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY !== "your-api-key" &&
    !!process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== "your-api-secret";

  let mainUrl: string;
  let thumbUrl: string;
  try {
    if (isHostingerConfigured()) {
      [mainUrl, thumbUrl] = await Promise.all([
        uploadToHostinger(processed.main, `${basePath}-main.webp`),
        uploadToHostinger(processed.thumb, `${basePath}-thumb.webp`),
      ]);
    } else if (cloudinaryConfigured) {
      const [main, thumb] = await Promise.all([
        uploadBuffer(processed.main, `${basePath}-main`, "image"),
        uploadBuffer(processed.thumb, `${basePath}-thumb`, "image"),
      ]);
      mainUrl = main.secureUrl;
      thumbUrl = thumb.secureUrl;
    } else {
      return NextResponse.json(
        { error: "Image storage is not configured on the server" },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error("[api/upload] primary upload failed:", err);
    if (!cloudinaryConfigured) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    try {
      const [main, thumb] = await Promise.all([
        uploadBuffer(processed.main, `${basePath}-main`, "image"),
        uploadBuffer(processed.thumb, `${basePath}-thumb`, "image"),
      ]);
      mainUrl = main.secureUrl;
      thumbUrl = thumb.secureUrl;
    } catch (fallbackErr) {
      console.error("[api/upload] cloudinary fallback failed:", fallbackErr);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  return NextResponse.json({
    url:      mainUrl,
    thumbUrl: thumbUrl,
    width:    processed.width,
    height:   processed.height,
    bytes:    processed.bytes,
  });
}
