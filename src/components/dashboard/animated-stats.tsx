"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface AnimatedStatsProps {
  mutual: number;
  chats: number;
  gifts: number;
}

function useCounter(target: number, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) frameRef.current = requestAnimationFrame(step);
      };
      frameRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

function StatCard({ label, value, delay }: { label: string; value: number; delay: number }) {
  const count = useCounter(value, 1500, delay);
  return (
    <motion.div
      className="p-6 rounded-2xl bg-smoke border border-champagne/10 cursor-default"
      whileHover={{ boxShadow: "0 0 30px rgba(201,168,76,0.12)", borderColor: "rgba(201,168,76,0.3)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-label text-ivory/40 mb-2">{label}</div>
      <div className="font-headline text-3xl text-champagne tabular-nums">{count}</div>
    </motion.div>
  );
}

export function AnimatedStats({ mutual, chats, gifts }: AnimatedStatsProps) {
  return (
    <section className="grid grid-cols-3 gap-4 lg:gap-6">
      <StatCard label="Active Matches" value={mutual} delay={0} />
      <StatCard label="Chats" value={chats} delay={100} />
      <StatCard label="Gifts Sent" value={gifts} delay={200} />
    </section>
  );
}
