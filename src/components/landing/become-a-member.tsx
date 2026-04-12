"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Shield, Sparkles, ChevronRight, Camera, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const PERKS = [
  {
    icon: Crown,
    title: "Curated introductions",
    desc: "Every match is handpicked by our concierge team — no algorithms, no endless swiping. Just quality introductions that respect your time.",
  },
  {
    icon: Shield,
    title: "Verified women only",
    desc: "Every Mommy on the platform has been personally reviewed, identity-verified, and approved before joining. Your time is protected.",
  },
  {
    icon: Sparkles,
    title: "Absolute discretion",
    desc: "Your profile is never public. Connections are made privately, and your information is never shared without your explicit consent.",
  },
];

const INCOME_OPTIONS = [
  { value: "200k_500k", label: "$200k – $500k" },
  { value: "500k_1m", label: "$500k – $1M" },
  { value: "1m_plus", label: "$1M+" },
];

type Step = 1 | 2 | 3;

export function BecomeAMember() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<"idle" | "success">("idle");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");

  const [incomeBracket, setIncomeBracket] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [motivation, setMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePhotoClick() {
    if (photoUrl) {
      setPhotoUrl(null);
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const url = prompt("Enter image URL (dev mode):");
      if (url) setPhotoUrl(url);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("upload_preset", uploadPreset);
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) { setUploading(false); return; }
        formData.append("file", file);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) setPhotoUrl(data.secure_url);
        setUploading(false);
      };
      input.click();
    } catch {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/member/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: fullName,
          age: parseInt(age),
          city,
          occupation,
          income_bracket: incomeBracket,
          motivation,
          photo_url: photoUrl ?? undefined,
          referral_source: referralSource || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to submit.");
        setSubmitting(false);
        return;
      }
      setState("success");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const canProceedStep1 =
    fullName.trim() &&
    email.includes("@") &&
    parseInt(age) >= 21 &&
    parseInt(age) <= 75 &&
    city.trim() &&
    occupation.trim();
  const canProceedStep2 = !!incomeBracket;
  const canSubmit = motivation.trim().length >= 20;

  return (
    <section
      id="become-a-member"
      className="luxury-section overflow-hidden bg-obsidian-soft"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(74, 14, 26, 0.25) 0%, transparent 60%), radial-gradient(ellipse at 30% 50%, rgba(232, 194, 123, 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Decorative section numeral */}
      <div
        aria-hidden="true"
        className="section-numeral absolute -right-8 top-16 pointer-events-none hidden sm:block"
      >
        05
      </div>

      <div className="relative z-10 container mx-auto">
        <LuxuryScrollTrigger>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-champagne/35" />
              <span className="text-champagne/40 text-[11px]">✦</span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-champagne/35" />
            </div>
            <p className="text-kicker mb-4">For Our Members</p>
            <h2 className="text-display-lg text-ivory mb-4">
              Request your{" "}
              <em className="text-gradient-gold not-italic font-accent">invitation</em>
            </h2>
            <p className="text-body-lg text-ivory/58 font-light max-w-2xl mx-auto">
              We&apos;re accepting a founding cohort of discerning men who value
              substance over noise — curated introductions, absolute privacy, and
              connections worth keeping.
            </p>
          </div>
        </LuxuryScrollTrigger>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — perks */}
          <div className="space-y-8">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                className="luxury-glass rounded-2xl p-4 flex gap-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="size-12 rounded-2xl bg-gradient-to-br from-champagne/20 to-burgundy/20 border border-champagne/20 flex items-center justify-center flex-shrink-0">
                  <perk.icon className="size-5 text-champagne" />
                </div>
                <div>
                  <h3 className="text-body-lg text-ivory font-medium mb-1">
                    {perk.title}
                  </h3>
                  <p className="text-body-md text-ivory/53">{perk.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Pull-quote card */}
            <motion.div
              className="mt-2 luxury-glass-deep rounded-2xl p-7 relative overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 }}
            >
              <span
                aria-hidden="true"
                className="absolute -top-2 left-5 font-headline text-[5rem] leading-none text-champagne/[0.07] select-none pointer-events-none"
              >
                &ldquo;
              </span>
              <p
                className="font-accent italic text-ivory/80 leading-[1.45] relative z-10"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.35rem)" }}
              >
                The quality of introductions is unlike anything I&apos;ve experienced.
                Every meeting has been with someone genuinely remarkable.
              </p>
              <cite className="text-label text-champagne/56 mt-4 block not-italic">
                — A founding member, London
              </cite>
              <div className="mt-5 h-px bg-gradient-to-r from-champagne/18 to-transparent" />
            </motion.div>
          </div>

          {/* Right — application form */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {state === "success" ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-16 text-center gap-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="size-16 rounded-full bg-champagne/10 border border-champagne/30 flex items-center justify-center">
                    <Check className="size-7 text-champagne" />
                  </div>
                  <div>
                    <h3 className="text-display-md text-ivory mb-2">
                      Request received.
                    </h3>
                    <p className="text-body-md text-ivory/50 max-w-xs">
                      We review every application personally. Expect a response within 48 hours.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="luxury-glass-deep p-5 sm:p-8 rounded-3xl relative overflow-hidden"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(232,194,123,0.11), 0 24px 64px rgba(0,0,0,0.42)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Corner ornament */}
                  <div
                    className="absolute top-0 right-0 overflow-hidden rounded-tr-3xl pointer-events-none"
                    style={{ width: 88, height: 88 }}
                  >
                    <div className="absolute top-0 right-0 w-px h-14 bg-gradient-to-b from-champagne/28 to-transparent" />
                    <div className="absolute top-0 right-0 h-px w-14 bg-gradient-to-l from-champagne/28 to-transparent" />
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-8">
                    {([1, 2, 3] as Step[]).map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "size-7 rounded-full flex items-center justify-center text-label border transition-all",
                            step === s
                              ? "bg-champagne text-obsidian border-champagne"
                              : step > s
                                ? "bg-champagne/20 text-champagne border-champagne/30"
                                : "bg-smoke text-ivory/30 border-champagne/10"
                          )}
                        >
                          {step > s ? <Check className="size-3" /> : s}
                        </div>
                        {s < 3 && (
                          <div
                            className={cn(
                              "h-px w-8 transition-all",
                              step > s ? "bg-champagne/40" : "bg-champagne/10"
                            )}
                          />
                        )}
                      </div>
                    ))}
                    <span className="ml-2 text-label text-ivory/38">
                      {step === 1
                        ? "Identity"
                        : step === 2
                          ? "Background"
                          : "Your story"}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="text-label text-ivory/38 mb-1.5 block">
                              Full Name
                            </label>
                            <Input
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Your name"
                              className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                            />
                          </div>
                          <div>
                            <label className="text-label text-ivory/38 mb-1.5 block">
                              Email
                            </label>
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@email.com"
                              className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                            />
                          </div>
                          <div>
                            <label className="text-label text-ivory/38 mb-1.5 block">
                              Age
                            </label>
                            <Input
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              placeholder="Age"
                              min="21"
                              max="75"
                              className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                            />
                          </div>
                          <div>
                            <label className="text-label text-ivory/38 mb-1.5 block">
                              City
                            </label>
                            <Input
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Your city"
                              className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                            />
                          </div>
                          <div>
                            <label className="text-label text-ivory/38 mb-1.5 block">
                              Occupation
                            </label>
                            <Input
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              placeholder="e.g. Founder, Partner, Director"
                              className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                            />
                          </div>
                        </div>
                        <GoldCtaButton
                          className="w-full mt-4"
                          disabled={!canProceedStep1}
                          onClick={() => setStep(2)}
                        >
                          Continue <ChevronRight className="size-4 ml-1" />
                        </GoldCtaButton>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        className="space-y-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <label className="text-label text-ivory/38 mb-1.5 block">
                            Annual Income
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {INCOME_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setIncomeBracket(opt.value)}
                                className={cn(
                                  "py-2.5 px-3 rounded-xl border text-label transition-all text-center",
                                  incomeBracket === opt.value
                                    ? "bg-champagne/15 border-champagne text-champagne"
                                    : "bg-obsidian/40 border-champagne/15 text-ivory/50 hover:border-champagne/40"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Optional photo */}
                        <div>
                          <label className="text-label text-ivory/38 mb-1.5 block">
                            Photo{" "}
                            <span className="text-ivory/20">(optional)</span>
                          </label>
                          <button
                            type="button"
                            onClick={handlePhotoClick}
                            disabled={uploading}
                            className={cn(
                              "w-full aspect-video rounded-xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden",
                              photoUrl
                                ? "border-champagne"
                                : "border-champagne/20 hover:border-champagne/50"
                            )}
                          >
                            {photoUrl ? (
                              <>
                                <Image
                                  src={photoUrl}
                                  alt=""
                                  fill
                                  className="object-cover rounded-xl"
                                  sizes="400px"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 hover:opacity-100 transition-opacity">
                                  <X className="size-5 text-ivory" />
                                </div>
                              </>
                            ) : uploading ? (
                              <div className="size-5 rounded-full border-2 border-champagne/40 border-t-champagne animate-spin" />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-ivory/30">
                                <Camera className="size-6" />
                                <span className="text-label">Add a photo</span>
                              </div>
                            )}
                          </button>
                        </div>

                        {/* Optional referral */}
                        <div>
                          <label className="text-label text-ivory/38 mb-1.5 block">
                            How did you hear about us?{" "}
                            <span className="text-ivory/20">(optional)</span>
                          </label>
                          <Input
                            value={referralSource}
                            onChange={(e) => setReferralSource(e.target.value)}
                            placeholder="Friend, press, social media..."
                            className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep(1)}
                            className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/48 text-body-sm hover:text-ivory transition-colors"
                          >
                            Back
                          </button>
                          <GoldCtaButton
                            className="flex-1"
                            disabled={!canProceedStep2}
                            onClick={() => setStep(3)}
                          >
                            Continue <ChevronRight className="size-4 ml-1" />
                          </GoldCtaButton>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        className="space-y-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <label className="text-label text-ivory/38 mb-2 block">
                            Your story{" "}
                            <span className="text-ivory/20">(min 20 characters)</span>
                          </label>
                          <Textarea
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            placeholder="Tell us a little about yourself and what kind of connections you're looking for..."
                            rows={5}
                            className="bg-obsidian/50 border-champagne/20 text-ivory rounded-2xl p-4"
                          />
                          <div className="text-right text-label text-ivory/22 mt-1">
                            {motivation.length} chars
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep(2)}
                            className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/48 text-body-sm hover:text-ivory transition-colors"
                          >
                            Back
                          </button>
                          <GoldCtaButton
                            className="flex-1"
                            disabled={!canSubmit || submitting}
                            onClick={handleSubmit}
                          >
                            {submitting ? "Submitting..." : "Request Invitation"}
                          </GoldCtaButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
