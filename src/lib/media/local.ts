import { writeFile, mkdir, unlink, access } from "fs/promises";
import { join } from "path";

const LOCAL_UPLOAD_PATH = process.env.LOCAL_UPLOAD_PATH;
const LOCAL_UPLOAD_URL = process.env.LOCAL_UPLOAD_URL;

export function isLocalStorageConfigured(): boolean {
  return !!(LOCAL_UPLOAD_PATH?.trim() && LOCAL_UPLOAD_URL?.trim());
}

function assertLocalConfig(): void {
  if (!isLocalStorageConfigured()) {
    throw new Error("Local storage is not configured");
  }
}

/**
 * Saves a buffer to local filesystem.
 * @param buffer - The file buffer to save
 * @param relativePath - Path relative to LOCAL_UPLOAD_PATH (e.g., "rm/user-id/asset-main.webp")
 * @returns The public URL for the saved file
 */
export async function saveToLocal(
  buffer: Buffer,
  relativePath: string
): Promise<string> {
  assertLocalConfig();

  const fullPath = join(LOCAL_UPLOAD_PATH!, relativePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));

  // Create directory tree if it doesn't exist
  await mkdir(dir, { recursive: true });

  // Write file
  await writeFile(fullPath, buffer);

  // Generate public URL
  const cleanBase = LOCAL_UPLOAD_URL!.replace(/\/$/, "");
  const cleanPath = relativePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Deletes a file from local filesystem.
 * @param relativePath - Path relative to LOCAL_UPLOAD_PATH
 */
export async function deleteFromLocal(relativePath: string): Promise<void> {
  if (!isLocalStorageConfigured()) return;

  const fullPath = join(LOCAL_UPLOAD_PATH!, relativePath);

  try {
    await unlink(fullPath);
  } catch (err) {
    // File may not exist - fail silently for cleanup operations
    console.error("[media/local] deleteFromLocal failed:", relativePath, err);
  }
}

/**
 * Gets the full filesystem path for a relative path.
 * @param relativePath - Path relative to LOCAL_UPLOAD_PATH
 * @returns Full filesystem path
 */
export function getFullPath(relativePath: string): string {
  assertLocalConfig();
  return join(LOCAL_UPLOAD_PATH!, relativePath);
}

/**
 * Gets the public URL for a relative path.
 * @param relativePath - Path relative to LOCAL_UPLOAD_PATH
 * @returns Public URL
 */
export function getPublicUrl(relativePath: string): string {
  assertLocalConfig();
  const cleanBase = LOCAL_UPLOAD_URL!.replace(/\/$/, "");
  const cleanPath = relativePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Converts a public media URL back to a local relative path, if it belongs
 * to LOCAL_UPLOAD_URL. Returns null for external URLs.
 */
export function getLocalRelativePathFromUrl(url: string | null | undefined): string | null {
  if (!url?.trim() || !isLocalStorageConfigured()) return null;
  const cleanBase = LOCAL_UPLOAD_URL!.replace(/\/$/, "");
  if (!url.startsWith(`${cleanBase}/`)) return null;
  return url.slice(cleanBase.length + 1).replace(/^\/+/, "");
}

/**
 * Checks if a file exists in local storage.
 * @param relativePath - Path relative to LOCAL_UPLOAD_PATH
 * @returns True if file exists, false otherwise
 */
export async function fileExists(relativePath: string): Promise<boolean> {
  if (!isLocalStorageConfigured()) return false;

  const fullPath = join(LOCAL_UPLOAD_PATH!, relativePath);

  try {
    await access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check disk space before upload.
 * Returns available space in GB and whether there's enough (5GB threshold).
 */
export async function checkDiskSpace(): Promise<{
  ok: boolean;
  availableGB: number;
  totalGB: number;
  usedPercent: number;
}> {
  if (!isLocalStorageConfigured()) {
    return { ok: true, availableGB: 999, totalGB: 999, usedPercent: 0 };
  }

  try {
    // Use Node.js fs to check available space
    const { statfs } = await import("fs/promises");
    const stats = await statfs(LOCAL_UPLOAD_PATH!);

    const totalBytes = stats.bsize * stats.blocks;
    const availableBytes = stats.bsize * stats.bavail;
    const usedBytes = totalBytes - availableBytes;

    const totalGB = Math.round((totalBytes / 1024 / 1024 / 1024) * 100) / 100;
    const availableGB =
      Math.round((availableBytes / 1024 / 1024 / 1024) * 100) / 100;
    const usedPercent = Math.round((usedBytes / totalBytes) * 100);

    return {
      ok: availableGB > 5, // Require 5GB free
      availableGB,
      totalGB,
      usedPercent,
    };
  } catch {
    // Fail open if check fails - don't block uploads
    return { ok: true, availableGB: 999, totalGB: 999, usedPercent: 0 };
  }
}
