import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  // Forward Vercel geo header as a short-lived cookie for client-side regional pricing
  const country = request.headers.get("x-vercel-ip-country") ?? "US";
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
