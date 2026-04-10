"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { Suspense } from "react";

function WelcomeContent() {
  const params = useSearchParams();
  const isMommy = params.get("role") === "mommy";

  return (
    <div className="text-center space-y-12 py-12">
      {/* Wax seal */}
      <motion.div
        className="mx-auto"
        initial={{ scale: 2, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative size-32 mx-auto">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: isMommy
                ? "radial-gradient(circle at 35% 35%, #C9A84C 0%, #1A0A2E 60%)"
                : "radial-gradient(circle at 35% 35%, #C9A84C 0%, #4A0E1A 60%)",
              boxShadow:
                "0 0 60px rgba(201, 168, 76, 0.5), inset -10px -10px 20px rgba(0,0,0,0.4)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <span className="font-headline text-4xl text-champagne italic">
              {isMommy ? "✦" : "RM"}
            </span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        {isMommy ? (
          <>
            <div className="text-label text-champagne">You&apos;re live.</div>
            <h1 className="text-display-lg text-ivory">
              Welcome to
              <br />
              <span className="italic text-champagne">The Guild.</span>
            </h1>
            <p className="text-accent-quote text-ivory/60 max-w-sm mx-auto">
              The finest members await. Make your presence known.
            </p>
          </>
        ) : (
          <>
            <div className="text-label text-champagne">You&apos;re in.</div>
            <h1 className="text-display-lg text-ivory">
              Welcome to
              <br />
              <span className="italic text-champagne">The Guild.</span>
            </h1>
            <p className="text-accent-quote text-ivory/60 max-w-sm mx-auto">
              Not everyone makes it here.
            </p>
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.4 }}
      >
        <Link href={isMommy ? "/mommy-dashboard" : "/dashboard"}>
          <GoldCtaButton>Enter</GoldCtaButton>
        </Link>
      </motion.div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <WelcomeContent />
    </Suspense>
  );
}
