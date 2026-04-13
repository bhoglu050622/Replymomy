"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileCheck,
  Wallet,
  Mail,
  Activity,
  CreditCard,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/crm/users", label: "Users CRM", icon: Users, exact: false },
  { href: "/admin/crm/applicants", label: "Applicants CRM", icon: ClipboardList, exact: false },
  { href: "/admin/applications", label: "Applications", icon: FileCheck, exact: false },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, exact: false },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet, exact: false },
  { href: "/admin/invitations", label: "Invitations", icon: Mail, exact: false },
  { href: "/admin/investors", label: "Investors", icon: TrendingUp, exact: false },
  { href: "/admin/activity", label: "Activity Log", icon: Activity, exact: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(item: { href: string; exact: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Admin sub-nav bar */}
      <div className="sticky top-0 z-30 bg-obsidian/95 backdrop-blur-xl border-b border-champagne/[0.08]">
        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 px-6 py-0 h-12 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 h-12 text-xs font-medium whitespace-nowrap border-b-2 transition-all",
                  active
                    ? "text-champagne border-champagne"
                    : "text-ivory/50 border-transparent hover:text-ivory hover:border-champagne/30"
                )}
              >
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile nav header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            {/* Show current section */}
            {(() => {
              const current = NAV_ITEMS.find((item) => isActive(item));
              const Icon = current?.icon ?? LayoutDashboard;
              return (
                <>
                  <Icon className="size-3.5 text-champagne" />
                  <span className="text-xs font-semibold tracking-widest uppercase text-champagne">
                    {current?.label ?? "Admin"}
                  </span>
                </>
              );
            })()}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-ivory/40 hover:text-ivory transition-colors"
            aria-label="Admin nav"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-champagne/[0.08] py-2 px-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                    active
                      ? "bg-champagne/10 text-champagne"
                      : "text-ivory/50 hover:text-ivory hover:bg-champagne/[0.05]"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Page content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
