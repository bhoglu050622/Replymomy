import SftpClient from "ssh2-sftp-client";
const sftp = new SftpClient();
try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });
  const buf = await sftp.get("/home/u228387150/domains/replymommy.com/public_html/.htaccess");
  console.log("=== .htaccess ===");
  console.log(buf.toString());
} finally {
  await sftp.end();
}
