const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY    = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

function base64Auth(): string {
  return Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
}

/**
 * Uploads a Buffer to Cloudinary using the REST API (server-side, no SDK needed).
 * publicId should NOT include the file extension — Cloudinary appends it.
 */
export async function uploadBuffer(
  buffer: Buffer,
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image"
): Promise<{ url: string; secureUrl: string; bytes: number }> {
  const form = new FormData();

  // Convert buffer → Blob for FormData (use Uint8Array to satisfy strict FormData typings)
  const blobType =
    resourceType === "image" ? "image/webp"
    : resourceType === "video" ? "video/mp4"
    : "application/octet-stream";
  const blob = new Blob([new Uint8Array(buffer)], { type: blobType });
  form.append("file", blob, "upload");
  form.append("public_id", publicId);
  form.append("overwrite", "true");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${base64Auth()}` },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${err}`);
  }

  const data = await res.json() as { secure_url: string; url: string; bytes: number };
  return { url: data.url, secureUrl: data.secure_url, bytes: data.bytes };
}

/**
 * Deletes an asset from Cloudinary by public ID.
 * Fails silently (logs only) so cleanup crons don't abort on missing assets.
 */
export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image"
): Promise<void> {
  try {
    const form = new FormData();
    form.append("public_id", publicId);

    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
      {
        method: "POST",
        headers: { Authorization: `Basic ${base64Auth()}` },
        body: form,
      }
    );
  } catch (err) {
    console.error("[media/cloudinary] deleteAsset failed:", publicId, err);
  }
}
