"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { DollarSign, Shield, Star, ChevronRight, Camera, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { LuxuryScrollTrigger } from "@/components/animations/luxury-scroll-trigger";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PERKS = [
  {
    icon: DollarSign,
    title: "Earn exclusive perks",
    desc: "Receive gifts, gallery unlocks, and spotlight rewards. On your schedule, on your terms, with no pressure.",
  },
  {
    icon: Shield,
    title: "Control your visibility",
    desc: "You decide what's shared and with whom. Your profile is never public and you can pause anytime.",
  },
  {
    icon: Star,
    title: "Verified members only",
    desc: "Every person you connect with has been identity-verified and personally approved before joining.",
  },
];

type Step = 1 | 2 | 3;

export function BecomeAMommy() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<"idle" | "success">("idle");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [instagram, setInstagram] = useState("");

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const [motivation, setMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePhotoClick(idx: number) {
    if (photoUrls[idx]) {
      setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const url = prompt("Enter image URL (dev mode):");
      if (url) setPhotoUrls((prev) => [...prev, url]);
      return;
    }

    setUploadingIdx(idx);
    try {
      const formData = new FormData();
      formData.append("upload_preset", uploadPreset);
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          setUploadingIdx(null);
          return;
        }
        formData.append("file", file);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          setPhotoUrls((prev) => {
            const next = [...prev];
            next[idx] = data.secure_url;
            return next;
          });
        }
        setUploadingIdx(null);
      };
      input.click();
    } catch {
      setUploadingIdx(null);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/mommy/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: fullName,
          age: parseInt(age),
          instagram: instagram || undefined,
          city,
          motivation,
          photo_urls: photoUrls,
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
    fullName.trim() && email.includes("@") && parseInt(age) >= 18 && city.trim();
  const canProceedStep2 = photoUrls.length >= 1;
  const canSubmit = motivation.trim().length >= 20;

  return (
    <section
      id="become-a-mommy"
      className="luxury-section overflow-hidden bg-obsidian-soft"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(74, 14, 26, 0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(232, 194, 123, 0.1) 0%, transparent 60%)",
        }}
      />

      {/* Decorative section numeral */}
      <div
        aria-hidden="true"
        className="section-numeral absolute -right-8 top-16 pointer-events-none hidden sm:block"
      >
        05
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
        {/* Section header with ornamental divider */}
        <LuxuryScrollTrigger>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-champagne/35" />
              <span className="text-champagne/40 text-[11px]">✦</span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-champagne/35" />
            </div>
            <p className="text-kicker mb-4">For Our Mommies</p>
            <h2 className="text-display-lg text-ivory mb-4">
              Join our founding{" "}
              <em className="text-gradient-gold not-italic font-accent">Mommies</em>
              {" "}💌
            </h2>
            <p className="text-body-lg text-ivory/58 font-light max-w-2xl mx-auto">
              We&apos;re building a founding community of confident women who
              want to date on their own terms — with respect, privacy, and
              zero compromises.
            </p>
          </div>
        </LuxuryScrollTrigger>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
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
                The atmosphere is completely different from anything else I've
                tried. Every person I've met has been genuine.
              </p>
              <cite className="text-label text-champagne/56 mt-4 block not-italic">
                — A founding member, New York
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
                      Application received.
                    </h3>
                    <p className="text-body-md text-ivory/50 max-w-xs">
                      We review every application personally. Expect a response within 48 hours.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="luxury-glass-deep p-8 rounded-3xl relative overflow-hidden"
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
                          ? "Photo selection"
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
                        <div className="grid grid-cols-2 gap-3">
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
                              min="18"
                              max="65"
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
                              Instagram{" "}
                              <span className="text-ivory/20">(optional)</span>
                            </label>
                            <Input
                              value={instagram}
                              onChange={(e) => setInstagram(e.target.value)}
                              placeholder="@handle"
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
                          <p className="text-body-sm text-ivory/48 mb-4">
                            Add 1–5 photos. Your first photo is your introduction.
                          </p>
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handlePhotoClick(i)}
                                disabled={
                                  uploadingIdx === i ||
                                  (!photoUrls[i] && i > photoUrls.length)
                                }
                                className={cn(
                                  "aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden",
                                  photoUrls[i]
                                    ? "border-champagne"
                                    : i === photoUrls.length
                                      ? "border-champagne/30 hover:border-champagne/60"
                                      : "border-champagne/10 opacity-40"
                                )}
                              >
                                {photoUrls[i] ? (
                                  <>
                                    <Image
                                      src={photoUrls[i]}
                                      alt=""
                                      fill
                                      className="object-cover rounded-xl"
                                      sizes="(max-width: 768px) 33vw, 150px"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 hover:opacity-100 transition-opacity">
                                      <X className="size-3 text-ivory" />
                                    </div>
                                  </>
                                ) : uploadingIdx === i ? (
                                  <div className="size-3.5 rounded-full border-2 border-champagne/40 border-t-champagne animate-spin" />
                                ) : (
                                  <Camera className="size-4 text-champagne/30" />
                                )}
                              </button>
                            ))}
                          </div>
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
                            {submitting ? "Submitting..." : "Submit Application"}
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
