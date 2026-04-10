import { createClient } from "@/lib/supabase/server";

const BADGE_CONFIG = [
  {
    name: "Rising",
    tier: "standard",
    description: "You're here.",
    requirements: ["Verified profile", "First match made"],
    giftsRequired: 0,
  },
  {
    name: "Elite",
    tier: "elite",
    description: "Recognized.",
    requirements: ["50+ gifts received", "3+ months active"],
    giftsRequired: 50,
  },
  {
    name: "Icon",
    tier: "icon",
    description: "The top.",
    requirements: ["200+ gifts received", "10+ Spotlight wins"],
    giftsRequired: 200,
  },
];

export default async function BadgesPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: userRecord } = await supabase
    .from("users")
    .select("mommy_tier, mommy_badge, created_at")
    .eq("id", authUser!.id)
    .single();

  const { count: giftsCount } = await supabase
    .from("gifts_sent")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", authUser!.id);

  const { count: spotlightCount } = await supabase
    .from("spotlight_history")
    .select("*", { count: "exact", head: true })
    .eq("mommy_id", authUser!.id);

  const currentTier = userRecord?.mommy_tier ?? "standard";
  const receivedGifts = giftsCount ?? 0;

  const tierOrder = ["standard", "elite", "icon"];
  const currentTierIdx = tierOrder.indexOf(currentTier);

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Status</div>
        <h1 className="text-display-lg text-ivory">
          Your <span className="italic text-champagne">badges.</span>
        </h1>
      </div>

      <div className="space-y-4">
        {BADGE_CONFIG.map((b, idx) => {
          const achieved = idx <= currentTierIdx;
          const isCurrent = b.tier === currentTier;
          const nextBadge = BADGE_CONFIG[idx + 1];
          let progress = 0;
          if (!achieved && nextBadge && b.giftsRequired > 0) {
            progress = Math.min(100, Math.round((receivedGifts / b.giftsRequired) * 100));
          }

          return (
            <div
              key={b.name}
              className={`p-8 rounded-2xl border ${
                achieved
                  ? "bg-gradient-to-b from-burgundy/20 to-smoke border-champagne/40"
                  : "bg-smoke border-champagne/10"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-headline text-3xl text-ivory mb-1">{b.name}</div>
                  <div className="text-body-sm text-ivory/50">{b.description}</div>
                </div>
                {achieved ? (
                  <span className={`text-label px-3 py-1 rounded-full ${isCurrent ? "bg-champagne text-obsidian" : "bg-champagne/20 text-champagne"}`}>
                    {isCurrent ? "Current" : "Earned"}
                  </span>
                ) : (
                  <span className="text-label px-3 py-1 rounded-full bg-smoke border border-champagne/20 text-ivory/40">
                    In progress
                  </span>
                )}
              </div>

              {!achieved && b.giftsRequired > 0 && (
                <div className="mb-4">
                  <div className="h-2 rounded-full bg-obsidian overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-champagne-600 to-champagne transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-label text-ivory/40 mt-2">
                    {receivedGifts} / {b.giftsRequired} gifts · {progress}% complete
                  </div>
                </div>
              )}

              <ul className="space-y-1">
                {b.requirements.map((r) => (
                  <li key={r} className="text-label text-ivory/60">
                    · {r}
                  </li>
                ))}
              </ul>

              {b.tier === "icon" && (spotlightCount ?? 0) > 0 && (
                <div className="mt-3 text-label text-champagne">
                  {spotlightCount} Spotlight wins
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
