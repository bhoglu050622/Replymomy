import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();
try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  // Check nodejs dir
  console.log("=== /nodejs/ ===");
  const ls = await sftp.list("/home/u228387150/domains/replymommy.com/nodejs");
  ls.forEach(f => console.log(f.type, f.name, f.size));

  // Check if server.js exists
  console.log("\n=== server.js exists? ===");
  const exists = await sftp.exists("/home/u228387150/domains/replymommy.com/nodejs/server.js");
  console.log(exists);

  // Check tmp dir for restart file
  console.log("\n=== tmp/ ===");
  try {
    const tmp = await sftp.list("/home/u228387150/domains/replymommy.com/nodejs/tmp");
    tmp.forEach(f => console.log(f.type, f.name));
  } catch { console.log("tmp dir not found"); }

  // Check build config env
  console.log("\n=== .builds/config/.env (first 3 lines) ===");
  const env = await sftp.get("/home/u228387150/domains/replymommy.com/public_html/.builds/config/.env");
  console.log(env.toString().split("\n").slice(0,3).join("\n"));

} finally {
  await sftp.end();
}
