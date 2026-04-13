import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();
try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  const buf = await sftp.get("/home/u228387150/domains/replymommy.com/nodejs/server.js");
  const src = buf.toString();

  console.log("Has EADDRINUSE patch:", src.includes("EADDRINUSE"));
  console.log("\n--- Last 30 lines of server.js ---");
  console.log(src.split("\n").slice(-30).join("\n"));
} finally {
  await sftp.end();
}
