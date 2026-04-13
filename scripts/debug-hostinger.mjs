import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();
try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  // stderr log
  const stderr = await sftp.get("/home/u228387150/domains/replymommy.com/nodejs/stderr.log");
  console.log("=== stderr.log ===");
  console.log(stderr.toString() || "(empty)");

  // Latest console.log entries
  const log = await sftp.get("/home/u228387150/domains/replymommy.com/nodejs/console.log");
  const lines = log.toString().split("\n").filter(Boolean);
  console.log(`\n=== console.log (last 10 of ${lines.length} lines) ===`);
  console.log(lines.slice(-10).join("\n"));

  // Check if EADDRINUSE patch is in server.js
  const sjs = await sftp.get("/home/u228387150/domains/replymommy.com/nodejs/server.js");
  console.log("\n=== server.js has EADDRINUSE patch:", sjs.toString().includes("EADDRINUSE"));

  // nodejs dir listing
  console.log("\n=== /nodejs/ contents ===");
  const ls = await sftp.list("/home/u228387150/domains/replymommy.com/nodejs");
  ls.forEach(f => console.log(f.type, f.name, f.size, new Date(f.modifyTime).toISOString()));

  // tmp dir
  console.log("\n=== /nodejs/tmp/ ===");
  const tmp = await sftp.list("/home/u228387150/domains/replymommy.com/nodejs/tmp");
  tmp.forEach(f => console.log(f.type, f.name, new Date(f.modifyTime).toISOString()));

} finally {
  await sftp.end();
}
