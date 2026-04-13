import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { UserStoreHydrator } from "@/components/shared/user-store-hydrator";
import { AppNav, MobileNav, SidebarFooter } from "@/components/shared/app-nav";
import { PageTransition } from "@/components/shared/page-transition";
import { OnboardingTour } from "@/components/shared/onboarding-tour";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <UserStoreHydrator />
    <OnboardingTour />
    <div className="min-h-screen bg-obsidian text-ivory flex">
      {/* Skip to content for keyboard/screen reader users */}
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-full focus:bg-champagne focus:text-obsidian focus:text-label"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-champagne/10 bg-obsidian">
        <div className="p-8">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <AppNav />
        <SidebarFooter />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main id="app-content" className="flex-1 pb-24 lg:pb-0" style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}>
          <PageTransition>{children}</PageTransition>
        </main>

        <MobileNav />
      </div>
    </div>
    </>
  );
}
