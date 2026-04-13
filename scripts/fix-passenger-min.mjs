/**
 * Remove PassengerMinInstances 1 from .htaccess.
 *
 * With MinInstances=1, Passenger starts a worker immediately after deploy —
 * right when build processes are still consuming threads → uv_thread_create crash.
 * Without it, the worker starts lazily on first request, when threads are free.
 */
import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();
const HTACCESS = "/home/u228387150/domains/replymommy.com/public_html/.htaccess";

try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  let src = (await sftp.get(HTACCESS)).toString();

  // Remove PassengerMinInstances 1 — let Passenger start lazily on first request
  src = src.replace("PassengerMinInstances 1\n", "");

  await sftp.put(Buffer.from(src, "utf8"), HTACCESS);
  console.log("✓ Updated .htaccess:\n", src);
} finally {
  await sftp.end();
}
