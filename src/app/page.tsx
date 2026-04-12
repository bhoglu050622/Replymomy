"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/landing/footer";

// Heavy/animation components loaded client-side only
const VelvetCurtain = dynamic(
  () => import("@/components/animations/velvet-curtain").then((m) => m.VelvetCurtain),
  { ssr: false }
);

const GrainOverlay = dynamic(
  () => import("@/components/animations/grain-overlay").then((m) => m.GrainOverlay),
  { ssr: false }
);

const GoldCursorTrail = dynamic(
  () => import("@/components/animations/gold-cursor-trail").then((mod) => mod.GoldCursorTrail),
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

const SocialProof = dynamic(
  () => import("@/components/landing/social-proof").then((mod) => mod.SocialProof),
  { ssr: false }
);

const HowItWorks = dynamic(
  () => import("@/components/landing/how-it-works").then((mod) => mod.HowItWorks),
  { ssr: false }
);

const Testimonials = dynamic(
  () => import("@/components/landing/testimonials").then((mod) => mod.Testimonials),
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
    <VelvetCurtain>
      {/* Skip to content — keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-full focus:bg-champagne focus:text-obsidian focus:text-label"
      >
        Skip to content
      </a>

      {/* Global film grain overlay */}
      <GrainOverlay opacity={0.055} animated />

      {/* Global cursor trail effect */}
      <GoldCursorTrail />

      {/* Navigation */}
      <Navbar />

      <main id="main-content" className="relative">
        <Hero />
        <SocialProof />
        <WhoAreTheMommies />
        <HowItWorks />
        <TheExperience />
        <BecomeAMommy />
        <ThePlans />
        <Testimonials />
        <WaitlistCta />
      </main>

      <Footer />
    </VelvetCurtain>
  );
}
