import Image from "next/image";
import { Camera, Edit, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MEMBER_PRICES } from "@/lib/dodo/prices";
import { ProfileEditDialog } from "./profile-edit-dialog";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [{ data: userRecord }, { data: profile }] = await Promise.all([
    supabase
      .from("users")
      .select("member_tier, mommy_tier, token_balance, role")
      .eq("id", authUser!.id)
      .single(),
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser!.id)
      .single(),
  ]);

  const tier = userRecord?.member_tier ?? userRecord?.mommy_tier;
  const tierInfo = userRecord?.member_tier
    ? MEMBER_PRICES[userRecord.member_tier as keyof typeof MEMBER_PRICES]
    : null;

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="text-label text-champagne mb-3">Profile</div>
          <h1 className="text-display-lg text-ivory">
            Your <span className="italic text-champagne">profile.</span>
          </h1>
        </div>
        <ProfileEditDialog
          initialName={profile?.display_name ?? ""}
          initialBio={profile?.bio ?? ""}
          initialDesires={profile?.desires ?? []}
          initialPhotoUrls={profile?.photo_urls ?? []}
        />
      </div>

      {/* Photos */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-burgundy/30 to-smoke border border-champagne/20 overflow-hidden flex items-center justify-center"
          >
            {profile?.photo_urls?.[i] ? (
              <Image
                src={profile.photo_urls[i]}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            ) : (
              <Camera className="size-6 text-champagne/30" />
            )}
          </div>
        ))}
      </div>

      {/* Bio */}
      <div className="mb-8">
        <div className="text-label text-champagne mb-3">Bio</div>
        <p className="text-body-lg text-ivory/80 leading-relaxed">
          {profile?.bio || "A glimpse, not the full story. Edit your profile to write yours."}
        </p>
      </div>

      {/* Interests */}
      <div className="mb-8">
        <div className="text-label text-champagne mb-3">Interests</div>
        <div className="flex flex-wrap gap-2">
          {(profile?.desires?.length ? profile.desires : ["Travel", "Fine Dining", "Intellectual"]).map(
            (d: string) => (
              <span
                key={d}
                className="px-4 py-2 rounded-full text-body-sm bg-smoke border border-champagne/30 text-champagne"
              >
                {d}
              </span>
            )
          )}
        </div>
      </div>

      {/* Tier & Tokens */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-smoke to-burgundy/20 border border-champagne/30">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="size-4 text-champagne" />
            <div className="text-label text-ivory/40">Membership</div>
          </div>
          <div className="font-headline text-3xl text-champagne">
            {tierInfo?.name ?? tier ?? "None"}
          </div>
          {tierInfo && (
            <div className="text-body-sm text-ivory/60 mt-2">
              ${tierInfo.amount}/month
            </div>
          )}
        </div>
        <div className="p-6 rounded-2xl bg-smoke border border-champagne/10">
          <div className="text-label text-ivory/40 mb-2">Tokens</div>
          <div className="font-headline text-3xl text-champagne">
            {userRecord?.token_balance ?? 0}
          </div>
          <div className="text-body-sm text-ivory/60 mt-2">Available balance</div>
        </div>
      </div>
    </div>
  );
}
