import { uploadBuffer } from "./cloudinary";
import { isHostingerConfigured, uploadToHostinger } from "./hostinger";
import {
  isLocalStorageConfigured,
  saveToLocal,
  checkDiskSpace,
} from "./local";

export function isCloudinaryConfigured(): boolean {
  const name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return !!(
    name &&
    name !== "your-cloud-name" &&
    key &&
    key !== "your-api-key" &&
    secret &&
    secret !== "your-api-secret"
  );
}

/**
 * Storage priority for file uploads (PDF, image, or video).
 * Default: Local Disk → Hostinger SFTP → Cloudinary
 */
export function getStoragePriority(): Array<"local" | "hostinger" | "cloudinary"> {
  if (
    process.env.PREFER_CLOUDINARY_UPLOAD === "true" ||
    process.env.PREFER_CLOUDINARY_UPLOAD === "1"
  ) {
    return ["cloudinary", "local", "hostinger"];
  }

  if (
    process.env.DISABLE_LOCAL_UPLOAD === "true" ||
    process.env.DISABLE_LOCAL_UPLOAD === "1"
  ) {
    return ["hostinger", "cloudinary"];
  }

  if (
    process.env.DISABLE_HOSTINGER_UPLOAD === "true" ||
    process.env.DISABLE_HOSTINGER_UPLOAD === "1"
  ) {
    return ["local", "cloudinary"];
  }

  return ["local", "hostinger", "cloudinary"];
}

/**
 * Upload a single binary (PDF, image, or video).
 * Priority: Local → Hostinger → Cloudinary
 */
export async function uploadBinaryAsset(
  buffer: Buffer,
  /** Relative path including extension, e.g. rm/uid/chat/x/uuid.pdf */
  remotePath: string,
  resourceType: "image" | "raw" | "video" = "raw"
): Promise<string> {
  const cloud = isCloudinaryConfigured();
  const host = isHostingerConfigured();
  const local = isLocalStorageConfigured();
  const priority = getStoragePriority();
  const publicId = remotePath.replace(/\.[^/.]+$/, "");

  const configured = {
    local,
    hostinger: host,
    cloudinary: cloud,
  };

  const available = priority.filter((p) => configured[p]);

  if (available.length === 0) {
    throw new Error("Media storage is not configured on the server");
  }

  const toCloudinary = async () => {
    const up = await uploadBuffer(buffer, publicId, resourceType);
    return up.secureUrl;
  };

  const toHostinger = async () => {
    return await uploadToHostinger(buffer, remotePath);
  };

  const toLocal = async () => {
    const diskCheck = await checkDiskSpace();
    if (!diskCheck.ok) {
      throw new Error(
        `Insufficient disk space: ${diskCheck.availableGB.toFixed(1)}GB available, need 5GB minimum`
      );
    }
    return await saveToLocal(buffer, remotePath);
  };

  const strategies: Record<string, () => Promise<string>> = {
    local: toLocal,
    hostinger: toHostinger,
    cloudinary: toCloudinary,
  };

  let lastError: Error | null = null;
  for (const storage of available) {
    try {
      return await strategies[storage]();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(
        `[upload-backend] ${storage} binary upload failed:`,
        lastError.message
      );
    }
  }

  throw lastError || new Error("All storage options failed");
}
