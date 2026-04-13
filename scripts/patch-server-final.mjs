/**
 * Replaces the TCP pre-check guard (which has a race condition) with a
 * simple startServer().catch() handler that exits cleanly on EADDRINUSE.
 *
 * Race condition in the pre-check:
 *   Worker 1: probe → port free → close → startServer()
 *   Worker 2: probe → port free → close → startServer()   <- both pass simultaneously
 *   Both call startServer() → both hit EADDRINUSE → both exit(0) → nobody serves.
 *
 * Correct approach: all workers race to startServer(), first one wins,
 * losers get EADDRINUSE in catch → exit(0) (Passenger won't respawn on 0).
 */
import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();
const REMOTE = "/home/u228387150/domains/replymommy.com/nodejs/server.js";

try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  let src = (await sftp.get(REMOTE)).toString();

  // 1. Remove the TCP pre-check guard block entirely
  src = src.replace(/\n\/\/ rm-patch: single-worker port guard[\s\S]*?tester\.listen\(port, host\);\s*\}\)\(\);\n/m, "\n");

  // 2. Ensure the .catch() handler exits cleanly on EADDRINUSE
  const CATCH_MARKER = "// rm-patch: EADDRINUSE clean exit";
  if (!src.includes(CATCH_MARKER)) {
    src = src.replace(
      /\.catch\(\(err\) => \{\s*console\.error\(err\);\s*process\.exit\(1\);\s*\}\);/,
      `.catch((err) => {\n  ${CATCH_MARKER}\n  if (err.code === 'EADDRINUSE') { process.exit(0); }\n  console.error(err);\n  process.exit(1);\n});`
    );
  }

  console.log("Has pre-check guard:", src.includes("rm-patch: single-worker port guard"));
  console.log("Has catch EADDRINUSE:", src.includes(CATCH_MARKER));

  await sftp.put(Buffer.from(src, "utf8"), REMOTE);
  console.log("✓ Patched server.js");

  // Verify
  const verify = (await sftp.get(REMOTE)).toString();
  console.log("Verified catch patch:", verify.includes(CATCH_MARKER));
  console.log("Guard removed:", !verify.includes("rm-patch: single-worker port guard"));
} finally {
  await sftp.end();
}
