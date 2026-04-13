/**
 * One-shot: add --env-file to NODE_OPTIONS in live .htaccess so runtime
 * env vars (SFTP creds, API keys) are loaded by Node.js at startup.
 */
import SftpClient from "ssh2-sftp-client";

const sftp = new SftpClient();
const HTACCESS = "/home/u228387150/domains/replymommy.com/public_html/.htaccess";
const ENV_FILE = "/home/u228387150/domains/replymommy.com/public_html/.builds/config/.env";

try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  let src = (await sftp.get(HTACCESS)).toString();
  console.log("Current NODE_OPTIONS line:", src.match(/SetEnv NODE_OPTIONS "[^"]+"/)?.[0]);

  if (src.includes("env-file")) {
    console.log("--env-file already present, skipping");
  } else {
    src = src.replace(
      /SetEnv NODE_OPTIONS "([^"]+)"/,
      `SetEnv NODE_OPTIONS "$1 --env-file=${ENV_FILE}"`
    );
    await sftp.put(Buffer.from(src, "utf8"), HTACCESS);
    console.log("✓ Patched .htaccess");
  }

  const verify = (await sftp.get(HTACCESS)).toString();
  console.log("Verified NODE_OPTIONS:", verify.match(/SetEnv NODE_OPTIONS "[^"]+"/)?.[0]);
} finally {
  await sftp.end();
}
