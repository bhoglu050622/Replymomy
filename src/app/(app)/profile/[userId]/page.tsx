import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileBrowseLimitWall } from "@/components/shared/profile-browse-limit-wall";
import { ProfilePlaceholder } from "@/components/shared/profile-placeholder";
import { ProfilePhotoGrid } from "@/components/profile/profile-photo-grid";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: viewer } = await supabase
    .from("users")
    .select("role, member_tier, profiles_browsed_count")
    .eq("id", authUser!.id)
    .single();

  const isMember = viewer?.role === "member";
  if (isMember) {
    const tier = viewer?.member_tier ?? null;
    const limit = tier === null ? 20 : -1;
    const count = viewer?.profiles_browsed_count ?? 0;

    if (limit !== -1 && count >= limit) {
      return <ProfileBrowseLimitWall currentTier={tier} limit={limit} />;
    }

    await supabase
      .from("users")
      .update({ profiles_browsed_count: count + 1 })
      .eq("id", authUser!.id);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, date_of_birth, location_city, desires, photo_urls")
    .eq("user_id", userId)
    .single();

  if (!profile) notFound();

  function calcAge(dob: string | null): number {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  const age = calcAge(profile.date_of_birth);

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-burgundy via-smoke to-obsidian border border-champagne/30 mb-8 relative overflow-hidden">
        <ProfilePlaceholder seed={userId} width={600} height={800} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-8">
          <h1 className="font-headline text-5xl text-ivory mb-2">
            {profile.display_name}
          </h1>
          <div className="flex items-center gap-3 text-body-md text-ivory/70">
            {age > 0 && <span>{age}</span>}
            {profile.location_city && (
              <>
                <span className="size-1 rounded-full bg-champagne" />
                <span>{profile.location_city}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {profile.bio && (
        <div className="mb-8">
          <div className="text-label text-champagne mb-3">About</div>
          <p className="text-body-lg text-ivory/80 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {profile.desires && profile.desires.length > 0 && (
        <div className="mb-10">
          <div className="text-label text-champagne mb-3">Interests</div>
          <div className="flex flex-wrap gap-2">
            {profile.desires.map((d: string) => (
              <span
                key={d}
                className="px-4 py-2 rounded-full text-body-sm bg-smoke border border-champagne/30 text-champagne"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {((profile as { photo_urls?: string[] }).photo_urls ?? []).length > 0 && (
        <div className="mb-10">
          <div className="text-label text-champagne mb-4">Gallery</div>
          <ProfilePhotoGrid
            initialUrls={(profile as { photo_urls?: string[] }).photo_urls ?? []}
            editable={false}
          />
        </div>
      )}
    </div>
  );
}
