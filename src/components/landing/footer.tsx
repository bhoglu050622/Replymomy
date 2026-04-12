import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/shared/logo";

const FOOTER_LINKS = {
  Experience: [
    { label: "Salon", href: "#salon" },
    { label: "Protocol", href: "#protocol" },
    { label: "Membership", href: "#membership" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Discretion", href: "/discretion" },
  ],
  Connect: [
    { label: "Instagram", href: "https://instagram.com/replymommy" },
    { label: "X", href: "https://x.com/ReplyMommy" },
    { label: "Press", href: "/press" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-obsidian-soft">
      {/* Decorative top ornament — replaces hard border */}
      <div className="absolute top-0 left-0 right-0 flex items-center pointer-events-none">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-champagne/20 to-champagne/[0.08]" />
        <div className="px-8 flex items-center gap-3">
          <div className="h-px w-7 bg-champagne/[0.18]" />
          <span className="text-champagne/35 text-[9px] tracking-[0.5em]">✦</span>
          <div className="h-px w-7 bg-champagne/[0.18]" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-champagne/20 to-champagne/[0.08]" />
      </div>

      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(232,194,123,0.1),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(74,14,26,0.22),transparent_38%)]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-20 relative">
        {/* Main grid */}
        <div className="grid grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr] gap-12 mb-16">
          {/* Logo column */}
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-[22rem] font-accent italic text-ivory/46 leading-relaxed text-[0.95rem]">
              Because your next relationship shouldn&apos;t start with &ldquo;hey lol.&rdquo;
            </p>
            <p className="mt-4 max-w-[22rem] text-body-sm text-ivory/32 leading-relaxed">
              Built by founders who grew frustrated with what modern dating had become.
            </p>
            <motion.div
              className="mt-5 text-label text-champagne/55"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              By invitation only
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
                      className="text-body-sm text-ivory/58 hover:text-champagne transition-colors duration-300 inline-block"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
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
          className="pt-8 border-t border-champagne/[0.08] flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-label text-ivory/28">
            © {new Date().getFullYear()} ReplyMommy. Designed for people who know what they want.
          </p>
          <p className="text-label text-ivory/28 italic font-accent">
            Real people. Real conversations. Real connections.
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-label text-ivory/18 text-[10px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span>256-bit encryption</span>
          <span className="size-0.5 rounded-full bg-champagne/20" />
          <span>GDPR ready</span>
          <span className="size-0.5 rounded-full bg-champagne/20" />
          <span>By invitation only</span>
          <span className="size-0.5 rounded-full bg-champagne/20" />
          <span>Confidential by design</span>
        </motion.div>
      </div>
    </footer>
  );
}
