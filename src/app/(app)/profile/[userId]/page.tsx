import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GalleryUnlockButton } from "./gallery-unlock-button";

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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo_urls[0]}
            alt={profile.display_name}
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
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
            <div className="grid grid-cols-3 gap-3 mb-3">
              {freeItems.map((item) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden border border-champagne/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" loading="lazy" className="w-full h-full object-cover" />
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover blur-xl scale-110"
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
