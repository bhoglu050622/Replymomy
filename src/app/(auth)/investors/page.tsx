"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";

const INVESTMENT_TYPES = [
  { value: "angel", label: "Angel Investor" },
  { value: "vc", label: "Venture Capital" },
  { value: "strategic", label: "Strategic Partner" },
  { value: "friends_family", label: "Friends & Family" },
  { value: "other", label: "Other" },
];

const INVESTMENT_RANGES = [
  { value: "under_50l", label: "Under ₹50L" },
  { value: "50l_250l", label: "₹50L – ₹2.5Cr" },
  { value: "250l_1cr", label: "₹2.5Cr – ₹10Cr" },
  { value: "1cr_plus", label: "₹10Cr+" },
];

export default function InvestorsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    investment_type: "",
    investment_range: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.investment_type || !form.investment_range) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/investor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-champagne/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-burgundy/[0.06] rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 h-20">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/apply"
          className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors tracking-wide"
        >
          Request Invitation
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-champagne/20 blur-xl scale-150" />
                    <div className="relative size-16 rounded-full bg-champagne/10 border border-champagne/30 flex items-center justify-center">
                      <Check className="size-7 text-champagne" />
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-serif text-ivory mb-4">
                  Thank you for your interest.
                </h1>
                <p className="text-ivory/50 text-sm leading-relaxed max-w-sm mx-auto mb-2">
                  We review every submission personally. You&apos;ll hear from us within 48 hours.
                </p>
                <div className="mt-10 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-champagne/40 to-transparent" />
                <p className="mt-6 text-xs text-ivory/25 tracking-widest uppercase">
                  ReplyMommy · Exclusive by design
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="size-8 rounded-full bg-champagne/10 border border-champagne/20 flex items-center justify-center">
                      <TrendingUp className="size-3.5 text-champagne" />
                    </div>
                    <span className="text-xs text-champagne/70 tracking-widest uppercase font-medium">
                      Investor Interest
                    </span>
                  </div>
                  <h1 className="text-4xl font-serif text-ivory mb-3">
                    Invest in curated connection.
                  </h1>
                  <p className="text-ivory/45 text-sm leading-relaxed">
                    ReplyMommy is building India&apos;s most exclusive matching platform.
                    Share your details and we&apos;ll reach out personally.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-ivory/40 tracking-wide">
                        Full Name <span className="text-champagne">*</span>
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Your name"
                        className="bg-ivory/[0.03] border-ivory/[0.08] text-ivory placeholder:text-ivory/20 focus:border-champagne/40 h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-ivory/40 tracking-wide">
                        Email <span className="text-champagne">*</span>
                      </label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="you@fund.com"
                        className="bg-ivory/[0.03] border-ivory/[0.08] text-ivory placeholder:text-ivory/20 focus:border-champagne/40 h-11"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-ivory/40 tracking-wide">
                      Company / Fund{" "}
                      <span className="text-ivory/25">(optional)</span>
                    </label>
                    <Input
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                      placeholder="e.g. Sequoia Capital"
                      className="bg-ivory/[0.03] border-ivory/[0.08] text-ivory placeholder:text-ivory/20 focus:border-champagne/40 h-11"
                    />
                  </div>

                  {/* Investment Type */}
                  <div className="space-y-2.5">
                    <label className="text-xs text-ivory/40 tracking-wide">
                      Investment Type <span className="text-champagne">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INVESTMENT_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set("investment_type", t.value)}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs font-medium border transition-all",
                            form.investment_type === t.value
                              ? "bg-champagne/15 border-champagne/50 text-champagne"
                              : "bg-ivory/[0.03] border-ivory/[0.08] text-ivory/50 hover:text-ivory hover:border-ivory/20"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Investment Range */}
                  <div className="space-y-2.5">
                    <label className="text-xs text-ivory/40 tracking-wide">
                      Investment Range <span className="text-champagne">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INVESTMENT_RANGES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => set("investment_range", r.value)}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs font-medium border transition-all",
                            form.investment_range === r.value
                              ? "bg-champagne/15 border-champagne/50 text-champagne"
                              : "bg-ivory/[0.03] border-ivory/[0.08] text-ivory/50 hover:text-ivory hover:border-ivory/20"
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-ivory/40 tracking-wide">
                      What excites you about ReplyMommy?{" "}
                      <span className="text-ivory/25">(optional)</span>
                    </label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={4}
                      className="bg-ivory/[0.03] border-ivory/[0.08] text-ivory placeholder:text-ivory/20 focus:border-champagne/40 resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400/80 text-xs">{error}</p>
                  )}

                  <GoldCtaButton
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-sm"
                  >
                    {loading ? "Submitting..." : "Submit Interest"}
                  </GoldCtaButton>
                </form>

                <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-champagne/20 to-transparent" />
                <p className="mt-5 text-center text-xs text-ivory/20">
                  All submissions are reviewed personally by the founding team.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
