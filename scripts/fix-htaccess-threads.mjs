/**
 * Patches .htaccess on Hostinger to:
 * 1. Add PassengerMaxInstances 1 (per-app worker cap)
 * 2. Reduce Node.js thread usage: --v8-pool-size=0 + UV_THREADPOOL_SIZE=1
 *    so each process uses fewer threads and doesn't hit the OS limit
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
  console.log("Current .htaccess:\n", src);

  // 1. Add PassengerMaxInstances 1 after PassengerMaxPoolSize if not present
  if (!src.includes("PassengerMaxInstances")) {
    src = src.replace(
      "PassengerMaxPoolSize 1",
      "PassengerMaxPoolSize 1\nPassengerMaxInstances 1"
    );
  }

  // 2. Reduce V8 worker threads to 0 (main thread handles V8 tasks)
  //    and add UV_THREADPOOL_SIZE=1
  if (!src.includes("v8-pool-size")) {
    src = src.replace(
      /SetEnv NODE_OPTIONS "([^"]+)"/,
      'SetEnv NODE_OPTIONS "$1 --v8-pool-size=0"'
    );
  }
  if (!src.includes("UV_THREADPOOL_SIZE")) {
    src = src.replace(
      "SetEnv TOKIO_WORKER_THREADS 2",
      "SetEnv TOKIO_WORKER_THREADS 2\nSetEnv UV_THREADPOOL_SIZE 1"
    );
  }

  await sftp.put(Buffer.from(src, "utf8"), HTACCESS);
  console.log("\n✓ Updated .htaccess:\n", src);
} finally {
  await sftp.end();
}
