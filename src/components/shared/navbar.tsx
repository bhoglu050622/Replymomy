"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useState, useEffect } from "react";
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { scrollYProgress, scrollY } = useScroll();

  // Track active section based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      }
    );

    // Observe all sections that have corresponding nav links
    NAV_LINKS.forEach((link) => {
      const sectionId = link.href.replace("#", "");
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Close if clicking outside the mobile menu and not on the menu button
      if (!target.closest(".mobile-menu") && !target.closest(".menu-button")) {
        setOpen(false);
      }
    }

    // Close on escape key
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);
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
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative text-label transition-colors duration-300 hover:text-champagne",
                    isActive ? "text-champagne" : "text-ivory/72"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-2 left-0 h-px w-full origin-left bg-champagne transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                  {isActive && (
                    <span className="absolute -right-2 top-0 size-1 rounded-full bg-champagne" />
                  )}
                </a>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Link href="/apply">
              <GoldCtaButton className="h-10 px-6 text-xs">
                Request Invitation
              </GoldCtaButton>
            </Link>
          </div>

          <button
            className="menu-button md:hidden text-ivory hover:text-champagne transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </motion.nav>

      <motion.div
        className={cn(
          "mobile-menu fixed inset-0 z-40 bg-obsidian/98 backdrop-blur-2xl flex flex-col items-center justify-center md:hidden",
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
          {NAV_LINKS.map((link, i) => {
            const isActive = activeSection === link.href;
            return (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-display-md transition-colors relative",
                  isActive ? "text-champagne" : "text-ivory hover:text-champagne"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  duration: 0.4,
                  delay: open ? i * 0.1 : 0,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-champagne" />
                )}
              </motion.a>
            );
          })}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.4,
              delay: open ? 0.4 : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link href="/apply" onClick={() => setOpen(false)}>
              <GoldCtaButton>
                Request Invitation
              </GoldCtaButton>
            </Link>
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
