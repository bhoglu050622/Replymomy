"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCountry } from "@/hooks/use-country";
import { FOOTFALL_BY_REGION, type FootfallEntry } from "@/lib/footfall-data";

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemberFootfall() {
  const country = useCountry();
  const [current, setCurrent] = useState<FootfallEntry | null>(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);
  const listRef = useRef<FootfallEntry[]>([]);

  useEffect(() => {
    const pool = FOOTFALL_BY_REGION[country] ?? FOOTFALL_BY_REGION.DEFAULT;
    listRef.current = shuffle(pool, Date.now() % 1000);
    indexRef.current = 0;

    function showNext() {
      const list = listRef.current;
      if (!list.length) return;
      setCurrent(list[indexRef.current % list.length]);
      indexRef.current += 1;
      setVisible(true);

      // Auto-hide after 4.5s
      const hideTimer = setTimeout(() => setVisible(false), 4500);
      // Next cycle: 9–13s
      const nextDelay = 9000 + Math.random() * 4000;
      const cycleTimer = setTimeout(showNext, nextDelay);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(cycleTimer);
      };
    }

    // Initial delay: 5–8s
    const initialDelay = setTimeout(showNext, 5000 + Math.random() * 3000);
    return () => clearTimeout(initialDelay);
  }, [country]);

  if (!current) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-40 hidden md:block pointer-events-none"
      aria-hidden="true"
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-obsidian/90 border border-champagne/20 backdrop-blur-md shadow-gold-glow"
            style={{ maxWidth: 260 }}
          >
            {/* Pulsing dot */}
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-champagne opacity-60 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-champagne" />
            </span>
            <div>
              <p className="text-label text-ivory/80 leading-tight">
                <span className="text-champagne font-medium">{current.name}</span>
                {", "}
                {current.age} · {current.city}
              </p>
              <p className="text-[10px] text-ivory/40 mt-0.5 tracking-wide uppercase">
                just joined
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
