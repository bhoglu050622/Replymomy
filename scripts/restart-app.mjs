import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();
try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });
  const RESTART = "/home/u228387150/domains/replymommy.com/nodejs/tmp/restart.txt";
  await sftp.put(Buffer.from(Date.now().toString()), RESTART);
  console.log("✓ Touched restart.txt — Passenger will restart the app");
} finally {
  await sftp.end();
}
