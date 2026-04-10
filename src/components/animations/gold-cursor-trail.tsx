"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  blur: number;
  life: number;
  decay: number;
}

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
}

const TRAIL_LENGTH = 15;
const MAX_BURST_PARTICLES = 30;

export function GoldCursorTrail() {
  const reduced = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const lastSpawnTime = useRef(0);
  const particleId = useRef(0);
  const burstId = useRef(0);
  const animationFrame = useRef<number | undefined>(undefined);

  // Detect touch device
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouchDevice(navigator.maxTouchPoints > 0);
  }, []);

  // Initialize trail particles
  useEffect(() => {
    if (reduced || isTouchDevice) return;

    const initialParticles = Array.from({ length: TRAIL_LENGTH }, (_, i) => ({
      id: i,
      x: -100,
      y: -100,
      size: 10 - i * 0.6,
      opacity: (1 - i / TRAIL_LENGTH) * 0.5,
      blur: i * 0.3,
      life: 1,
      decay: 0.02 + i * 0.005,
    }));

    setParticles(initialParticles);
  }, [reduced, isTouchDevice]);

  // Mouse move handler
  useEffect(() => {
    if (reduced || isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduced, isTouchDevice]);

  // Click burst handler
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (reduced || isTouchDevice) return;

      const newBursts: BurstParticle[] = [];
      const colors = ["#C9A84C", "#F5ECCD", "#DFC368", "#E8C4B0"];

      for (let i = 0; i < MAX_BURST_PARTICLES; i++) {
        const angle = (Math.PI * 2 * i) / MAX_BURST_PARTICLES + Math.random() * 0.5;
        const velocity = 2 + Math.random() * 4;

        newBursts.push({
          id: burstId.current++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: 2 + Math.random() * 4,
          opacity: 0.8 + Math.random() * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
        });
      }

      setBurstParticles((prev) => [...prev, ...newBursts]);
    },
    [reduced, isTouchDevice]
  );

  useEffect(() => {
    if (reduced || isTouchDevice) return;

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick, reduced, isTouchDevice]);

  // Animation loop
  useEffect(() => {
    if (reduced || isTouchDevice || particles.length === 0) return;

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Throttle particle spawning
      if (currentTime - lastSpawnTime.current > 16) {
        lastSpawnTime.current = currentTime;

        setParticles((prev) => {
          const next = [...prev];
          // Move each particle toward the previous one
          for (let i = next.length - 1; i >= 0; i--) {
            if (i === 0) {
              // Lead particle follows mouse
              const dx = mousePos.current.x - next[i].x;
              const dy = mousePos.current.y - next[i].y;
              next[i].x += dx * 0.4;
              next[i].y += dy * 0.4;
            } else {
              // Follower particles follow the one ahead
              const dx = next[i - 1].x - next[i].x;
              const dy = next[i - 1].y - next[i].y;
              next[i].x += dx * 0.35;
              next[i].y += dy * 0.35;
            }
          }
          return next;
        });
      }

      // Update burst particles
      setBurstParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.95, // friction
            vy: p.vy * 0.95,
            life: p.life - 0.015,
            opacity: p.life * 0.8,
          }))
          .filter((p) => p.life > 0)
      );

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [reduced, isTouchDevice, particles.length]);

  if (reduced || isTouchDevice) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Trail particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background:
              i === 0
                ? "radial-gradient(circle, rgba(201, 168, 76, 0.9) 0%, rgba(201, 168, 76, 0.4) 100%)"
                : "radial-gradient(circle, rgba(201, 168, 76, 0.6) 0%, transparent 70%)",
            opacity: particle.opacity,
            transform: "translate(-50%, -50%)",
            filter: `blur(${particle.blur}px)`,
            boxShadow:
              i < 3
                ? `0 0 ${10 - i * 2}px rgba(201, 168, 76, 0.5)`
                : "none",
          }}
          initial={false}
          animate={{
            scale: i === 0 ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Burst particles */}
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
            initial={{ opacity: particle.opacity, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: particle.life * 0.5 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
