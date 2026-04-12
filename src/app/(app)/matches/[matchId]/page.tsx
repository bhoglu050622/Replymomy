import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatchDetailClient } from "./match-detail-client";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: match } = await supabase
    .from("matches")
    .select(`
      id, status, expires_at, match_score, stream_channel_id,
      member_id, mommy_id, member_response, mommy_response,
      member_responded, mommy_responded, match_intro,
      mommy_profile:profiles!matches_mommy_id_fkey(
        display_name, date_of_birth, location_city, bio, desires, photo_urls, mommy_tier
      )
    `)
    .eq("id", matchId)
    .single();

  if (!match) notFound();

  const isMember = match.member_id === authUser!.id;
  const isMommy = match.mommy_id === authUser!.id;
  if (!isMember && !isMommy) notFound();

  function calcAge(dob: string | null): number {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  type MommyProfile = {
    display_name: string;
    date_of_birth: string | null;
    location_city: string | null;
    bio: string | null;
    desires: string[] | null;
    photo_urls: string[] | null;
    mommy_tier: string | null;
  };

  const profile = match.mommy_profile as unknown as MommyProfile | null;
  const age = calcAge(profile?.date_of_birth ?? null);
  const alreadyResponded = isMember ? match.member_responded : match.mommy_responded;

  return (
    <MatchDetailClient
      matchId={matchId}
      status={match.status}
      expiresAt={match.expires_at}
      streamChannelId={match.stream_channel_id}
      alreadyResponded={!!alreadyResponded}
      isMember={isMember}
      matchIntro={(match as unknown as { match_intro: string | null }).match_intro ?? null}
      profile={{
        displayName: profile?.display_name ?? "Anonymous",
        age,
        city: profile?.location_city ?? "",
        bio: profile?.bio ?? "",
        desires: profile?.desires ?? [],
        photoUrls: profile?.photo_urls ?? [],
        tier: profile?.mommy_tier ?? "",
      }}
    />
  );
}
