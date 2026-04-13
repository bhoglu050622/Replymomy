import { Sparkles, TrendingUp, Crown, BookOpen, Clock } from "lucide-react";
import { MatchCardPreview } from "@/components/dashboard/match-card-preview";
import { EmptyState } from "@/components/dashboard/empty-state";
import { KnowledgeArticleSheet } from "@/components/dashboard/knowledge-article-sheet";
import { createClient } from "@/lib/supabase/server";
import { getArticlesForRole } from "@/lib/knowledge/articles";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().split("T")[0];

  // Fetch user record
  const { data: userRecord } = await supabase
    .from("users")
    .select("token_balance, member_tier, role, profiles_browsed_count")
    .eq("id", authUser!.id)
    .single();

  const role = (userRecord?.role ?? "member") as "member" | "mommy" | "admin";
  const knowledgeArticles = getArticlesForRole(role).slice(0, 3);

  // Fetch today's matches with mommy profiles
  const { data: matchesRaw } = await supabase
    .from("matches")
    .select("id, match_score, status, mommy_id, expires_at, member_response, profiles!matches_mommy_id_fkey(display_name, date_of_birth, location_city, desires, photo_urls)")
    .eq("member_id", authUser!.id)
    .eq("match_date", today)
    .neq("status", "expired");

  // Fetch weekly spotlight
  // eslint-disable-next-line react-hooks/purity
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: spotlight } = await supabase
    .from("spotlight_history")
    .select("mommy_id, profiles!spotlight_history_mommy_id_fkey(display_name, location_city)")
    .gte("week_start", weekAgo)
    .limit(1)
    .maybeSingle();

  // Fetch quick stats
  const { count: mutualCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("member_id", authUser!.id)
    .eq("status", "mutual");

  const { count: messageCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("member_id", authUser!.id)
    .eq("status", "mutual")
    .not("stream_channel_id", "is", null);

  const { count: giftsCount } = await supabase
    .from("gifts_sent")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", authUser!.id);

  type MatchWithProfile = {
    id: string;
    match_score: number | null;
    status: string;
    mommy_id: string;
    expires_at: string;
    member_response: string | null;
    profiles: {
      display_name: string;
      date_of_birth: string | null;
      location_city: string | null;
      desires: string[] | null;
      photo_urls: string[] | null;
    } | null;
  };

  const matches = (matchesRaw ?? []) as unknown as MatchWithProfile[];

  function calcAge(dob: string | null): number {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  const tierLabels: Record<string, string> = {
    pro: "Pro",
    unlimited: "Unlimited",
    // Legacy
    gold: "Gold",
    platinum: "Platinum",
    black_card: "Black Card",
  };

  const browsedCount = userRecord?.profiles_browsed_count ?? 0;
  const isFreeMember = userRecord?.role === "member" && !userRecord?.member_tier;

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <div className="text-label text-champagne mb-3">Tonight.</div>
          <h1 className="text-display-lg text-ivory">
            Your <span className="italic text-champagne">matches.</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <div className="text-label text-ivory/40">Tokens</div>
            <div className="font-headline text-2xl text-champagne">
              {userRecord?.token_balance ?? 0}
            </div>
          </div>
          <div className="size-12 rounded-full bg-gradient-to-br from-champagne to-burgundy flex items-center justify-center">
            <Crown className="size-5 text-obsidian" />
          </div>
        </div>
      </div>

      {/* Daily matches */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="size-5 text-champagne" />
          <h2 className="text-display-md text-ivory">Today&apos;s Matches</h2>
        </div>
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((m) => (
              <MatchCardPreview
                key={m.id}
                matchId={m.id}
                name={m.profiles?.display_name ?? "Anonymous"}
                age={calcAge(m.profiles?.date_of_birth ?? null)}
                city={m.profiles?.location_city ?? "Unknown"}
                desire={m.profiles?.desires?.[0] ?? ""}
                matchScore={Math.round(m.match_score ?? 0)}
                photoUrl={m.profiles?.photo_urls?.[0] ?? null}
                alreadyResponded={!!m.member_response}
                status={m.status}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            variant={userRecord?.member_tier ? "no-matches-today" : "matches"}
            action={
              !userRecord?.member_tier
                ? { href: "/settings/subscription", label: "Choose a tier" }
                : undefined
            }
          />
        )}
      </section>

      {/* Spotlight */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="size-5 text-champagne" />
          <h2 className="text-display-md text-ivory">Icon of the Week</h2>
        </div>
        <div
          className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-champagne/30"
          style={{
            // Pure CSS backdrop (optional: run scripts/generate-assets.mjs for /spotlight-bg.jpg)
            backgroundImage: [
              "linear-gradient(to right, rgba(10,10,12,0.88) 0%, transparent 55%)",
              "radial-gradient(ellipse 120% 90% at 85% 15%, rgba(180, 90, 110, 0.35) 0%, transparent 55%)",
              "radial-gradient(ellipse 100% 120% at 0% 100%, #2a0812 0%, #4A0E1A 42%, #120508 100%)",
            ].join(", "),
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundColor: "#4A0E1A",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 to-transparent" />
          <div className="relative h-full flex items-center px-10">
            <div>
              <div className="text-label text-champagne mb-3">This Week</div>
              <h3 className="font-headline text-3xl sm:text-5xl text-ivory mb-2">
                {(spotlight?.profiles as { display_name?: string } | null)?.display_name ?? "TBA"}
              </h3>
              <p className="text-body-md text-ivory/70 mb-4 max-w-md">
                {(spotlight?.profiles as { location_city?: string } | null)?.location_city
                  ? `Currently in ${(spotlight?.profiles as { location_city?: string }).location_city}.`
                  : "The finest, this week."}
              </p>
              {spotlight?.mommy_id && (
                <Link
                  href={`/profile/${spotlight.mommy_id}`}
                  className="text-label text-champagne hover:underline"
                >
                  View profile →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-3 gap-4 lg:gap-6">
        {[
          { label: "Active Matches", value: String(mutualCount ?? 0) },
          { label: "Chats", value: String(messageCount ?? 0) },
          { label: "Gifts Sent", value: String(giftsCount ?? 0) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-smoke border border-champagne/10"
          >
            <div className="text-label text-ivory/40 mb-2">{stat.label}</div>
            <div className="font-headline text-3xl text-champagne">
              {stat.value}
            </div>
          </div>
        ))}
      </section>

      {userRecord?.member_tier && (
        <div className="mt-6 text-center">
          <span className="text-label text-ivory/30">
            {tierLabels[userRecord.member_tier] ?? userRecord.member_tier} Member
          </span>
        </div>
      )}

      {isFreeMember && (
        <div className="mt-6 p-4 rounded-2xl bg-smoke border border-champagne/10 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-label text-ivory/40 mb-1">Profile Views</div>
            <div className="text-body-sm text-ivory/60 mb-2">
              {browsedCount} / 20 free profiles viewed
            </div>
            <div className="w-full h-1 bg-champagne/10 rounded-full">
              <div
                className="h-1 bg-champagne rounded-full transition-all"
                style={{ width: `${Math.min(100, (browsedCount / 20) * 100)}%` }}
              />
            </div>
          </div>
          <Link
            href="/settings/subscription"
            className="text-label text-champagne hover:underline shrink-0"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Knowledge Hub */}
      <section className="mt-16">
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
