"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Crown, Shield, Sparkles, ArrowRight } from "lucide-react";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";

const PERKS = [
  {
    icon: Crown,
    title: "Curated introductions",
    desc: "Every match is handpicked by our concierge team — no algorithms, no endless swiping. Just quality introductions that respect your time.",
  },
  {
    icon: Shield,
    title: "Verified women only",
    desc: "Every Mommy on the platform has been personally reviewed, identity-verified, and approved before joining. Your time is protected.",
  },
  {
    icon: Sparkles,
    title: "Absolute discretion",
    desc: "Your profile is never public. Connections are made privately, and your information is never shared without your explicit consent.",
  },
];

export function BecomeAMember() {
  return (
    <section
      id="become-a-member"
      className="luxury-section overflow-hidden bg-obsidian-soft"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(74, 14, 26, 0.25) 0%, transparent 60%), radial-gradient(ellipse at 30% 50%, rgba(232, 194, 123, 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Decorative section numeral */}
      <div
        aria-hidden="true"
        className="section-numeral absolute -right-8 top-16 pointer-events-none hidden sm:block"
      >
        05
      </div>

      <div className="relative z-10 container mx-auto">
        <LuxuryScrollTrigger>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-champagne/35" />
              <span className="text-champagne/40 text-[11px]">✦</span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-champagne/35" />
            </div>
            <p className="text-kicker mb-4">For Our Members</p>
            <h2 className="text-display-lg text-ivory mb-4">
              Request your{" "}
              <em className="text-gradient-gold not-italic font-accent">invitation</em>
            </h2>
            <p className="text-body-lg text-ivory/58 font-light max-w-2xl mx-auto">
              We&apos;re accepting a founding cohort of discerning men who value
              substance over noise — curated introductions, absolute privacy, and
              connections worth keeping.
            </p>
          </div>
        </LuxuryScrollTrigger>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — perks */}
          <div className="space-y-8">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                className="luxury-glass rounded-2xl p-4 flex gap-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="size-12 rounded-2xl bg-gradient-to-br from-champagne/20 to-burgundy/20 border border-champagne/20 flex items-center justify-center flex-shrink-0">
                  <perk.icon className="size-5 text-champagne" />
                </div>
                <div>
                  <h3 className="text-body-lg text-ivory font-medium mb-1">
                    {perk.title}
                  </h3>
                  <p className="text-body-md text-ivory/53">{perk.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Pull-quote card */}
            <motion.div
              className="mt-2 luxury-glass-deep rounded-2xl p-7 relative overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 }}
            >
              <span
                aria-hidden="true"
                className="absolute -top-2 left-5 font-headline text-[5rem] leading-none text-champagne/[0.07] select-none pointer-events-none"
              >
                &ldquo;
              </span>
              <p
                className="font-accent italic text-ivory/80 leading-[1.45] relative z-10"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)" }}
              >
                The quality of introductions is unlike anything I&apos;ve experienced.
                Every meeting has been with someone genuinely remarkable.
              </p>
              <cite className="text-label text-champagne/56 mt-4 block not-italic">
                — A founding member, London
              </cite>
              <div className="mt-5 h-px bg-gradient-to-r from-champagne/18 to-transparent" />
            </motion.div>
          </div>

          {/* Right — CTA */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="luxury-glass-deep p-8 rounded-3xl relative overflow-hidden"
              style={{
                boxShadow: "0 0 0 1px rgba(232,194,123,0.11), 0 24px 64px rgba(0,0,0,0.42)",
              }}
            >
              {/* Corner ornament */}
              <div
                className="absolute top-0 right-0 overflow-hidden rounded-tr-3xl pointer-events-none"
                style={{ width: 88, height: 88 }}
              >
                <div className="absolute top-0 right-0 w-px h-14 bg-gradient-to-b from-champagne/28 to-transparent" />
                <div className="absolute top-0 right-0 h-px w-14 bg-gradient-to-l from-champagne/28 to-transparent" />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-label text-champagne mb-2">Founding Members</div>
                  <h3 className="text-display-md text-ivory leading-tight">
                    Join the founding{" "}
                    <span className="italic text-champagne">circle.</span>
                  </h3>
                  <p className="text-body-sm text-ivory/50 mt-3 leading-relaxed">
                    A 5-minute application. We review every request personally
                    and respond within 48 hours.
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {["Free to apply", "No invitation code needed", "Reviewed by humans, not bots"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-body-sm text-ivory/60">
                      <span className="size-1.5 rounded-full bg-champagne shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link href="/apply?role=member" className="block">
                  <GoldCtaButton className="w-full">
                    Start your application <ArrowRight className="size-4 ml-1" />
                  </GoldCtaButton>
                </Link>

                <p className="text-center text-[11px] text-ivory/25">
                  By applying you agree to our community standards.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
