import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

export async function GET() {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [
    { count: totalUsers },
    { count: activeMembers },
    { count: mommyCount },
    { count: pendingMommyApps },
    { count: pendingMemberApps },
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
      .from("member_applications")
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
    pendingApplications: (pendingMommyApps ?? 0) + (pendingMemberApps ?? 0),
    pendingMommyApplications: pendingMommyApps ?? 0,
    pendingMemberApplications: pendingMemberApps ?? 0,
    newUsersThisWeek: newUsersThisWeek ?? 0,
    pendingPayoutsTotal,
    recentApplications: recentApps ?? [],
    recentUsers: recentUsers ?? [],
  });
}
