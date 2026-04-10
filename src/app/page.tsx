"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/landing/footer";

// Dynamically import components with heavy animations to avoid SSR issues
const GoldCursorTrail = dynamic(
  () => import("@/components/animations/gold-cursor-trail").then((mod) => mod.GoldCursorTrail),
  { ssr: false }
);

const VelvetCurtain = dynamic(
  () => import("@/components/animations/velvet-curtain").then((mod) => mod.VelvetCurtain),
  { ssr: false }
);

const Hero = dynamic(
  () => import("@/components/landing/hero").then((mod) => mod.Hero),
  { ssr: false }
);

const WhoAreTheMommies = dynamic(
  () => import("@/components/landing/who-are-the-mommies").then((mod) => mod.WhoAreTheMommies),
  { ssr: false }
);

const WhoGetsIn = dynamic(
  () => import("@/components/landing/who-gets-in").then((mod) => mod.WhoGetsIn),
  { ssr: false }
);

const TheExperience = dynamic(
  () => import("@/components/landing/the-experience").then((mod) => mod.TheExperience),
  { ssr: false }
);

const ThePlans = dynamic(
  () => import("@/components/landing/the-plans").then((mod) => mod.ThePlans),
  { ssr: false }
);

const WaitlistCta = dynamic(
  () => import("@/components/landing/waitlist-cta").then((mod) => mod.WaitlistCta),
  { ssr: false }
);

const BecomeAMommy = dynamic(
  () => import("@/components/landing/become-a-mommy").then((mod) => mod.BecomeAMommy),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      {/* Skip to content for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-full focus:bg-champagne focus:text-obsidian focus:text-label"
      >
        Skip to content
      </a>

      {/* Global cursor trail effect - client only */}
      <GoldCursorTrail />

      {/* Navigation */}
      <Navbar />

      {/* Main content with velvet curtain entrance */}
      <main id="main-content">
        <VelvetCurtain>
          <Hero />
          <WhoAreTheMommies />
          <WhoGetsIn />
          <TheExperience />
          <ThePlans />
          <BecomeAMommy />
          <WaitlistCta />
        </VelvetCurtain>
      </main>

      <Footer />
    </>
  );
}
