import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { passesStrictAdminSession } from "@/lib/admin-strict";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ["/", "/login", "/admin-login", "/apply", "/investors", "/api/waitlist", "/api/investor"];
  const isPublic =
    publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/dodo/webhook") ||
    pathname.startsWith("/api/concierge/") ||
    pathname.startsWith("/api/verification/webhook") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/invitation/") ||
    pathname.startsWith("/api/mommy/apply") ||
    pathname.startsWith("/api/member/apply");

  // Auth routes that authenticated users can be on during onboarding
  const authRoutes = [
    "/invite",
    "/verify",
    "/signup",
    "/create-profile",
    "/mommy-profile",
    "/mommy-preferences",
    "/preferences",
    "/welcome",
    "/login",
    "/callback",
  ];
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  // If Supabase env vars are missing or invalid, allow public routes through
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const supabaseConfigured =
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project");

  if (!supabaseConfigured) {
    if (!isPublic && !isAuthRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  let currentResponse = supabaseResponse;

  let supabase;
  try {
    supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          currentResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            currentResponse.cookies.set(name, value, options)
          );
        },
      },
    });
  } catch {
    if (!isPublic && !isAuthRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  // Refresh session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — treat as unauthenticated
  }

  // Not logged in trying to access protected route → redirect to login
  if (!user && !isPublic && !isAuthRoute) {
    // Admin routes redirect to the dedicated admin login page
    if (pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin UI: block non-admins; in production, only allowlisted email + email identity
  if (user && pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
    try {
      const { data: adminCheck } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      if (adminCheck?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (!passesStrictAdminSession(user)) {
        return NextResponse.redirect(new URL("/admin-login", request.url));
      }
    } catch {
      // Can't verify role — deny access
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
  }

  // Logged in: enforce onboarding gate (skip for API routes — they handle their own auth)
  if (user && !isPublic && !pathname.startsWith("/api/")) {
    try {
      const { data: userRecord } = await supabase
        .from("users")
        .select("status, role")
        .eq("id", user.id)
        .single();

      if (userRecord) {
        const status = userRecord.status as string;
        const role = userRecord.role as string;

        // Admin users belong in /admin — redirect away from the regular app
        if (role === "admin" && !pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }

        const isMommy = role === "mommy";
        const statusToRoute: Record<string, string> = {
          pending_invite: "/invite",
          pending_verification: "/verify",
          pending_profile: isMommy ? "/mommy-profile" : "/create-profile",
          pending_preferences: isMommy ? "/mommy-preferences" : "/preferences",
        };

        const requiredRoute = statusToRoute[status];
        if (requiredRoute && !pathname.startsWith(requiredRoute)) {
          return NextResponse.redirect(new URL(requiredRoute, request.url));
        }

        // Active users hitting auth routes → send to appropriate dashboard
        if (status === "active" && isAuthRoute && pathname !== "/welcome") {
          const home = isMommy ? "/mommy-dashboard" : "/dashboard";
          return NextResponse.redirect(new URL(home, request.url));
        }
      }
    } catch {
      // DB query failed — let the request through
    }
  }

  return currentResponse;
}
