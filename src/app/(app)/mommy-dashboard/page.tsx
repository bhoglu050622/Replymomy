import Link from "next/link";
import { TrendingUp, Calendar, Award, ExternalLink, BookOpen, Clock, ArrowUpRight, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MommyPayoutButton } from "./mommy-payout-button";
import { KnowledgeArticleSheet } from "@/components/dashboard/knowledge-article-sheet";
import { getArticlesForRole } from "@/lib/knowledge/articles";

export default async function MommyDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const { data: earningsRows } = await supabase
    .from("mommy_earnings")
    .select("net_amount_cents, gross_amount_cents, source_type, payout_status, created_at")
    .eq("mommy_id", authUser!.id);

  const rows = earningsRows ?? [];
  const lifetime = rows.reduce((s, r) => s + (r.net_amount_cents ?? 0), 0) / 100;
  const thisMonth = rows
    .filter((r) => r.created_at >= startOfMonth)
    .reduce((s, r) => s + (r.net_amount_cents ?? 0), 0) / 100;
  const lastMonth = rows
    .filter((r) => r.created_at >= lastMonthStart && r.created_at < startOfMonth)
    .reduce((s, r) => s + (r.net_amount_cents ?? 0), 0) / 100;
  const available = rows
    .filter((r) => r.payout_status === "pending")
    .reduce((s, r) => s + (r.net_amount_cents ?? 0), 0) / 100;

  // Earnings by source
  const bySource = rows.reduce<Record<string, number>>((acc, r) => {
    const key = r.source_type ?? "other";
    acc[key] = (acc[key] ?? 0) + (r.net_amount_cents ?? 0) / 100;
    return acc;
  }, {});

  const monthChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;

  // Active matches
  const { count: activeMatches } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("mommy_id", authUser!.id)
    .eq("status", "mutual");

  // Stripe Connect status
  const { data: userRecord } = await supabase
    .from("users")
    .select("stripe_connect_account_id")
    .eq("id", authUser!.id)
    .single();
  const hasConnectAccount = !!userRecord?.stripe_connect_account_id;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const sourceLabels: Record<string, string> = {
    gift: "Gifts",
    gallery_unlock: "Gallery",
    spotlight: "Spotlight",
    other: "Other",
  };

  const knowledgeArticles = getArticlesForRole("mommy").slice(0, 3);

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Your Domain</div>
        <h1 className="text-display-lg text-ivory">
          Your <span className="italic text-champagne">dashboard.</span>
        </h1>
      </div>

      {/* Stripe Connect CTA */}
      {!hasConnectAccount && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-burgundy/20 to-smoke border border-champagne/30 flex items-center justify-between gap-4">
          <div>
            <div className="text-body-md text-ivory mb-1">Set up payouts</div>
            <div className="text-body-sm text-ivory/50">Connect your bank account to receive earnings.</div>
          </div>
          <MommyPayoutButton />
        </div>
      )}

      {/* ── PROMINENT EARNINGS PANEL ── */}
      <div className="mb-10 rounded-3xl overflow-hidden border border-champagne/20"
        style={{ background: "linear-gradient(135deg, #1A0A0E 0%, #111111 50%, #0A0A14 100%)" }}>
        {/* Top row */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-label text-champagne mb-2">
                <Wallet className="size-4" /> Earnings
              </div>
              <div className="font-headline text-5xl text-champagne">{fmt(available)}</div>
              <div className="text-body-sm text-ivory/40 mt-1">Available to withdraw</div>
            </div>
            <div className="text-right">
              {monthChange !== null && (
                <div className={`flex items-center gap-1 text-label ${monthChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  <ArrowUpRight className={`size-3.5 ${monthChange < 0 ? "rotate-180" : ""}`} />
                  {Math.abs(monthChange).toFixed(0)}% vs last month
                </div>
              )}
              {hasConnectAccount && (
                <div className="mt-3">
                  <MommyPayoutButton />
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "This Month", value: fmt(thisMonth) },
              { label: "Lifetime", value: fmt(lifetime) },
              { label: "Active Matches", value: String(activeMatches ?? 0) },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-label text-ivory/40 mb-1">{s.label}</div>
                <div className="font-headline text-2xl text-ivory">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Source breakdown */}
        {Object.keys(bySource).length > 0 && (
          <div className="px-8 py-5 border-t border-white/5">
            <div className="text-label text-ivory/40 mb-3">Earnings by source</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(bySource).map(([src, amt]) => (
                <div key={src} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                  <span className="text-label text-ivory/60">{sourceLabels[src] ?? src}</span>
                  <span className="text-label text-champagne">{fmt(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom link */}
        <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-body-sm text-ivory/30">Full earnings breakdown available</span>
          <Link href="/mommy-dashboard/earnings" className="text-label text-champagne flex items-center gap-1 hover:underline">
            View details <TrendingUp className="size-3" />
          </Link>
        </div>
      </div>

      {/* Section links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {[
          { href: "/mommy-dashboard/calendar", label: "Calendar", desc: "Manage your availability.", icon: Calendar },
          { href: "/mommy-dashboard/badges", label: "Badges", desc: "Your status & progress.", icon: Award },
          { href: "/mommy-dashboard/earnings", label: "Full Earnings", desc: "History & payout details.", icon: TrendingUp },
        ].map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="p-6 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all"
          >
            <s.icon className="size-5 text-champagne mb-3" />
            <div className="font-headline text-2xl text-ivory mb-1">{s.label}</div>
            <div className="text-body-sm text-ivory/50">{s.desc}</div>
            <div className="mt-4 text-label text-champagne flex items-center gap-1">
              Open <ExternalLink className="size-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Knowledge Hub */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-champagne" />
            <h2 className="text-display-md text-ivory">Guild Knowledge</h2>
          </div>
          <Link href="/knowledge" className="text-label text-champagne hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {knowledgeArticles.map((article) => (
            <KnowledgeArticleSheet key={article.id} article={article}>
              <div className="p-5 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all cursor-pointer h-full flex flex-col">
                <h3 className="text-body-md font-medium text-ivory mb-2 leading-snug">{article.title}</h3>
                <p className="text-body-sm text-ivory/50 flex-1 line-clamp-2 mb-3">{article.excerpt}</p>
                <div className="flex items-center gap-1.5 text-label text-ivory/30">
                  <Clock className="size-3" />{article.readMins} min
                </div>
              </div>
            </KnowledgeArticleSheet>
          ))}
        </div>
      </section>
    </div>
  );
}
