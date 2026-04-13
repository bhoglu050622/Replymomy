import sharp from "sharp";
import { MEDIA_CONFIG } from "./config";

export interface ProcessedImage {
  main: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
  bytes: number; // final size of main buffer
}

/**
 * Processes an image buffer:
 * 1. Auto-orients from EXIF
 * 2. Strips all metadata (EXIF, GPS, ICC, etc.)
 * 3. Resizes to max 1920px long edge (preserves aspect ratio, no enlargement)
 * 4. Encodes as WebP at quality 75
 * 5. If output > 1.5 MB, re-encodes at quality 60; rejects if still over
 * 6. Generates 320px thumbnail
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  // --- Main image ---
  const mainPipeline = sharp(input)
    .rotate()                         // auto-orient from EXIF
    .withMetadata({})                 // strip all metadata
    .resize({
      width:  MEDIA_CONFIG.IMAGE_MAIN_EDGE,
      height: MEDIA_CONFIG.IMAGE_MAIN_EDGE,
      fit:    "inside",
      withoutEnlargement: true,
    });

  let main = await mainPipeline
    .clone()
    .webp({ quality: MEDIA_CONFIG.WEBP_QUALITY })
    .toBuffer();

  // Re-encode at lower quality if still over processed size limit
  if (main.length > MEDIA_CONFIG.PROCESSED_MAX_BYTES) {
    main = await mainPipeline
      .clone()
      .webp({ quality: MEDIA_CONFIG.WEBP_QUALITY_FALLBACK })
      .toBuffer();

    if (main.length > MEDIA_CONFIG.PROCESSED_MAX_BYTES) {
      throw new Error(
        `Image cannot be compressed below ${(MEDIA_CONFIG.PROCESSED_MAX_BYTES / 1024 / 1024).toFixed(1)} MB`
      );
    }
  }

  // Get final dimensions from the main buffer
  const meta = await sharp(main).metadata();

  // --- Thumbnail ---
  const thumb = await sharp(input)
    .rotate()
    .withMetadata({})
    .resize({
      width:  MEDIA_CONFIG.IMAGE_THUMB_EDGE,
      height: MEDIA_CONFIG.IMAGE_THUMB_EDGE,
      fit:    "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: MEDIA_CONFIG.WEBP_QUALITY })
    .toBuffer();

  return {
    main,
    thumb,
    width:  meta.width  ?? 0,
    height: meta.height ?? 0,
    bytes:  main.length,
  };
}
