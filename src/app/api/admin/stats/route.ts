import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { user, supabase, response } = await requireAuth();
  if (response) return { error: response };
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (userRecord?.role !== "admin")
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { admin: createAdminClient(), userId: user!.id };
}

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [
    { count: totalUsers },
    { count: activeMembers },
    { count: mommyCount },
    { count: pendingApplications },
    { count: newUsersThisWeek },
    { data: pendingPayouts },
    { data: recentApps },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "mommy"),
    admin
      .from("mommy_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo.toISOString()),
    admin
      .from("payout_requests")
      .select("amount_cents")
      .eq("status", "pending"),
    admin
      .from("mommy_applications")
      .select("id, full_name, email, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("users")
      .select("id, email, display_name, role, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pendingPayoutsTotal = (pendingPayouts ?? []).reduce(
    (sum, p) => sum + (p.amount_cents ?? 0),
    0
  );

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    activeMembers: activeMembers ?? 0,
    mommyCount: mommyCount ?? 0,
    pendingApplications: pendingApplications ?? 0,
    newUsersThisWeek: newUsersThisWeek ?? 0,
    pendingPayoutsTotal,
    recentApplications: recentApps ?? [],
    recentUsers: recentUsers ?? [],
  });
}
