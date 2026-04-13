import SftpClient from "ssh2-sftp-client";

const SFTP_HOST = process.env.HOSTINGER_SFTP_HOST;
const SFTP_USER = process.env.HOSTINGER_SFTP_USER;
const SFTP_PASS = process.env.HOSTINGER_SFTP_PASS;
const SFTP_PORT = parseInt(process.env.HOSTINGER_SFTP_PORT ?? "22", 10);
const SFTP_ROOT = process.env.HOSTINGER_SFTP_PATH ?? "/public_html/media";
const MEDIA_URL = process.env.HOSTINGER_MEDIA_URL; // e.g. https://replymommy.com/media

export function isHostingerConfigured(): boolean {
  return !!(SFTP_HOST && SFTP_USER && SFTP_PASS && MEDIA_URL);
}

function assertHostingerConfig(): void {
  if (!isHostingerConfigured()) {
    throw new Error("Hostinger media storage is not configured");
  }
}

/**
 * Uploads a buffer to Hostinger via SFTP.
 * remotePath is relative to SFTP_ROOT, e.g. "rm/user-id/abc-main.webp"
 * Returns the permanent public URL for the file.
 */
export async function uploadToHostinger(
  buffer: Buffer,
  remotePath: string
): Promise<string> {
  assertHostingerConfig();
  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host:     SFTP_HOST!,
      port:     SFTP_PORT,
      username: SFTP_USER!,
      password: SFTP_PASS!,
    });

    const fullRemotePath = `${SFTP_ROOT}/${remotePath}`;
    const dir = fullRemotePath.substring(0, fullRemotePath.lastIndexOf("/"));

    // Create directory tree if it doesn't exist
    await sftp.mkdir(dir, true);

    // Upload buffer directly
    await sftp.put(buffer, fullRemotePath);
  } finally {
    await sftp.end();
  }

  const cleanBase = MEDIA_URL!.replace(/\/$/, "");
  const cleanPath = remotePath.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Deletes a file from Hostinger by its relative remote path.
 * Fails silently so cleanup crons don't abort on missing assets.
 */
export async function deleteFromHostinger(remotePath: string): Promise<void> {
  if (!isHostingerConfigured()) return;
  const sftp = new SftpClient();

  try {
    await sftp.connect({
      host:     SFTP_HOST!,
      port:     SFTP_PORT,
      username: SFTP_USER!,
      password: SFTP_PASS!,
    });

    const fullRemotePath = `${SFTP_ROOT}/${remotePath}`;
    await sftp.delete(fullRemotePath);
  } catch (err) {
    console.error("[media/hostinger] deleteFromHostinger failed:", remotePath, err);
  } finally {
    await sftp.end().catch(() => {});
  }
}
