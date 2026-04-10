"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DollarSign, Shield, Star, ChevronRight, Camera, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PERKS = [
  {
    icon: DollarSign,
    title: "Earn on your terms",
    desc: "Gallery unlocks, gifts, and spotlight bonuses. Average mommy earns $2,400/month.",
  },
  {
    icon: Shield,
    title: "Absolute discretion",
    desc: "Your identity, your rules. Every member signs a discretion pact before access.",
  },
  {
    icon: Star,
    title: "Elite members only",
    desc: "Gold, Platinum, and Black Card members. Verified, vetted, exceptional.",
  },
];

type Step = 1 | 2 | 3;

export function BecomeAMommy() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<"idle" | "success">("idle");

  // Step 1 — Personal info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [instagram, setInstagram] = useState("");

  // Step 2 — Photos
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // Step 3 — Motivation
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
        if (!file) { setUploadingIdx(null); return; }
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

  const canProceedStep1 = fullName.trim() && email.includes("@") && parseInt(age) >= 18 && city.trim();
  const canProceedStep2 = photoUrls.length >= 1;
  const canSubmit = motivation.trim().length >= 20;

  return (
    <section id="become-a-mommy" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(74, 14, 26, 0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(201, 168, 76, 0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-label text-champagne tracking-widest uppercase mb-4">
            For exceptional women
          </div>
          <h2 className="text-display-lg text-ivory mb-4">
            Become a <span className="italic text-champagne">Mommy.</span>
          </h2>
          <p className="text-body-lg text-ivory/60 max-w-xl mx-auto">
            The Guild's mommies are curated, not collected. If you carry yourself with intention —
            we want you here.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — perks */}
          <div className="space-y-8">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                className="flex gap-5"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="size-12 rounded-2xl bg-gradient-to-br from-champagne/20 to-burgundy/20 border border-champagne/20 flex items-center justify-center flex-shrink-0">
                  <perk.icon className="size-5 text-champagne" />
                </div>
                <div>
                  <h3 className="text-body-lg text-ivory font-medium mb-1">{perk.title}</h3>
                  <p className="text-body-md text-ivory/55">{perk.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Quote */}
            <motion.blockquote
              className="mt-12 pl-5 border-l-2 border-champagne/30"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-accent-quote text-ivory/60 italic">
                &ldquo;The quality of the members here is unlike anything I&apos;ve experienced.
                Discretion, generosity, and genuine appreciation.&rdquo;
              </p>
              <cite className="text-label text-champagne/70 mt-3 block not-italic">
                — Guild Mommy, NYC. 14 months.
              </cite>
            </motion.blockquote>
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
                    <h3 className="text-display-md text-ivory mb-2">Application received.</h3>
                    <p className="text-body-md text-ivory/50 max-w-xs">
                      We review every application personally. Expect a response within 48 hours.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="p-8 rounded-3xl bg-smoke/50 border border-champagne/15 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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
                          <div className={cn("h-px w-8 transition-all", step > s ? "bg-champagne/40" : "bg-champagne/10")} />
                        )}
                      </div>
                    ))}
                    <span className="ml-2 text-label text-ivory/40">
                      {step === 1 ? "About you" : step === 2 ? "Your photos" : "Your story"}
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
                            <label className="text-label text-ivory/40 mb-1.5 block">Full Name</label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                              placeholder="Your name" className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5" />
                          </div>
                          <div>
                            <label className="text-label text-ivory/40 mb-1.5 block">Email</label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@email.com" className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5" />
                          </div>
                          <div>
                            <label className="text-label text-ivory/40 mb-1.5 block">Age</label>
                            <Input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                              placeholder="Age" min="18" max="65" className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5" />
                          </div>
                          <div>
                            <label className="text-label text-ivory/40 mb-1.5 block">City</label>
                            <Input value={city} onChange={(e) => setCity(e.target.value)}
                              placeholder="Your city" className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5" />
                          </div>
                          <div>
                            <label className="text-label text-ivory/40 mb-1.5 block">Instagram <span className="text-ivory/20">(optional)</span></label>
                            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)}
                              placeholder="@handle" className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5" />
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
                          <p className="text-body-sm text-ivory/50 mb-4">
                            Add 1–5 photos. Your first photo is your introduction.
                          </p>
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handlePhotoClick(i)}
                                disabled={uploadingIdx === i || (!photoUrls[i] && i > photoUrls.length)}
                                className={cn(
                                  "aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden",
                                  photoUrls[i] ? "border-champagne" : i === photoUrls.length ? "border-champagne/30 hover:border-champagne/60" : "border-champagne/10 opacity-40"
                                )}
                              >
                                {photoUrls[i] ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photoUrls[i]} alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
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
                          <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/50 text-body-sm hover:text-ivory transition-colors">
                            Back
                          </button>
                          <GoldCtaButton className="flex-1" disabled={!canProceedStep2} onClick={() => setStep(3)}>
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
                          <label className="text-label text-ivory/40 mb-2 block">
                            Why The Guild? <span className="text-ivory/20">(min 20 characters)</span>
                          </label>
                          <Textarea
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            placeholder="Tell us about yourself, what draws you to the guild, and what kind of connections you're seeking..."
                            rows={5}
                            className="bg-obsidian/50 border-champagne/20 text-ivory rounded-2xl p-4"
                          />
                          <div className="text-right text-label text-ivory/25 mt-1">
                            {motivation.length} chars
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/50 text-body-sm hover:text-ivory transition-colors">
                            Back
                          </button>
                          <GoldCtaButton className="flex-1" disabled={!canSubmit || submitting} onClick={handleSubmit}>
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
