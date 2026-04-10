"use client";

import { useState, useRef, type FormEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { TextScramble } from "@/components/animations/text-scramble";
import { MagneticText } from "@/components/animations/magnetic-text";
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
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [position, setPosition] = useState<number | null>(null);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  // Mouse tracking for button glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current || reduced) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

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

    // Clean up particles after animation
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

      // Create burst effect from center of form
      const form = e.target as HTMLFormElement;
      const rect = form.getBoundingClientRect();
      createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Try again");
    }
  }

  return (
    <section id="waitlist" className="relative py-32 lg:py-48 px-6 lg:px-12 bg-obsidian overflow-hidden">
      {/* Ambient background — canvas aurora */}
      <AuroraBackground className="absolute inset-0 pointer-events-none" />

      {/* Burst particles overlay */}
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
        <ScrollReveal>
          <div className="text-label text-champagne mb-6 tracking-widest uppercase">
            <TextScramble text="The List" delay={0.1} />
          </div>
          <h2 className="text-display-xl text-ivory mb-8">
            Your circle is{" "}
            <MagneticText
              as="span"
              className="italic text-champagne"
              strength={8}
              radius={100}
              staggerDelay={0.04}
              initialDelay={0.2}
            >
              waiting.
            </MagneticText>
          </h2>
          <p className="text-accent-quote text-ivory/60 mb-12 max-w-xl mx-auto">
            No noise. Just recognition when you&apos;ve been seen.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <AnimatePresence mode="wait">
            {state !== "success" ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={state === "loading"}
                  className="h-14 flex-1 bg-smoke border-champagne/30 text-ivory placeholder:text-ivory/30 focus:ring-champagne focus:border-champagne text-base px-6 rounded-full"
                />
                <div
                  className="relative"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => {
                    mouseX.set(0);
                    mouseY.set(0);
                  }}
                >
                  {/* Button glow effect */}
                  {!reduced && (
                    <motion.div
                      className="absolute inset-0 rounded-full blur-xl opacity-50"
                      style={{
                        background:
                          "radial-gradient(circle at var(--x) var(--y), rgba(201, 168, 76, 0.4), transparent 50%)",
                        x: springX,
                        y: springY,
                      }}
                    />
                  )}
                  <Button
                    ref={buttonRef}
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={state === "loading"}
                    className="relative h-14 px-10 rounded-full text-xs animate-breathe-glow"
                  >
                    {state === "loading" ? "Sending..." : "Request Access"}
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                className="flex flex-col items-center gap-6 py-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Wax seal with enhanced animation */}
                <motion.div
                  className="relative"
                  initial={{ scale: 2, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <motion.div
                    className="size-24 rounded-full bg-gradient-to-br from-burgundy-400 to-burgundy flex items-center justify-center shadow-gold-glow border-2 border-champagne/40"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(201, 168, 76, 0.3)",
                        "0 0 40px rgba(201, 168, 76, 0.5)",
                        "0 0 20px rgba(201, 168, 76, 0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Check className="size-10 text-champagne" />
                  </motion.div>
                  {/* Sparkle decorations */}
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="size-5 text-champagne/60" />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-1 -left-1"
                    animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  >
                    <Sparkles className="size-4 text-champagne/40" />
                  </motion.div>
                </motion.div>

                <div>
                  <div className="font-headline text-3xl text-ivory mb-2">Noted.</div>
                  <div className="text-body-md text-ivory/60">
                    We&apos;ll be in touch.
                  </div>
                </div>

                {/* Additional confirmation text */}
                <motion.p
                  className="text-label text-ivory/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your request has been sealed.
                </motion.p>

                {position && (
                  <motion.div
                    className="mt-2 px-4 py-2 rounded-full bg-champagne/10 border border-champagne/20 text-label text-champagne"
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
        </ScrollReveal>

        {/* Trust indicators */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/30">
            <span>No spam, ever.</span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span>Invitation-only access.</span>
            <span className="size-1 rounded-full bg-champagne/40" />
            <span>Encrypted transmission.</span>
          </div>
        </ScrollReveal>
      </div>

      {/* Bottom decorative element */}
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
