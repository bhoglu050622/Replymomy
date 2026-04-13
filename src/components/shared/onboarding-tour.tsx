"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { GoldCtaButton } from "./gold-cta-button";

const TOUR_KEY = "rm_tour_v1";

interface Slide {
  icon: string;
  title: string;
  body: string;
}

const MEMBER_SLIDES: Slide[] = [
  {
    icon: "✦",
    title: "Your Daily Curations",
    body: "Each morning we handpick matches just for you. No swiping. No algorithms. Just people worth meeting.",
  },
  {
    icon: "🎁",
    title: "Tokens & Gifts",
    body: "Send an icebreaker, unlock a gallery, or gift something real. Tokens power every connection.",
  },
  {
    icon: "👑",
    title: "Upgrade Anytime",
    body: "Pro unlocks more daily matches and token credits. Upgrade in Settings whenever you're ready.",
  },
  {
    icon: "🔒",
    title: "Discretion First",
    body: "Your profile is never publicly indexed. Everything here stays within The Guild.",
  },
];

const MOMMY_SLIDES: Slide[] = [
  {
    icon: "✦",
    title: "Your Presence",
    body: "Members discover you through our daily curation. Your profile is your introduction — make it count.",
  },
  {
    icon: "💎",
    title: "Earn with Ease",
    body: "Gifts, gallery unlocks, and spotlight requests all pay directly to your account.",
  },
  {
    icon: "📅",
    title: "Set Your Terms",
    body: "Use your calendar to manage availability. You choose who to accept and when.",
  },
  {
    icon: "🏅",
    title: "Build Your Reputation",
    body: "Badges grow with your standing. The guild notices excellence.",
  },
];

export function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const role = useUserStore((s) => s.role);

  useEffect(() => {
    if (!role) return;
    if (typeof window !== "undefined" && localStorage.getItem(TOUR_KEY)) return;
    // Small delay so the dashboard renders first
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, [role]);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1");
    setShow(false);
  }

  function next() {
    if (slide < slides.length - 1) {
      setDirection(1);
      setSlide((s) => s + 1);
    } else {
      dismiss();
    }
  }

  function prev() {
    if (slide > 0) {
      setDirection(-1);
      setSlide((s) => s - 1);
    }
  }

  const slides = role === "mommy" ? MOMMY_SLIDES : MEMBER_SLIDES;
  const current = slides[slide];
  const isLast = slide === slides.length - 1;

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="tour-backdrop"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            key="tour-card"
            className="relative w-full max-w-sm rounded-3xl bg-smoke border border-champagne/20 p-8 overflow-hidden"
            style={{ boxShadow: "0 0 0 1px rgba(201,168,76,0.08), 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(201,168,76,0.06)" }}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full text-ivory/30 hover:text-ivory/70 hover:bg-champagne/10 transition-all"
              aria-label="Close tour"
            >
              <X className="size-4" />
            </button>

            {/* Step label */}
            <div className="text-label text-champagne/50 mb-6">
              {slide + 1} of {slides.length}
            </div>

            {/* Slide content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d * 40, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -40, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-4 min-h-[140px]"
              >
                <div className="text-5xl">{current.icon}</div>
                <h2 className="font-headline text-2xl text-ivory">{current.title}</h2>
                <p className="text-body-sm text-ivory/55 leading-relaxed">{current.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-8 mb-6">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > slide ? 1 : -1); setSlide(i); }}
                  className={`rounded-full transition-all ${
                    i === slide
                      ? "w-5 h-1.5 bg-champagne"
                      : "size-1.5 bg-champagne/20 hover:bg-champagne/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              {slide > 0 ? (
                <button
                  onClick={prev}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-champagne/20 text-ivory/50 text-body-sm hover:text-ivory hover:border-champagne/40 transition-all"
                >
                  <ChevronLeft className="size-3.5" />
                  Back
                </button>
              ) : (
                <div className="flex-1" />
              )}
              <GoldCtaButton
                onClick={next}
                className={slide > 0 ? "flex-1" : "w-full"}
              >
                {isLast ? (
                  "Let's go"
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    Next <ChevronRight className="size-3.5" />
                  </span>
                )}
              </GoldCtaButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
