/**
 * Patches server.js on Hostinger so EADDRINUSE exits cleanly (code 0)
 * instead of code 1 — preventing Passenger from endlessly respawning
 * workers that can't bind port 3000.
 */
import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();

const REMOTE = "/home/u228387150/domains/replymommy.com/nodejs/server.js";
const PATCH_MARKER = "// patched: EADDRINUSE clean exit";

try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  const buf = await sftp.get(REMOTE);
  let src = buf.toString();

  if (src.includes(PATCH_MARKER)) {
    console.log("Already patched.");
    process.exit(0);
  }

  // Replace the catch handler so EADDRINUSE exits cleanly (code 0)
  src = src.replace(
    `.catch((err) => {\n  console.error(err);\n  process.exit(1);\n});`,
    `.catch((err) => {\n  ${PATCH_MARKER}\n  if (err.code === 'EADDRINUSE') {\n    // Port already held by another worker — exit cleanly so Passenger\n    // routes traffic to that worker instead of respawning.\n    process.exit(0);\n  }\n  console.error(err);\n  process.exit(1);\n});`
  );

  if (!src.includes(PATCH_MARKER)) {
    // Try alternate whitespace
    src = src.replace(
      /\.catch\(\(err\) => \{\s*console\.error\(err\);\s*process\.exit\(1\);\s*\}\);/,
      `.catch((err) => {\n  ${PATCH_MARKER}\n  if (err.code === 'EADDRINUSE') { process.exit(0); }\n  console.error(err);\n  process.exit(1);\n});`
    );
  }

  if (!src.includes(PATCH_MARKER)) {
    console.error("Could not find .catch handler to patch. Printing end of file:");
    console.log(src.slice(-500));
    process.exit(1);
  }

  await sftp.put(Buffer.from(src, "utf8"), REMOTE);
  console.log("✓ Patched server.js — EADDRINUSE exits with code 0");
} finally {
  await sftp.end();
}
