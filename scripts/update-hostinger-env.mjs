#!/usr/bin/env node
/**
 * Writes the correct .env to Hostinger .builds/config/.env via SFTP.
 * Run: node --env-file=.env.local scripts/update-hostinger-env.mjs
 */
import SftpClient from "ssh2-sftp-client";

const sftp = new SftpClient();

const ENV_CONTENT = `NEXT_PUBLIC_SUPABASE_URL=https://twpxdygqplagunenzqfs.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_EKXlst_9yx57g6ysA77_7A_f9gnqCBc
SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}
DODO_SECRET_KEY=${process.env.DODO_SECRET_KEY}
DODO_WEBHOOK_SECRET=${process.env.DODO_WEBHOOK_SECRET}
DODO_PRODUCT_GOLD=${process.env.DODO_PRODUCT_GOLD}
DODO_PRODUCT_PLATINUM=${process.env.DODO_PRODUCT_PLATINUM}
DODO_PRODUCT_BLACK_CARD=${process.env.DODO_PRODUCT_BLACK_CARD}
DODO_PRODUCT_TOKENS_5=${process.env.DODO_PRODUCT_TOKENS_5}
DODO_PRODUCT_TOKENS_12=${process.env.DODO_PRODUCT_TOKENS_12}
DODO_PRODUCT_TOKENS_30=${process.env.DODO_PRODUCT_TOKENS_30}
HOSTINGER_SFTP_HOST=${process.env.HOSTINGER_SFTP_HOST}
HOSTINGER_SFTP_USER=${process.env.HOSTINGER_SFTP_USER}
HOSTINGER_SFTP_PASS=${process.env.HOSTINGER_SFTP_PASS}
HOSTINGER_SFTP_PORT=${process.env.HOSTINGER_SFTP_PORT}
HOSTINGER_SFTP_PATH=${process.env.HOSTINGER_SFTP_PATH}
HOSTINGER_MEDIA_URL=${process.env.HOSTINGER_MEDIA_URL}
PERSONA_API_KEY=${process.env.PERSONA_API_KEY}
PERSONA_TEMPLATE_ID=${process.env.PERSONA_TEMPLATE_ID}
PERSONA_WEBHOOK_SECRET=${process.env.PERSONA_WEBHOOK_SECRET}
RESEND_API_KEY=${process.env.RESEND_API_KEY}
NEXT_PUBLIC_POSTHOG_KEY=${process.env.NEXT_PUBLIC_POSTHOG_KEY}
NEXT_PUBLIC_POSTHOG_HOST=${process.env.NEXT_PUBLIC_POSTHOG_HOST}
CRON_SECRET=${process.env.CRON_SECRET}
`;

const REMOTE_PATH = "/home/u228387150/domains/replymommy.com/public_html/.builds/config/.env";

try {
  await sftp.connect({
    host: process.env.HOSTINGER_SFTP_HOST,
    port: Number(process.env.HOSTINGER_SFTP_PORT),
    username: process.env.HOSTINGER_SFTP_USER,
    password: process.env.HOSTINGER_SFTP_PASS,
  });

  const buf = Buffer.from(ENV_CONTENT, "utf8");
  await sftp.put(buf, REMOTE_PATH);
  console.log("✓ .env written to Hostinger:", REMOTE_PATH);

  // Verify
  const content = await sftp.get(REMOTE_PATH);
  const str = content.toString();
  const urlLine = str.split("\n").find((l) => l.startsWith("NEXT_PUBLIC_SUPABASE_URL"));
  console.log("✓ Verified:", urlLine);
} finally {
  await sftp.end();
}
