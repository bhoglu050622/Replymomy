"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Gift,
  User,
  Settings,
  Crown,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";

const MEMBER_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Sparkles },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/gifts", label: "Gifts", icon: Gift },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOMMY_NAV_ITEMS = [
  { href: "/mommy-dashboard", label: "Dashboard", icon: Sparkles },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/mommy-dashboard/earnings", label: "Earnings", icon: Crown },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Keep BASE_NAV_ITEMS for mobile nav (uses slice)
const BASE_NAV_ITEMS = MEMBER_NAV_ITEMS;

export function AppNav() {
  const pathname = usePathname();
  const role = useUserStore((s) => s.role);

  const baseItems = role === "mommy" ? MOMMY_NAV_ITEMS : MEMBER_NAV_ITEMS;
  const NAV_ITEMS = role === "admin"
    ? [...MEMBER_NAV_ITEMS, { href: "/admin", label: "Admin", icon: ShieldCheck }]
    : baseItems;

  return (
    <nav className="flex-1 px-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group",
              active
                ? "bg-smoke text-champagne border border-champagne/10"
                : "text-ivory/60 hover:bg-smoke hover:text-champagne"
            )}
          >
            <item.icon
              className={cn(
                "size-5 transition-colors",
                active ? "text-champagne" : "group-hover:text-champagne"
              )}
            />
            <span className="text-body-sm">{item.label}</span>
            {active && (
              <span className="ml-auto size-1.5 rounded-full bg-champagne" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-obsidian/95 backdrop-blur-xl border-t border-champagne/10 z-40">
      <div className="grid grid-cols-5 gap-1 px-2 py-3">
        {BASE_NAV_ITEMS.slice(0, 5).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 transition-colors",
                active ? "text-champagne" : "text-ivory/60 hover:text-champagne"
              )}
            >
              <item.icon className="size-5" />
              <span className="text-[10px] uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SidebarFooter() {
  const tier = useUserStore((s) => s.memberTier);
  const balance = useUserStore((s) => s.tokenBalance);

  return (
    <div className="p-6 border-t border-champagne/10">
      <div className="text-label text-ivory/30">
        {tier ? `${tier.replace("_", " ")} Member` : "Member"}
      </div>
      {balance !== null && (
        <div className="text-label text-champagne mt-1">{balance} tokens</div>
      )}
    </div>
  );
}
