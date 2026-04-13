"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  FileCheck,
  Wallet,
  TrendingUp,
  ArrowRight,
  Clock,
  HardDrive,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StorageHealth {
  totalLiveAssets: number;
  totalLiveBytes: number;
  totalSoftDeleted: number;
  pendingPurgeBytes: number;
  uploadsLast24h: number;
  uploadsLast7d: number;
  bytesLast7d: number;
  topUploaders: Array<{ userId: string; bytes: number }>;
  thresholds: {
    storageUsedPct: number;
    upgradeRecommended: boolean;
  };
}

interface Stats {
  totalUsers: number;
  activeMembers: number;
  mommyCount: number;
  pendingApplications: number;
  newUsersThisWeek: number;
  pendingPayoutsTotal: number;
  recentApplications: {
    id: string;
    full_name: string;
    email: string;
    status: string;
    created_at: string;
  }[];
  recentUsers: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    status: string;
    created_at: string;
  }[];
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl border transition-all",
        accent
          ? "bg-gradient-to-br from-champagne/10 to-champagne/[0.03] border-champagne/25"
          : "bg-smoke/80 border-champagne/[0.08]"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "size-9 rounded-xl flex items-center justify-center",
            accent ? "bg-champagne/20" : "bg-champagne/[0.08]"
          )}
        >
          <Icon className={cn("size-4", accent ? "text-champagne" : "text-ivory/50")} />
        </div>
      </div>
      <div
        className={cn(
          "font-headline text-4xl mb-1",
          accent ? "text-champagne" : "text-ivory"
        )}
      >
        {value}
      </div>
      <div className="text-label text-ivory/40">{label}</div>
      {sub && <div className="text-xs text-ivory/30 mt-1">{sub}</div>}
    </div>
  );
}

