# Hostinger + Cloudflare Setup

This guide completes the infrastructure steps required for local-disk media with CDN caching.

## 1) Hostinger disk paths

Set these environment variables in your production server:

- `LOCAL_UPLOAD_PATH=/home/<user>/domains/<domain>/public_html/uploads`
- `LOCAL_UPLOAD_URL=https://<your-domain>/uploads`
- `CLOUDFLARE_CDN_URL=https://<your-domain>` (optional, when proxied by Cloudflare)

Optional fallback providers:

- Hostinger SFTP (`HOSTINGER_*`) for secondary fallback
- Cloudinary (`NEXT_PUBLIC_CLOUDINARY_*`, `CLOUDINARY_API_SECRET`) for final fallback

## 2) Upload directory hardening

Ensure this exists on server:

- `<public_html>/uploads/.htaccess`

This repository includes a reference file at:

- `public/uploads/.htaccess`

Copy it to your real uploads directory if needed.

## 3) Cloudflare onboarding

1. Create/sign in to Cloudflare account.
2. Add your domain.
3. At your registrar, replace nameservers with the two Cloudflare nameservers.
4. In Cloudflare DNS:
   - `A`/`CNAME` records for your app host should be **Proxied** (orange cloud).
5. SSL/TLS:
   - Mode: **Full (strict)**.
6. Caching:
   - Create Cache Rule for `*<your-domain>/uploads/*`
   - Cache eligibility: eligible
   - Edge TTL: 7 days
   - Browser TTL: 4 hours or higher

## 4) Verify cutover

Run from local terminal:

```bash
dig +short NS <your-domain>
```

Expected: Cloudflare nameservers.

Check HTTP response headers for uploaded media URL:

```bash
curl -I "https://<your-domain>/uploads/<path-to-file>"
```

Expected (after caching warms):

- `cf-cache-status: HIT` (or MISS initially then HIT on repeat)
- Long-lived cache headers (`cache-control`)

## 5) App-level verification

1. Upload a new image in app.
2. Confirm `media_assets.url` points to `LOCAL_UPLOAD_URL`.
3. Open image URL in browser and confirm it loads.
4. Upload and remove media, then run cleanup cron and verify local files are removed.

## 6) Rollback

If local disk upload has issues, disable it without code change:

- `DISABLE_LOCAL_UPLOAD=1`

Fallback order becomes Hostinger SFTP then Cloudinary.
