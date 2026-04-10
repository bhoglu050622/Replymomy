import Link from "next/link";
import { CreditCard, Lock, Bell, ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userRecord } = await supabase
    .from("users")
    .select("member_tier")
    .eq("id", user!.id)
    .single();

  const isPrincipal = userRecord?.member_tier === "black_card";

  const SECTIONS = [
    { href: "/settings/subscription", icon: CreditCard, label: "Membership", desc: "Manage your plan." },
    { href: "/settings/privacy", icon: Lock, label: "Privacy", desc: "Control what others see." },
    { href: "/settings/notifications", icon: Bell, label: "Notifications", desc: "Your preferences." },
    ...(isPrincipal
      ? [{ href: "/settings/concierge", icon: Sparkles, label: "Personal Liaison", desc: "Your 24/7 concierge." }]
      : []),
  ];

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-2xl mx-auto">
      <h1 className="text-display-lg text-ivory mb-10">
        <span className="italic text-champagne">Settings.</span>
      </h1>

      <div className="space-y-2 mb-10">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/10 hover:border-champagne/30 transition-all"
          >
            <div className="size-12 rounded-full border border-champagne/30 flex items-center justify-center">
              <s.icon className="size-5 text-champagne" />
            </div>
            <div className="flex-1">
              <div className="text-body-md text-ivory">{s.label}</div>
              <div className="text-label text-ivory/40">{s.desc}</div>
            </div>
            <ChevronRight className="size-5 text-ivory/30" />
          </Link>
        ))}
      </div>

      <SignOutButton />
    </div>
  );
}
