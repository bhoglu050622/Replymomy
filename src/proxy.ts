import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  let response: NextResponse;
  try {
    response = await updateSession(request);
  } catch {
    // Last-resort: never let proxy errors 500 the site
    response = NextResponse.next({ request });
  }
  // Geo hint from edge (e.g. Cloudflare cf-ipcountry) for client-side regional pricing
  const country =
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code") ??
    "US";
  response.cookies.set("x-country", country, { path: "/", maxAge: 3600, sameSite: "lax" });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static, _next/image
     * - favicon.ico
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
