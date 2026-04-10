"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProfilePlaceholderProps {
  seed?: string;
  className?: string;
  width: number;
  height: number;
}

function hashSeed(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    n = ((n << 5) - n + s.charCodeAt(i)) | 0;
  }
  return Math.abs(n) % 1000;
}

export function ProfilePlaceholder({
  seed = "default",
  className,
  width,
  height,
}: ProfilePlaceholderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const n = hashSeed(seed);

    // Background: dark radial gradient (burgundy → obsidian)
    const bg = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.55, Math.max(w, h) * 0.8);
    bg.addColorStop(0, "rgba(74,14,26,0.85)");
    bg.addColorStop(0.45, "rgba(26,26,26,1)");
    bg.addColorStop(1, "rgba(10,10,10,1)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Head glow — blurred champagne orb
    const headX = w / 2 + ((n % 20) - 10) * 0.5;
    const headY = h * 0.3;
    ctx.save();
    ctx.filter = "blur(28px)";
    const headG = ctx.createRadialGradient(headX, headY, 0, headX, headY, w * 0.28);
    headG.addColorStop(0, "rgba(201,168,76,0.18)");
    headG.addColorStop(0.6, "rgba(201,168,76,0.06)");
    headG.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = headG;
    ctx.beginPath();
    ctx.arc(headX, headY, w * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Shoulders — two larger blobs
    ctx.save();
    ctx.filter = "blur(38px)";
    const shoulderY = h * 0.68;
    const offsets = [-0.27, 0.27];
    for (const offset of offsets) {
      const sx = w * (0.5 + offset) + ((n % 12) - 6) * 0.4;
      const sg = ctx.createRadialGradient(sx, shoulderY, 0, sx, shoulderY, w * 0.32);
      sg.addColorStop(0, "rgba(201,168,76,0.10)");
      sg.addColorStop(0.5, "rgba(201,168,76,0.04)");
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(sx, shoulderY, w * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Concentric rings overlay
    ctx.save();
    const rings = [0.18, 0.32, 0.46];
    for (const r of rings) {
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, w * r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(201,168,76,0.07)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Subtle bottom vignette
    const vignette = ctx.createLinearGradient(0, h * 0.6, 0, h);
    vignette.addColorStop(0, "rgba(10,10,10,0)");
    vignette.addColorStop(1, "rgba(10,10,10,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
  }, [seed]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      aria-hidden="true"
    />
  );
}
