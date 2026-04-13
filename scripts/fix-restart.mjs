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
  const exists = await sftp.exists(RESTART);
  if (exists) {
    await sftp.delete(RESTART);
    console.log("✓ Deleted restart.txt");
  } else {
    console.log("restart.txt not found, nothing to do");
  }
} finally {
  await sftp.end();
}
