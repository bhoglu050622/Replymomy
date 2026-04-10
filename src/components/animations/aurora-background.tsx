"use client";

import { useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  compositeOp: GlobalCompositeOperation;
}

interface AuroraBackgroundProps {
  className?: string;
  orbCount?: number;
  speed?: number;
  children?: React.ReactNode;
}

const ORB_PALETTE: { color: string; compositeOp: GlobalCompositeOperation }[] = [
  { color: "rgba(74,14,26,0.35)", compositeOp: "multiply" },
  { color: "rgba(201,168,76,0.12)", compositeOp: "screen" },
  { color: "rgba(74,14,26,0.25)", compositeOp: "multiply" },
  { color: "rgba(201,168,76,0.08)", compositeOp: "screen" },
  { color: "rgba(26,26,26,0.9)", compositeOp: "multiply" },
];

export function AuroraBackground({
  className,
  orbCount = 5,
  speed = 0.3,
  children,
}: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  const initOrbs = useCallback(
    (w: number, h: number): Orb[] => {
      return Array.from({ length: orbCount }, (_, i) => {
        const p = ORB_PALETTE[i % ORB_PALETTE.length];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius: Math.max(w, h) * (0.3 + Math.random() * 0.35),
          color: p.color,
          compositeOp: p.compositeOp,
        };
      });
    },
    [orbCount, speed]
  );

  const drawFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      orbs: Orb[],
      animate: boolean
    ) => {
      ctx.clearRect(0, 0, w, h);

      // Base fill
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, w, h);

      for (const orb of orbs) {
        if (animate) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          // Soft bounce
          if (orb.x < -orb.radius || orb.x > w + orb.radius) {
            orb.vx *= -0.95;
            orb.x = Math.max(-orb.radius, Math.min(w + orb.radius, orb.x));
          }
          if (orb.y < -orb.radius || orb.y > h + orb.radius) {
            orb.vy *= -0.95;
            orb.y = Math.max(-orb.radius, Math.min(h + orb.radius, orb.y));
          }
        }

        const g = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        g.addColorStop(0, orb.color);
        g.addColorStop(1, "rgba(0,0,0,0)");

        ctx.save();
        ctx.globalCompositeOperation = orb.compositeOp;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.offsetWidth || 800;
    const h = canvas.offsetHeight || 600;
    canvas.width = w;
    canvas.height = h;

    const orbs = initOrbs(w, h);

    if (reduced) {
      drawFrame(ctx, w, h, orbs, false);
      return;
    }

    let animId = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let running = true;

    function tick() {
      if (!running) return;
      drawFrame(ctx!, w, h, orbs, true);
      animId = requestAnimationFrame(() => {
        timerId = setTimeout(tick, 33); // ~30fps
      });
    }

    tick();

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      if (timerId) clearTimeout(timerId);
    };
  }, [reduced, initOrbs, drawFrame]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}