function statusColor(status: string) {
  if (status === "active") return "text-emerald-400 bg-emerald-400/10";
  if (status === "pending" || status.startsWith("pending_")) return "text-amber-400 bg-amber-400/10";
  if (status === "suspended" || status === "banned") return "text-red-400 bg-red-400/10";
  return "text-ivory/40 bg-ivory/5";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<StorageHealth | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setStats(d); })
      .finally(() => setLoading(false));

    fetch("/api/admin/storage-health")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setHealth(d); });
  }, [router]);

  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-label text-champagne/70 mb-2">Admin</div>
        <h1 className="text-display-lg text-ivory">
          Control <span className="italic text-champagne">panel.</span>
        </h1>
        <p className="text-body-sm text-ivory/40 mt-2">
          Platform overview and quick actions.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-smoke" />
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats?.totalUsers ?? 0}
              sub={`+${stats?.newUsersThisWeek ?? 0} this week`}
            />
            <StatCard
              icon={TrendingUp}
              label="Active Members"
              value={stats?.activeMembers ?? 0}
              accent
            />
            <StatCard
              icon={FileCheck}
              label="Pending Applications"
              value={stats?.pendingApplications ?? 0}
              sub={stats?.pendingApplications ? "Awaiting review" : "All reviewed"}
            />
            <StatCard
              icon={Wallet}
              label="Pending Payouts"
              value={
                stats?.pendingPayoutsTotal
                  ? `$${(stats.pendingPayoutsTotal / 100).toLocaleString()}`
                  : "$0"
              }
              sub="Awaiting processing"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <Link
          href="/admin/applications"
          className="group flex items-center justify-between p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08] hover:border-champagne/25 transition-all"
        >
          <div className="flex items-center gap-3">
            <FileCheck className="size-5 text-champagne/60 group-hover:text-champagne transition-colors" />
            <div>
              <div className="text-sm font-medium text-ivory">Review Applications</div>
              <div className="text-xs text-ivory/40">Approve or reject mommy applications</div>
            </div>
          </div>
          <ArrowRight className="size-4 text-ivory/20 group-hover:text-champagne/50 transition-colors" />
        </Link>
        <Link
          href="/admin/payouts"
          className="group flex items-center justify-between p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08] hover:border-champagne/25 transition-all"
        >
          <div className="flex items-center gap-3">
            <Wallet className="size-5 text-champagne/60 group-hover:text-champagne transition-colors" />
            <div>
              <div className="text-sm font-medium text-ivory">Manage Payouts</div>
              <div className="text-xs text-ivory/40">Process mommy earnings payouts</div>
            </div>
          </div>
          <ArrowRight className="size-4 text-ivory/20 group-hover:text-champagne/50 transition-colors" />
        </Link>
        <Link
          href="/admin/payments"
          className="group flex items-center justify-between p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08] hover:border-champagne/25 transition-all"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 text-champagne/60 group-hover:text-champagne transition-colors" />
            <div>
              <div className="text-sm font-medium text-ivory">Approve Payments</div>
              <div className="text-xs text-ivory/40">Review GPay upgrades &amp; activate tiers</div>
            </div>
          </div>
          <ArrowRight className="size-4 text-ivory/20 group-hover:text-champagne/50 transition-colors" />
        </Link>
      </div>

      {/* Storage Health */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="size-4 text-champagne/60" />
          <h2 className="text-sm font-semibold text-ivory">Storage Health</h2>
        </div>

        {health?.thresholds.upgradeRecommended && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-burgundy/20 border border-burgundy/40">
            <AlertTriangle className="size-4 text-burgundy-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-label text-burgundy-300 mb-0.5">Consider upgrading</div>
              <p className="text-body-sm text-ivory/70">
                Media storage is at {health.thresholds.storageUsedPct.toFixed(0)}% of the free-tier limit (25 GB).
                Upgrade Cloudinary before reaching 100% to avoid upload failures.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08]">
            <div className="text-label text-ivory/40 mb-1">Live Assets</div>
            <div className="font-headline text-3xl text-ivory">{health?.totalLiveAssets ?? "—"}</div>
            <div className="text-xs text-ivory/30 mt-0.5">{health ? formatBytes(health.totalLiveBytes) : ""}</div>
          </div>
          <div className="p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08]">
            <div className="text-label text-ivory/40 mb-1">Uploads (24h)</div>
            <div className="font-headline text-3xl text-ivory">{health?.uploadsLast24h ?? "—"}</div>
          </div>
          <div className="p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08]">
            <div className="text-label text-ivory/40 mb-1">Uploads (7d)</div>
            <div className="font-headline text-3xl text-ivory">{health?.uploadsLast7d ?? "—"}</div>
            <div className="text-xs text-ivory/30 mt-0.5">{health ? formatBytes(health.bytesLast7d) : ""}</div>
          </div>
          <div className="p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08]">
            <div className="text-label text-ivory/40 mb-1">Pending Purge</div>
            <div className="font-headline text-3xl text-ivory">{health?.totalSoftDeleted ?? "—"}</div>
            <div className="text-xs text-ivory/30 mt-0.5">{health ? formatBytes(health.pendingPurgeBytes) : ""}</div>
          </div>
        </div>

        {/* Storage bar */}
        {health && (
          <div className="p-5 rounded-2xl bg-smoke/80 border border-champagne/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label text-ivory/40">Cloudinary storage used</span>
              <span className="text-label text-ivory/60">
                {formatBytes(health.totalLiveBytes)} / 25 GB
                {" "}({health.thresholds.storageUsedPct.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-champagne/10 rounded-full">
              <div
                className={`h-2 rounded-full transition-all ${
                  health.thresholds.storageUsedPct >= 70
                    ? "bg-red-400"
                    : health.thresholds.storageUsedPct >= 50
                    ? "bg-amber-400"
                    : "bg-champagne"
                }`}
                style={{ width: `${Math.min(100, health.thresholds.storageUsedPct)}%` }}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-ivory/20">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-champagne inline-block" /> Safe (&lt;50%)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400 inline-block" /> Watch (50–70%)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-400 inline-block" /> Upgrade (&gt;70%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent applications */}
        <div className="rounded-2xl bg-smoke/80 border border-champagne/[0.08] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-champagne/[0.08]">
            <h2 className="text-sm font-semibold text-ivory">Recent Applications</h2>
            <Link href="/admin/applications">
              <Button variant="gold-outline" size="xs">View all</Button>
            </Link>
          </div>
          <div className="divide-y divide-champagne/[0.06]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-3">
                  <Skeleton className="h-4 w-3/4 bg-smoke mb-1" />
                  <Skeleton className="h-3 w-1/2 bg-smoke" />
                </div>
              ))
            ) : !stats?.recentApplications?.length ? (
              <div className="px-6 py-8 text-center text-sm text-ivory/30">
                No applications yet.
              </div>
            ) : (
              stats.recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between px-6 py-3 hover:bg-champagne/[0.03] transition-colors">
                  <div className="min-w-0">
                    <div className="text-sm text-ivory truncate">{app.full_name}</div>
                    <div className="text-xs text-ivory/30 truncate">{app.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full",
                        statusColor(app.status)
                      )}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent signups */}
        <div className="rounded-2xl bg-smoke/80 border border-champagne/[0.08] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-champagne/[0.08]">
            <h2 className="text-sm font-semibold text-ivory">Recent Signups</h2>
            <Link href="/admin/crm/users">
              <Button variant="gold-outline" size="xs">View all</Button>
            </Link>
          </div>
          <div className="divide-y divide-champagne/[0.06]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-3">
                  <Skeleton className="h-4 w-3/4 bg-smoke mb-1" />
                  <Skeleton className="h-3 w-1/2 bg-smoke" />
                </div>
              ))
            ) : !stats?.recentUsers?.length ? (
              <div className="px-6 py-8 text-center text-sm text-ivory/30">
                No users yet.
              </div>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3 hover:bg-champagne/[0.03] transition-colors">
                  <div className="min-w-0">
                    <div className="text-sm text-ivory truncate">
                      {u.display_name ?? u.email}
                    </div>
                    <div className="text-xs text-ivory/30 flex items-center gap-1.5">
                      <Clock className="size-2.5" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full",
                        u.role === "mommy"
                          ? "text-rose bg-burgundy/30"
                          : u.role === "admin"
                          ? "text-champagne bg-champagne/15"
                          : "text-ivory/40 bg-ivory/5"
                      )}
                    >
                      {u.role}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full",
                        statusColor(u.status)
                      )}
                    >
                      {u.status.replace("pending_", "")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
