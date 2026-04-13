import { createAdminClient } from "@/lib/supabase/admin";

async function getAnalytics() {
  const supabase = createAdminClient();

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: completedProfile },
    { count: subscribed },
    { count: members },
    { count: mommies },
    { data: recentSignups },
    { data: recentActive },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("users").select("*", { count: "exact", head: true }).neq("status", "pending_invite").neq("status", "pending_profile"),
    supabase.from("users").select("*", { count: "exact", head: true }).neq("member_tier", "free").not("member_tier", "is", null),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "member"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "mommy"),
    supabase.from("users")
      .select("id, email, role, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("users")
      .select("id, email, role, member_tier, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUsers ?? 0,
    completedProfile: completedProfile ?? 0,
    subscribed: subscribed ?? 0,
    members: members ?? 0,
    mommies: mommies ?? 0,
    recentSignups: recentSignups ?? [],
    recentActive: recentActive ?? [],
  };
}

function pct(n: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const funnel = [
    { label: "Signed up", count: data.totalUsers, color: "bg-champagne/60" },
    { label: "Completed profile", count: data.completedProfile, color: "bg-champagne/50" },
    { label: "Active accounts", count: data.activeUsers, color: "bg-champagne/40" },
    { label: "Subscribed (paid)", count: data.subscribed, color: "bg-champagne/80" },
  ];

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto space-y-12">
      <div>
        <div className="text-label text-champagne mb-2">Admin</div>
        <h1 className="text-display-lg text-ivory">Analytics</h1>
      </div>

      {/* Role split */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: data.totalUsers },
          { label: "Active", value: data.activeUsers },
          { label: "Members", value: data.members },
          { label: "Mommies", value: data.mommies },
        ].map((s) => (
          <div key={s.label} className="bg-smoke border border-champagne/10 rounded-2xl p-5 text-center">
            <div className="font-headline text-4xl text-champagne mb-1">{s.value}</div>
            <div className="text-label text-ivory/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Conversion funnel */}
      <div>
        <h2 className="text-body-lg text-ivory font-medium mb-5">Customer Journey</h2>
        <div className="space-y-3">
          {funnel.map((step) => {
            const width = pct(step.count, data.totalUsers);
            return (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-label">
                  <span className="text-ivory/60">{step.label}</span>
                  <span className="text-champagne tabular-nums">
                    {step.count} <span className="text-ivory/30">({width})</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-smoke border border-champagne/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${step.color} transition-all`}
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-label text-ivory/30 mt-3">
          Conversion: {pct(data.subscribed, data.totalUsers)} of signups become paying subscribers
        </p>
      </div>

      {/* Recent signups */}
      <div>
        <h2 className="text-body-lg text-ivory font-medium mb-4">Recent Signups</h2>
        <div className="overflow-x-auto rounded-2xl border border-champagne/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-champagne/10 text-left">
                <th className="px-4 py-3 text-label text-ivory/40 font-normal">Email</th>
                <th className="px-4 py-3 text-label text-ivory/40 font-normal">Role</th>
                <th className="px-4 py-3 text-label text-ivory/40 font-normal">Status</th>
                <th className="px-4 py-3 text-label text-ivory/40 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSignups.map((u) => (
                <tr key={u.id} className="border-b border-champagne/5 hover:bg-champagne/[0.03]">
                  <td className="px-4 py-3 text-ivory/70 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                      u.role === "mommy" ? "bg-rose/20 text-rose" : "bg-champagne/15 text-champagne"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ivory/50 text-xs">{u.status}</td>
                  <td className="px-4 py-3 text-ivory/40 text-xs">
                    {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap note */}
      <div className="rounded-2xl border border-champagne/10 bg-smoke/50 p-5">
        <p className="text-label text-ivory/40">
          Heatmaps and session recordings are captured via PostHog and viewable in your{" "}
          <span className="text-champagne">PostHog dashboard → Recordings & Heatmaps</span>.
          Ensure <code className="text-xs bg-champagne/10 px-1 py-0.5 rounded">NEXT_PUBLIC_POSTHOG_KEY</code> is set in your environment.
        </p>
      </div>
    </div>
  );
}
