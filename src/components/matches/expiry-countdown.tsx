"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TWO_HOURS = 2 * 60 * 60 * 1000;
const SIX_HOURS = 6 * 60 * 60 * 1000;

export function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [diffMs, setDiffMs] = useState(Infinity);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function compute() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      setDiffMs(diff);
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      if (diff < 60_000) {
        setTimeLeft(`${s}s`);
      } else {
        setTimeLeft(`${h}h ${m}m`);
      }
    }

    compute();

    // Adaptive interval: tick every second when < 1 minute, otherwise every minute
    const tick = diffMs < 60_000 ? 1_000 : 60_000;
    intervalRef.current = setInterval(() => {
      compute();
    }, tick);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, diffMs < 60_000]);

  const isExpired = diffMs <= 0;
  const isUrgent = diffMs > 0 && diffMs < TWO_HOURS;
  const isWarning = diffMs > 0 && diffMs < SIX_HOURS;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-label transition-colors",
        isExpired && "text-ivory/20",
        isWarning && !isUrgent && "text-rose",
        isUrgent && "text-red-400",
        !isExpired && !isWarning && "text-ivory/40"
      )}
    >
      <Clock
        className={cn("size-4", isUrgent && "animate-glow-pulse")}
      />
      <span>
        {isExpired ? "Expired" : `Expires in ${timeLeft}`}
      </span>
    </div>
  );
}
