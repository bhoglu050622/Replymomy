import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/discover?cursor=<ISO-date>
// Returns 20 recently joined profiles of the opposite role, sorted by newest first.
// No tier gate — available to all authenticated users.
export async function GET(req: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const admin = createAdminClient();
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor"); // ISO date string for pagination

  // Get current user's role
  const { data: currentUser } = await admin
    .from("users")
    .select("role, status")
    .eq("id", user!.id)
    .single();

  if (!currentUser || currentUser.status !== "active") {
    return NextResponse.json({ profiles: [], nextCursor: null });
  }

  // Show opposite role (members see mommies, mommies see members)
  const targetRole = currentUser.role === "member" ? "mommy" : "member";

  // Step 1: Get active users of target role (joined in last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: activeUsers } = await admin
    .from("users")
    .select("id")
    .eq("role", targetRole)
    .eq("status", "active");

  if (!activeUsers?.length) {
    return NextResponse.json({ profiles: [], nextCursor: null });
  }

  const userIds = activeUsers.map((u) => u.id);

  // Step 2: Fetch profiles sorted by created_at desc, with cursor pagination
  let query = admin
    .from("profiles")
    .select(
      "user_id, display_name, headline, bio, location_city, date_of_birth, desires, photo_urls, created_at"
    )
    .in("user_id", userIds)
    .gt("created_at", ninetyDaysAgo)
    .order("created_at", { ascending: false })
    .limit(21); // fetch 21 to detect if there's a next page

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: profiles, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const hasMore = (profiles?.length ?? 0) > 20;
  const page = (profiles ?? []).slice(0, 20);
  const nextCursor = hasMore ? page[page.length - 1]?.created_at ?? null : null;

  return NextResponse.json({ profiles: page, nextCursor });
}
