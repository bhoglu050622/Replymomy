import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/shared/logo";
import { TextScramble } from "@/components/animations/text-scramble";

const FOOTER_LINKS = {
  Guild: [
    { label: "The Icons", href: "#icons" },
    { label: "Access", href: "#access" },
    { label: "Standing", href: "#standing" },
  ],
  Legal: [
    { label: "Terms of Entry", href: "/terms" },
    { label: "Privacy Pact", href: "/privacy" },
    { label: "Discretion Bond", href: "/discretion" },
  ],
  Connect: [
    { label: "Instagram", href: "https://instagram.com/replymommy" },
    { label: "X / Twitter", href: "https://x.com/ReplyMommy" },
    { label: "Press Inquiries", href: "/press" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-champagne/10 bg-obsidian overflow-hidden">
      {/* Background ambient effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-t from-champagne/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-20 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          {/* Logo and tagline column */}
          <div className="col-span-2">
            <Logo />
            <p className="mt-6 text-accent-quote text-ivory/50 max-w-sm">
              Quiet. Intentional. Invitation only.
            </p>
            <motion.div
              className="mt-6 text-label text-champagne/60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <TextScramble text="The 0.1% guild" delay={0.5} />
            </motion.div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
            >
              <div className="text-label text-champagne mb-6 tracking-widest uppercase">
                {category}
              </div>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: categoryIndex * 0.1 + linkIndex * 0.05,
                      duration: 0.3,
                    }}
                  >
                    <Link
                      href={link.href}
                      className="text-body-sm text-ivory/60 hover:text-champagne transition-colors duration-300 inline-block"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          className="pt-8 border-t border-champagne/10 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-label text-ivory/30">
            © {new Date().getFullYear()} The Midnight Guild · Access is earned.
          </p>
          <p className="text-label text-ivory/30 italic font-accent">
            Made with discretion.
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/20 text-[10px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span>256-bit encryption</span>
          <span className="size-0.5 rounded-full bg-champagne/20" />
          <span>GDPR compliant</span>
          <span className="size-0.5 rounded-full bg-champagne/20" />
          <span>SOC 2 Type II</span>
          <span className="size-0.5 rounded-full bg-champagne/20" />
          <span>Verified by Stripe</span>
        </motion.div>
      </div>
    </footer>
  );
}
