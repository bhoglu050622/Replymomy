export const MEDIA_CONFIG = {
  MAX_IMAGE_BYTES:            8  * 1024 * 1024,  // 8 MB raw upload limit
  MAX_PDF_BYTES:              10 * 1024 * 1024,  // 10 MB
  MAX_ATTACHMENTS:            3,
  MAX_DAILY_UPLOAD_BYTES:     100 * 1024 * 1024, // 100 MB per user per day
  IMAGE_MAIN_EDGE:            1920,
  IMAGE_THUMB_EDGE:           320,
  WEBP_QUALITY:               75,
  WEBP_QUALITY_FALLBACK:      60,                // re-encode quality if output still over limit
  PROCESSED_MAX_BYTES:        1.5 * 1024 * 1024, // 1.5 MB processed output limit
  ORPHAN_TTL_HOURS:           24,
  SOFT_DELETE_PURGE_DAYS:     30,
  // Free-tier 70% warning thresholds
  CLOUDINARY_STORAGE_LIMIT_GB:   25,
  CLOUDINARY_BANDWIDTH_LIMIT_GB: 25,
  UPGRADE_WARN_PCT:           70,
} as const;

// Allowed MIME types — videos disabled at MVP
export const ALLOWED_MIME: Record<string, "image" | "pdf"> = {
  "image/jpeg":       "image",
  "image/png":        "image",
  "image/webp":       "image",
  "application/pdf":  "pdf",
};

// Magic byte signatures for server-side file type verification
export const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset: number }> = [
  { mime: "image/jpeg",       bytes: [0xFF, 0xD8, 0xFF],             offset: 0 },
  { mime: "image/png",        bytes: [0x89, 0x50, 0x4E, 0x47],       offset: 0 },
  { mime: "image/webp",       bytes: [0x52, 0x49, 0x46, 0x46],       offset: 0 }, // RIFF header
  { mime: "application/pdf",  bytes: [0x25, 0x50, 0x44, 0x46],       offset: 0 }, // %PDF
];
