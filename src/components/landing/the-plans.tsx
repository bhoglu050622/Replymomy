"use client";

import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { Check } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { CardFlip } from "@/components/animations/card-flip";
import { Button } from "@/components/ui/button";
import { TextScramble } from "@/components/animations/text-scramble";
import { MagneticText } from "@/components/animations/magnetic-text";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Patron",
    tagline: "Enter the guild.",
    price: 99,
    accent: "from-smoke to-smoke",
    border: "border-champagne/20",
    features: [
      "One curated introduction daily.",
      "Verified member profiles.",
      "5 Rose Tokens monthly.",
      "Direct encrypted messaging.",
    ],
  },
  {
    name: "Fellow",
    tagline: "The standard.",
    price: 299,
    accent: "from-burgundy/20 via-smoke to-smoke",
    border: "border-champagne/40",
    featured: true,
    features: [
      "Unlimited daily introductions.",
      "Priority queue access.",
      "20 Rose Tokens monthly.",
      "Private event invitations.",
      "Concierge introductions.",
    ],
  },
  {
    name: "Principal",
    tagline: "No ceiling.",
    price: 999,
    accent: "from-smoke via-smoke to-champagne/10",
    border: "border-champagne",
    features: [
      "Personal matchmaking service.",
      "Exclusive IRL experiences.",
      "100 Rose Tokens monthly.",
      "Private direct line.",
      "Dedicated guild host.",
    ],
  },
];

function HolographicCard({
  children,
  className,
  featured = false,
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Holographic shimmer follows mouse
  const background = useMotionTemplate`
    radial-gradient(
      400px circle at ${mouseX}px ${mouseY}px,
      rgba(201, 168, 76, 0.15),
      transparent 80%
    )
  `;

  // Spring-animated shine position
  const shineX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const shineY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const shineGradient = useMotionTemplate`
    linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.05) 45%,
      rgba(201, 168, 76, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 55%,
      transparent 60%
    )
  `;

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative h-full rounded-2xl overflow-hidden",
        featured && "ring-1 ring-champagne/50",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Holographic overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background }}
      />

      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: shineGradient }}
      />

      {/* Border glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none z-30",
          featured && "shadow-[0_0_40px_rgba(201,168,76,0.2)]"
        )}
      />

      {children}
    </motion.div>
  );
}

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <HolographicCard
      className={cn(
        "h-full p-8 lg:p-10 bg-gradient-to-b",
        plan.accent,
        plan.border,
        "border"
      )}
      featured={plan.featured}
    >
      {/* Featured badge */}
      {plan.featured && (
        <div className="text-label text-champagne mb-4 tracking-widest uppercase">
          Most chosen.
        </div>
      )}

      <div className="mb-2 text-label text-ivory/40">{plan.tagline}</div>
      <h3 className="font-headline text-4xl text-ivory mb-6">{plan.name}</h3>

      <div className="mb-8">
        <span className="font-headline text-5xl text-champagne">
          ${plan.price}
        </span>
        <span className="text-body-sm text-ivory/50 ml-2">/month</span>
      </div>

      <ul className="space-y-3 mb-10 flex-1">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-body-sm text-ivory/80"
          >
            <Check className="size-4 text-champagne shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.featured ? "gold" : "gold-outline"}
        className={cn(
          "w-full h-11 rounded-full text-xs",
          plan.featured && "animate-breathe-glow"
        )}
        onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
      >
        Apply for {plan.name}
      </Button>
    </HolographicCard>
  );
}

function PlanCardBack({ name }: { name: string }) {
  return (
    <div className="h-full rounded-2xl bg-gradient-to-br from-burgundy via-smoke to-obsidian border border-champagne/40 flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(201,168,76,0.3) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="relative text-center">
        <div className="font-headline text-6xl text-champagne/80 italic">
          {name}
        </div>
        <div className="mt-4 text-label text-ivory/40">Flip to reveal</div>
      </div>
    </div>
  );
}

export function ThePlans() {
  return (
    <section
      id="standing"
      className="relative py-32 lg:py-48 px-6 lg:px-12 bg-gradient-to-b from-obsidian via-smoke to-obsidian overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-champagne/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-20">
            <div className="text-label text-champagne mb-6 tracking-widest uppercase">
              <TextScramble text="Membership" delay={0.1} />
            </div>
            <h2 className="text-display-lg text-ivory mb-6">
              Choose your{" "}
              <MagneticText
                as="span"
                className="italic text-champagne"
                strength={6}
                radius={80}
                staggerDelay={0.03}
                initialDelay={0.2}
              >
                standing.
              </MagneticText>
            </h2>
            <p className="text-body-lg text-ivory/60 max-w-xl mx-auto">
              Three tiers. One is yours.
            </p>
          </div>
        </ScrollReveal>

        {/* Plans grid with card flip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, i) => (
            <CardFlip
              key={plan.name}
              delay={i * 0.2}
              className="aspect-[3/4] md:aspect-auto md:min-h-[560px]"
              front={<PlanCardBack name={plan.name} />}
              back={<PlanCard plan={plan} />}
            />
          ))}
        </div>

        {/* Trust indicators */}
        <ScrollReveal delay={0.4}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/40">
            <span className="flex items-center gap-2">
              <Check className="size-3 text-champagne" />
              Cancel anytime
            </span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span className="flex items-center gap-2">
              <Check className="size-3 text-champagne" />
              No hidden fees
            </span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span className="flex items-center gap-2">
              <Check className="size-3 text-champagne" />
              Satisfaction guaranteed
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
