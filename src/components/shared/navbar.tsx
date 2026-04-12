"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { GoldCtaButton } from "./gold-cta-button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#salon", label: "Community" },
  { href: "#why", label: "Safety" },
  { href: "#experience", label: "How It Works" },
  { href: "#membership", label: "Membership" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress, scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.85]);
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 20]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.3]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 z-[60] bg-gradient-to-r from-champagne via-champagne-300 to-champagne"
        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
      />

      <motion.nav
        className="fixed top-0.5 left-0 right-0 z-50"
        style={{
          backgroundColor: useTransform(
            bgOpacity,
            (v) => `rgba(10, 10, 10, ${v})`
          ),
          backdropFilter: useTransform(
            backdropBlur,
            (v) => `blur(${v}px) saturate(180%)`
          ),
          borderBottom: "1px solid",
          borderColor: useTransform(
            borderOpacity,
            (v) => `rgba(201, 168, 76, ${v})`
          ),
        }}
      >
        <div className="container mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-label text-ivory/72 transition-colors duration-300 hover:text-champagne"
              >
                {link.label}
                <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-champagne transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <GoldCtaButton
              className="h-10 px-6 text-xs"
              onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
            >
              Request Invitation
            </GoldCtaButton>
          </div>

          <button
            className="md:hidden text-ivory hover:text-champagne transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </motion.nav>

      <motion.div
        className={cn(
          "fixed inset-0 z-40 bg-obsidian/98 backdrop-blur-2xl flex flex-col items-center justify-center md:hidden",
          !open && "pointer-events-none"
        )}
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-champagne/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-burgundy/10 rounded-full blur-3xl" />
        </div>

        <div className="flex flex-col items-center gap-8 relative z-10">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-display-md text-ivory hover:text-champagne transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.4,
                delay: open ? i * 0.1 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {link.label}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.4,
              delay: open ? 0.4 : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <GoldCtaButton
              onClick={() => {
                setOpen(false);
                document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Request Invitation
            </GoldCtaButton>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-champagne/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={open ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </motion.div>
    </>
  );
}
