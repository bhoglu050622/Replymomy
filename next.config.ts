import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";
import path from "path";

function remotePatternFromUrl(raw: string | undefined): RemotePattern | null {
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" || !u.hostname) return null;
    return { protocol: "https", hostname: u.hostname, pathname: "/**" };
  } catch {
    return null;
  }
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["ssh2", "ssh2-sftp-client"],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "replymommy.com", pathname: "/**" },
      // User media from Hostinger — hostname must match HOSTINGER_MEDIA_URL or next/image blocks the URL
      ...((): RemotePattern[] => {
        const fromEnv = remotePatternFromUrl(process.env.HOSTINGER_MEDIA_URL);
        return fromEnv ? [fromEnv] : [];
      })(),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
