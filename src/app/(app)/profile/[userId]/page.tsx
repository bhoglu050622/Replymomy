import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GalleryUnlockButton } from "./gallery-unlock-button";
import { ProfileBrowseLimitWall } from "@/components/shared/profile-browse-limit-wall";

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

  // Fetch viewer's record to enforce browse limit
  const { data: viewer } = await supabase
    .from("users")
    .select("role, member_tier, profiles_browsed_count")
    .eq("id", authUser!.id)
    .single();

  const isMember = viewer?.role === "member";
  if (isMember) {
    const tier = viewer?.member_tier ?? null;
    // free tier = 20 profiles; any paid tier = unlimited browsing
    const limit = tier === null ? 20 : -1;
    const count = viewer?.profiles_browsed_count ?? 0;

    if (limit !== -1 && count >= limit) {
      return <ProfileBrowseLimitWall currentTier={tier} limit={limit} />;
    }

    // Increment counter. RLS policy allows users to update their own row.
    await supabase
      .from("users")
      .update({ profiles_browsed_count: count + 1 })
      .eq("id", authUser!.id);
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, date_of_birth, location_city, desires, photo_urls")
    .eq("user_id", userId)
    .single();

  if (!profile) notFound();

  // Fetch gallery items
  const { data: galleryItems } = await supabase
    .from("gallery_items")
    .select("id, url, is_premium, token_cost")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  // Fetch unlocks for the current user
  const { data: unlocks } = await supabase
    .from("gallery_unlocks")
    .select("gallery_item_id, unlock_type")
    .eq("user_id", authUser!.id)
    .eq("owner_id", userId);

  const hasFullUnlock = unlocks?.some((u) => u.unlock_type === "full_gallery") ?? false;
  const unlockedItemIds = new Set(
    (unlocks ?? []).map((u) => u.gallery_item_id).filter(Boolean)
  );

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
  const freeItems = (galleryItems ?? []).filter((g) => !g.is_premium);
  const premiumItems = (galleryItems ?? []).filter((g) => g.is_premium);
  const totalGalleryTokenCost = 20; // full_gallery unlock cost

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      {/* Hero photo */}
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-burgundy via-smoke to-obsidian border border-champagne/30 mb-8 relative overflow-hidden">
        {profile.photo_urls?.[0] ? (
          <Image
            src={profile.photo_urls[0]}
            alt={profile.display_name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : null}
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

      {/* Bio */}
      {profile.bio && (
        <div className="mb-8">
          <div className="text-label text-champagne mb-3">About</div>
          <p className="text-body-lg text-ivory/80 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Interests */}
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

      {/* Gallery */}
      {(freeItems.length > 0 || premiumItems.length > 0) && (
        <div className="mb-10">
          <div className="text-label text-champagne mb-4">⸻ Gallery</div>

          {/* Free items */}
          {freeItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {freeItems.map((item) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden border border-champagne/20">
                  <Image src={item.url} alt="" fill className="object-cover" sizes="(max-width: 768px) 33vw, 200px" />
                </div>
              ))}
            </div>
          )}

          {/* Premium items */}
          {premiumItems.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {premiumItems.map((item) => {
                  const isUnlocked = hasFullUnlock || unlockedItemIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="aspect-square rounded-xl bg-smoke border border-champagne/20 relative overflow-hidden"
                    >
                      {isUnlocked ? (
                        <Image src={item.url} alt="" fill className="object-cover" sizes="(max-width: 768px) 33vw, 200px" />
                      ) : (
                        <>
                          <Image
                            src={item.url}
                            alt=""
                            fill
                            className="object-cover blur-xl scale-110"
                            sizes="(max-width: 768px) 33vw, 200px"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-obsidian/40">
                            <div className="size-8 rounded-full bg-champagne/20 border border-champagne/40 flex items-center justify-center">
                              <span className="text-champagne text-xs">🔒</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {!hasFullUnlock && (
                <GalleryUnlockButton
                  ownerId={userId}
                  tokenCost={totalGalleryTokenCost}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* If no gallery */}
      {freeItems.length === 0 && premiumItems.length === 0 && (
        <div className="mb-10">
          <div className="text-label text-champagne mb-4">⸻ Private Gallery</div>
          <div className="border-2 border-dashed border-champagne/15 rounded-2xl p-10 text-center">
            <div className="size-12 rounded-full bg-smoke border border-champagne/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-champagne/40 text-lg">🔒</span>
            </div>
            <p className="text-body-sm text-ivory/30">Gallery is private.</p>
          </div>
        </div>
      )}
    </div>
  );
}
