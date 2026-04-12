"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { AuroraBackground } from "@/components/animations/aurora-background";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export function WaitlistCta() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const reduced = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const createBurst = (x: number, y: number) => {
    if (reduced) return;
    const colors = ["#C9A84C", "#F5ECCD", "#DFC368", "#E8C4B0", "#4A0E1A"];
    const newParticles: BurstParticle[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.5;
      const velocity = 3 + Math.random() * 5;
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setBurstParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setBurstParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 1000);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState("success");
      if (data.position) setPosition(data.position);
      const form = e.target as HTMLFormElement;
      const rect = form.getBoundingClientRect();
      createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Try again");
    }
  }

  return (
    <section
      id="waitlist"
      className="relative min-h-[100svh] w-full overflow-hidden flex items-center bg-obsidian px-6 lg:px-12 py-28"
    >
      {/* Atmospheric depth layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74,14,26,0.38), transparent),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(201,168,76,0.05), transparent)
          `,
        }}
      />

      <AuroraBackground className="absolute inset-0 pointer-events-none" />

      {/* Burst particles */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <AnimatePresence>
          {burstParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                background: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              }}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 0,
                x: particle.vx * 20,
                y: particle.vy * 20,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <LuxuryScrollTrigger>
          {/* Ornamental kicker */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-champagne/35" />
            <p className="text-kicker">Request Access</p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-champagne/35" />
          </div>

          {/* Dramatic headline */}
          <h2 className="mt-5 text-display-xl text-ivory leading-[0.9] tracking-[-0.025em] mx-auto max-w-4xl">
            Because your next relationship shouldn&apos;t start with{" "}
            <em className="text-gradient-gold not-italic font-accent">&ldquo;hey lol.&rdquo;</em>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-body-lg text-ivory/60 font-light">
            Membership is by invitation only. We review every request personally —
            if you&apos;re a good fit, you&apos;ll hear from us within 48 hours.
          </p>
        </LuxuryScrollTrigger>

        <LuxuryScrollTrigger delay={0.12}>
          <AnimatePresence mode="wait">
            {state !== "success" ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="mt-10 max-w-sm mx-auto flex flex-col gap-3"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={state === "loading"}
                  className="h-14 bg-obsidian/80 border-champagne/[0.18] text-ivory placeholder:text-ivory/22 text-base px-6 rounded-2xl focus:border-champagne/45 focus:ring-0"
                />
                <div
                  className="relative"
                  onMouseMove={(e) => {
                    if (!reduced) {
                      mouseX.set(e.clientX);
                      mouseY.set(e.clientY);
                    }
                  }}
                  onMouseLeave={() => {
                    mouseX.set(0);
                    mouseY.set(0);
                  }}
                >
                  {!reduced && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-40 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(201, 168, 76, 0.35), transparent 55%)",
                        x: springX,
                        y: springY,
                      }}
                    />
                  )}
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={state === "loading"}
                    className="relative h-14 w-full rounded-2xl text-sm animate-breathe-glow"
                  >
                    {state === "loading" ? "Sending..." : "Apply for Early Access"}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                className="flex flex-col items-center gap-5 py-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Wax seal with orbit ring */}
                <div className="relative flex items-center justify-center">
                  {/* Slow orbit dashed ring */}
                  <motion.div
                    className="absolute size-36 rounded-full border border-dashed border-champagne/[0.14]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                  />

                  <motion.div
                    className="size-28 rounded-full bg-gradient-to-br from-burgundy-400 to-burgundy flex items-center justify-center shadow-gold-glow border-2 border-champagne/35 relative z-10"
                    initial={{ scale: 2, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(201, 168, 76, 0.3)",
                          "0 0 40px rgba(201, 168, 76, 0.5)",
                          "0 0 20px rgba(201, 168, 76, 0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full"
                    />
                    <Check className="size-11 text-champagne" />
                  </motion.div>

                  {/* Sparkle decorations */}
                  <motion.div
                    className="absolute -top-2 -right-2 z-20"
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="size-5 text-champagne/55" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-1 -left-1 z-20"
                    animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  >
                    <Sparkles className="size-4 text-champagne/38" />
                  </motion.div>
                </div>

                <h3 className="mt-4 text-display-md text-ivory">We've received your request.</h3>
                <p className="text-body-md text-ivory/52 font-light max-w-[22rem] mx-auto -mt-2">
                  Someone from our team will review it personally and be
                  in touch within 48 hours.
                </p>

                <motion.p
                  className="text-label text-ivory/38"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your request is with our team.
                </motion.p>

                {position && (
                  <motion.div
                    className="mt-1 px-4 py-2 rounded-full bg-champagne/10 border border-champagne/20 text-label text-champagne"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    #{position.toLocaleString()} on the list
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              className="mt-4 text-body-sm text-burgundy-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}
        </LuxuryScrollTrigger>

        <LuxuryScrollTrigger delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/28">
            <span>No spam. Ever.</span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span>Every request reviewed by hand.</span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span>Your data is encrypted end to end.</span>
          </div>
        </LuxuryScrollTrigger>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/3 bg-gradient-to-r from-transparent via-champagne/20 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />
    </section>
  );
}
