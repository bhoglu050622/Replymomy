import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDistanceToNow } from "date-fns";

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: matchesRaw } = await supabase
    .from("matches")
    .select("id, status, created_at, mommy_id, member_id, profiles!matches_mommy_id_fkey(display_name, photo_urls)")
    .or(`member_id.eq.${authUser!.id},mommy_id.eq.${authUser!.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  type MatchRow = {
    id: string;
    status: string;
    created_at: string;
    mommy_id: string;
    member_id: string;
    profiles: { display_name: string; photo_urls: string[] | null } | null;
  };

  const matches = (matchesRaw ?? []) as unknown as MatchRow[];

  function statusStyle(s: string) {
    if (s === "mutual") return "bg-champagne/20 text-champagne";
    if (s === "pending") return "bg-smoke border border-champagne/20 text-ivory/60";
    return "bg-smoke text-ivory/30";
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">History</div>
        <h1 className="text-display-lg text-ivory">
          All <span className="italic text-champagne">matches.</span>
        </h1>
      </div>

      {matches.length === 0 ? (
        <EmptyState variant="matches" />
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/matches/${m.id}`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all"
            >
              <div className="size-14 rounded-full bg-gradient-to-br from-burgundy to-smoke border border-champagne/30 overflow-hidden shrink-0">
                {m.profiles?.photo_urls?.[0] && (
                  <Image
                    src={m.profiles.photo_urls[0]}
                    alt={m.profiles.display_name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-headline text-xl text-ivory">
                  {m.profiles?.display_name ?? "Anonymous"}
                </div>
                <div className="text-label text-ivory/40">
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </div>
              </div>
              <div className={`text-label px-3 py-1 rounded-full ${statusStyle(m.status)}`}>
                {m.status}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
