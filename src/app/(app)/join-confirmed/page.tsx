import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MEMBER_PRICES } from "@/lib/dodo/prices";

const TIER_NAMES: Record<string, string> = {
  gold: "Patron",
  platinum: "Fellow",
  black_card: "Principal",
};

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userRecord } = await supabase
    .from("users")
    .select("member_tier, full_name")
    .eq("id", user!.id)
    .single();

  const tier = userRecord?.member_tier as keyof typeof MEMBER_PRICES | null;
  const tierName = tier ? (TIER_NAMES[tier] ?? tier) : "Member";
  const isPrincipal = tier === "black_card";

  const STEPS = [
    { label: "Complete your profile", href: "/profile" },
    { label: "Set your preferences", href: "/settings" },
    { label: "Browse your first match", href: "/dashboard" },
    ...(isPrincipal ? [{ label: "Meet your Personal Liaison", href: "/settings/concierge" }] : []),
  ];

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Wax seal ornament */}
        <div className="mb-8 flex justify-center">
          <div
            className="size-20 rounded-full border border-champagne/40 flex items-center justify-center bg-gradient-to-br from-burgundy/30 to-smoke shadow-gold-glow"
          >
            <span className="text-champagne text-3xl">✦</span>
          </div>
        </div>

        {/* Separator */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto mb-8" />

        <p className="text-label text-champagne tracking-widest uppercase mb-3">
          Welcome to the Guild
        </p>
        <h1 className="font-headline text-5xl lg:text-6xl text-ivory mb-4">
          {userRecord?.full_name ? userRecord.full_name.split(" ")[0] : "Welcome"}
        </h1>
        <p className="text-display-sm italic text-champagne mb-2">{tierName}</p>
        <p className="text-body-sm text-ivory/50 mb-12 max-w-sm mx-auto">
          You have been accepted into The Midnight Guild.
          {isPrincipal && " Your Personal Liaison has been assigned."}
        </p>

        {/* Onboarding checklist */}
        <div className="space-y-3 mb-12 text-left">
          {STEPS.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="flex items-center gap-4 p-4 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all group"
            >
              <div className="size-8 rounded-full border border-champagne/30 flex items-center justify-center shrink-0 group-hover:border-champagne transition-colors">
                <Check className="size-4 text-champagne/40 group-hover:text-champagne transition-colors" />
              </div>
              <span className="text-body-sm text-ivory/70 group-hover:text-ivory transition-colors flex-1">
                {step.label}
              </span>
              <ArrowRight className="size-4 text-ivory/20 group-hover:text-champagne transition-colors" />
            </Link>
          ))}
        </div>

        {/* Primary CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-14 px-10 rounded-full bg-champagne text-obsidian font-medium text-sm tracking-wide shadow-gold-glow hover:bg-champagne/90 transition-colors"
        >
          Enter the Guild
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
