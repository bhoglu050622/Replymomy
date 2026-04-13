"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronRight,
  Camera,
  X,
  Sparkles,
  Users,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ──────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  "Man",
  "Woman",
  "Non-binary",
  "Genderqueer",
  "Genderfluid",
  "Agender",
  "Two-spirit",
  "Trans man",
  "Trans woman",
  "Prefer to self-describe",
];

const PRONOUNS_OPTIONS = [
  "he/him",
  "she/her",
  "they/them",
  "he/they",
  "she/they",
  "ze/zir",
  "xe/xem",
  "any pronouns",
  "prefer not to say",
];

const INCOME_BRACKETS = [
  { value: "200k_500k", label: "₹2L – ₹5L / mo" },
  { value: "500k_1m", label: "₹5L – ₹10L / mo" },
  { value: "1m_plus", label: "₹10L+ / mo" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "member" | "mommy";
type Step = 0 | 1 | 2 | 3 | 4;

interface FormState {
  // Shared
  email: string;
  full_name: string;
  age: string;
  city: string;
  gender: string;
  customGender: string;
  pronouns: string;
  motivation: string;
  // Member-only
  occupation: string;
  income_bracket: string;
  referral_source: string;
  // Mommy-only
  instagram: string;
  // Photos
  photoUrls: string[];
}

const INITIAL_FORM: FormState = {
  email: "",
  full_name: "",
  age: "",
  city: "",
  gender: "",
  customGender: "",
  pronouns: "",
  motivation: "",
  occupation: "",
  income_bracket: "",
  referral_source: "",
  instagram: "",
  photoUrls: [],
};

// ─── Upload helper ────────────────────────────────────────────────────────────

async function pickAndUpload(
  idx: number,
  photoUrls: string[],
  setPhotoUrls: React.Dispatch<React.SetStateAction<string[]>>,
  setUploadingIdx: React.Dispatch<React.SetStateAction<number | null>>
) {
  if (photoUrls[idx]) {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
    return;
  }

  setUploadingIdx(idx);
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) { setUploadingIdx(null); return; }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setPhotoUrls((prev) => { const next = [...prev]; next[idx] = data.url; return next; });
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingIdx(null);
    }
  };
  input.click();
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS: Record<Role, string[]> = {
  member: ["Agreement", "Details", "Career", "Photos", "Story"],
  mommy: ["Agreement", "Details", "Photos", "Story", ""],
};

function StepIndicator({ step, role }: { step: Step; role: Role }) {
  const total = role === "member" ? 4 : 3;
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total + 1 }, (_, i) => i).map((s) => (
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
            {step > s ? <Check className="size-3" /> : s + 1}
          </div>
          {s < total && (
            <div
              className={cn(
                "h-px w-6 transition-all",
                step > s ? "bg-champagne/40" : "bg-champagne/10"
              )}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-label text-ivory/38 hidden sm:block">
        {STEP_LABELS[role][step]}
      </span>
    </div>
  );
}

// ─── Photo grid ───────────────────────────────────────────────────────────────

function PhotoGrid({
  photoUrls,
  uploadingIdx,
  maxPhotos,
  onPhotoClick,
}: {
  photoUrls: string[];
  uploadingIdx: number | null;
  maxPhotos: number;
  onPhotoClick: (idx: number) => void;
}) {
  // Member (3 photos): big highlight on left + 2 stacked on right
  // Mommy  (5 photos): flat row of 5 equal squares
  const is3 = maxPhotos === 3;

  if (is3) {
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-2">
        {Array.from({ length: 3 }).map((_, i) => {
          const isHighlight = i === 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPhotoClick(i)}
              disabled={uploadingIdx === i || (!photoUrls[i] && i > photoUrls.length)}
              className={cn(
                "aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden group",
                isHighlight ? "col-span-2 row-span-2 rounded-2xl" : "",
                photoUrls[i]
                  ? "border-champagne"
                  : i === photoUrls.length
                    ? "border-champagne/30 hover:border-champagne/60"
                    : "border-champagne/10 opacity-40"
              )}
            >
              {photoUrls[i] ? (
                <>
                  <Image src={photoUrls[i]} alt="" fill className="object-cover" sizes="200px" />
                  {isHighlight && (
                    <div className="absolute bottom-2 left-2 bg-champagne/90 text-obsidian text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                      Highlight
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="size-3 text-ivory" />
                  </div>
                </>
              ) : uploadingIdx === i ? (
                <div className="size-3.5 rounded-full border-2 border-champagne/40 border-t-champagne animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera className={cn("text-champagne/30", isHighlight ? "size-6" : "size-4")} />
                  {isHighlight && (
                    <span className="text-[9px] text-champagne/30 tracking-widest uppercase">
                      Highlight
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 5-photo flat grid
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPhotoClick(i)}
          disabled={uploadingIdx === i || (!photoUrls[i] && i > photoUrls.length)}
          className={cn(
            "aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-colors relative overflow-hidden group",
            photoUrls[i]
              ? "border-champagne"
              : i === photoUrls.length
                ? "border-champagne/30 hover:border-champagne/60"
                : "border-champagne/10 opacity-40"
          )}
        >
          {photoUrls[i] ? (
            <>
              <Image src={photoUrls[i]} alt="" fill className="object-cover rounded-xl" sizes="150px" />
              {i === 0 && (
                <div className="absolute bottom-1 left-1 bg-champagne/90 text-obsidian text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full">
                  ★
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="size-3 text-ivory" />
              </div>
            </>
          ) : uploadingIdx === i ? (
            <div className="size-3 rounded-full border-2 border-champagne/40 border-t-champagne animate-spin" />
          ) : (
            <Camera className="size-3.5 text-champagne/30" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Chip selector ────────────────────────────────────────────────────────────

function ChipSelect({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div>
      <label className="text-label text-ivory/38 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === value ? "" : opt)}
            className={cn(
              "px-3.5 py-1.5 rounded-full border text-body-sm transition-all",
              value === opt
                ? "bg-champagne/20 border-champagne text-champagne"
                : "bg-smoke/60 border-champagne/15 text-ivory/50 hover:border-champagne/35 hover:text-ivory/70"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ApplyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("member");
  const [step, setStep] = useState<Step>(0);

  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Pre-select role from ?role=member|mommy query param
  useEffect(() => {
    const param = searchParams.get("role");
    if (param === "mommy" || param === "member") setRole(param);
  }, [searchParams]);

  // Check auth + pre-fill from Google session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata ?? {};
        const name: string = meta.full_name ?? meta.name ?? "";
        const email: string = data.user.email ?? "";
        setIsAuthed(true);
        setForm((f) => ({
          ...f,
          email: email || f.email,
          full_name: name || f.full_name,
        }));
      }
      setAuthChecked(true);
    });
  }, []);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createClient();
    const nextUrl = `/apply?role=${role}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
    // On success the browser navigates away — no need to reset loading
  }

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const effectiveGender =
    form.gender === "Prefer to self-describe" ? form.customGender : form.gender;

  // ── Validation ──

  const canAdvanceStep0 = agreed;

  const canAdvanceStep1 =
    form.full_name.trim().length >= 2 &&
    form.email.includes("@") &&
    parseInt(form.age) >= (role === "member" ? 21 : 18) &&
    parseInt(form.age) <= (role === "member" ? 75 : 65) &&
    form.city.trim().length >= 2;

  const canAdvanceStep2_member =
    form.occupation.trim().length >= 2 && !!form.income_bracket;

  const canAdvancePhotos_member = form.photoUrls.length >= 1;
  const canAdvancePhotos_mommy = form.photoUrls.length >= 1;

  const canSubmit = form.motivation.trim().length >= 20;

  // ── Step routing ──

  // member: 0=agreement 1=details 2=career 3=photos 4=story
  // mommy:  0=agreement 1=details 2=photos 3=story

  function nextStep() {
    setStep((s) => (s + 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prevStep() {
    setStep((s) => (s - 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRoleSwitch(r: Role) {
    setRole(r);
    setStep(0);
    setForm(INITIAL_FORM);
    setAgreed(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const endpoint = role === "member" ? "/api/member/apply" : "/api/mommy/apply";
      const payload =
        role === "member"
          ? {
              email: form.email,
              full_name: form.full_name,
              age: parseInt(form.age),
              city: form.city,
              occupation: form.occupation,
              income_bracket: form.income_bracket,
              motivation: form.motivation,
              photo_url: form.photoUrls[0] ?? undefined,
              photo_urls: form.photoUrls,
              referral_source: form.referral_source || undefined,
              gender: effectiveGender || undefined,
              pronouns: form.pronouns || undefined,
            }
          : {
              email: form.email,
              full_name: form.full_name,
              age: parseInt(form.age),
              city: form.city,
              instagram: form.instagram || undefined,
              motivation: form.motivation,
              photo_urls: form.photoUrls,
              gender: effectiveGender || undefined,
              pronouns: form.pronouns || undefined,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to submit. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const photoCount = role === "member" ? 3 : 5;

  // ── Auth check loading ──
  if (!authChecked) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 rounded-full border-2 border-champagne/20 border-t-champagne animate-spin" />
      </div>
    );
  }

  // ── Google sign-in gate ──
  if (!isAuthed) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="text-label text-champagne">Applications</div>
          <h1 className="text-display-lg text-ivory">
            Join{" "}
            <span className="italic text-champagne">ReplyMommy.</span>
          </h1>
          <p className="text-body-sm text-ivory/40">
            A private community built on mutual respect and genuine connection.
          </p>
        </div>

        {/* Role toggle (so user can pick before signing in) */}
        <div className="flex p-1 rounded-full bg-smoke border border-champagne/[0.08]">
          <button
            type="button"
            onClick={() => setRole("member")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-body-sm font-medium transition-all",
              role === "member" ? "bg-champagne/20 text-champagne" : "text-ivory/40 hover:text-ivory/70"
            )}
          >
            <Users className="size-4" />
            I&apos;m a Man
          </button>
          <button
            type="button"
            onClick={() => setRole("mommy")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-body-sm font-medium transition-all",
              role === "mommy" ? "bg-champagne/20 text-champagne" : "text-ivory/40 hover:text-ivory/70"
            )}
          >
            <Heart className="size-4" />
            I&apos;m a Mommy
          </button>
        </div>

        <p className="text-[11px] text-ivory/30 leading-relaxed text-center">
          <span className="text-champagne/50">*</span>{" "}
          Anyone who identifies outside of male belongs here as a Mommy.{" "}
          <span className="italic text-champagne/50">Slay your feminine energy.</span>
        </p>

        {/* Sign in card */}
        <div
          className="rounded-3xl border border-champagne/[0.1] bg-smoke/80 p-7 space-y-6 text-center"
          style={{ boxShadow: "0 0 0 1px rgba(232,194,123,0.06), 0 24px 64px rgba(0,0,0,0.35)" }}
        >
          <div>
            <h2 className="text-body-lg text-ivory font-medium">First, create your account</h2>
            <p className="text-body-sm text-ivory/40 mt-1">
              One click — we&apos;ll use Google to verify you&apos;re a real person.
            </p>
          </div>

          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
            className="w-full h-13 flex items-center justify-center gap-3 rounded-full border border-champagne/30 bg-smoke text-ivory text-body-sm hover:border-champagne/60 transition-colors disabled:opacity-50 py-3.5"
          >
            {googleLoading ? (
              <div className="size-4 rounded-full border-2 border-ivory/20 border-t-ivory animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-[11px] text-ivory/25">
            By continuing you agree to our community standards. Already have an account?{" "}
            <a href="/login" className="text-champagne/50 hover:text-champagne underline">Sign in</a>
          </p>
        </div>
      </div>
    );
  }

  // ── Render ──

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-label text-champagne">Applications</div>
        <h1 className="text-display-lg text-ivory">
          Join{" "}
          <span className="italic text-champagne">ReplyMommy.</span>
        </h1>
        <p className="text-body-sm text-ivory/40">
          A private community built on mutual respect and genuine connection.
        </p>
      </div>

      {/* Role toggle */}
      {!done && (
        <div className="flex p-1 rounded-full bg-smoke border border-champagne/[0.08]">
          <button
            type="button"
            onClick={() => handleRoleSwitch("member")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-body-sm font-medium transition-all",
              role === "member"
                ? "bg-champagne/20 text-champagne"
                : "text-ivory/40 hover:text-ivory/70"
            )}
          >
            <Users className="size-4" />
            I&apos;m a Man
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch("mommy")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-body-sm font-medium transition-all",
              role === "mommy"
                ? "bg-champagne/20 text-champagne"
                : "text-ivory/40 hover:text-ivory/70"
            )}
          >
            <Heart className="size-4" />
            I&apos;m a Mommy
          </button>
        </div>
      )}

      {/* Asterisk note */}
      {!done && (
        <p className="text-[11px] text-ivory/30 leading-relaxed text-center">
          <span className="text-champagne/50">*</span>{" "}
          Anyone who identifies outside of male — whether as a woman, non-binary,
          femme, or any expression of femininity — belongs here as a Mommy.{" "}
          <span className="italic text-champagne/50">Slay your feminine energy.</span>
        </p>
      )}

      {/* Form card */}
      <div
        className="rounded-3xl border border-champagne/[0.1] bg-smoke/80 overflow-hidden"
        style={{ boxShadow: "0 0 0 1px rgba(232,194,123,0.06), 0 24px 64px rgba(0,0,0,0.35)" }}
      >
        <AnimatePresence mode="wait">
          {/* ── Success ── */}
          {done ? (
            <motion.div
              key="done"
              className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="size-16 rounded-full bg-champagne/10 border border-champagne/30 flex items-center justify-center">
                <Sparkles className="size-7 text-champagne" />
              </div>
              <div>
                <h2 className="text-display-md text-ivory mb-2">
                  {role === "mommy" ? "Application received." : "Request received."}
                </h2>
                <p className="text-body-sm text-ivory/50 max-w-xs mx-auto">
                  {role === "mommy"
                    ? "We review every Mommy application personally. Expect a response within 48 hours."
                    : "We'll reach out once we've reviewed your details. Watch your inbox."}
                </p>
              </div>
              <a
                href="/"
                className="text-label text-champagne/60 hover:text-champagne transition-colors"
              >
                Return home
              </a>
            </motion.div>
          ) : (
            <motion.div
              key={`${role}-form`}
              className="p-6 sm:p-8 space-y-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step indicator */}
              <StepIndicator step={step} role={role} />

              <AnimatePresence mode="wait">

                {/* ── Step 0: Agreement ── */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    className="space-y-6"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div>
                      <h2 className="text-body-lg text-ivory font-medium mb-1">
                        Before you continue
                      </h2>
                      <p className="text-body-sm text-ivory/50">
                        Please read and accept our community standards.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-obsidian/60 border border-champagne/[0.08] p-5 space-y-4 text-body-sm text-ivory/60 leading-relaxed">
                      <p>
                        <span className="text-champagne font-medium">ReplyMommy</span> is
                        a premium, invitation-style community built around respect,
                        consent, and genuine connection.
                      </p>
                      <ul className="space-y-2 list-none">
                        {[
                          "All interactions must be consensual and respectful at all times.",
                          "No harassment, unsolicited explicit content, or disrespectful behaviour.",
                          "You confirm that all information you provide is truthful and accurate.",
                          "You are of legal age in your jurisdiction (minimum 18 years for Mommies, 21 for Members).",
                          "Misrepresentation or abuse will result in permanent removal.",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <Check className="size-3.5 text-champagne/60 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div
                        onClick={() => setAgreed((a) => !a)}
                        className={cn(
                          "size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                          agreed
                            ? "bg-champagne border-champagne"
                            : "bg-smoke border-champagne/30 group-hover:border-champagne/60"
                        )}
                      >
                        {agreed && <Check className="size-3 text-obsidian" />}
                      </div>
                      <span className="text-body-sm text-ivory/60">
                        I have read and agree to the community standards above.
                      </span>
                    </label>

                    <GoldCtaButton
                      className="w-full"
                      disabled={!canAdvanceStep0}
                      onClick={nextStep}
                    >
                      Continue <ChevronRight className="size-4 ml-1" />
                    </GoldCtaButton>
                  </motion.div>
                )}

                {/* ── Step 1: Personal details ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    className="space-y-5"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div>
                      <h2 className="text-body-lg text-ivory font-medium mb-1">
                        Tell us about yourself
                      </h2>
                      <p className="text-body-sm text-ivory/40">
                        Basic details — all private, never shown publicly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-label text-ivory/38 mb-1.5 block">Full Name</label>
                        <Input
                          value={form.full_name}
                          onChange={(e) => set("full_name")(e.target.value)}
                          placeholder="Your name"
                          className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                        />
                      </div>
                      <div>
                        <label className="text-label text-ivory/38 mb-1.5 block">Email</label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email")(e.target.value)}
                          placeholder="you@email.com"
                          className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                        />
                      </div>
                      <div>
                        <label className="text-label text-ivory/38 mb-1.5 block">
                          Age{" "}
                          <span className="text-ivory/20">
                            ({role === "member" ? "21–75" : "18–65"})
                          </span>
                        </label>
                        <Input
                          type="number"
                          value={form.age}
                          onChange={(e) => set("age")(e.target.value)}
                          placeholder="Age"
                          min={role === "member" ? 21 : 18}
                          max={role === "member" ? 75 : 65}
                          className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-label text-ivory/38 mb-1.5 block">City</label>
                        <Input
                          value={form.city}
                          onChange={(e) => set("city")(e.target.value)}
                          placeholder="Your city"
                          className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                        />
                      </div>
                    </div>

                    {/* Gender identity */}
                    <ChipSelect
                      label="Gender identity"
                      options={GENDER_OPTIONS}
                      value={form.gender}
                      onChange={set("gender")}
                    />

                    {form.gender === "Prefer to self-describe" && (
                      <Input
                        value={form.customGender}
                        onChange={(e) => set("customGender")(e.target.value)}
                        placeholder="Describe your gender identity"
                        className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                      />
                    )}

                    {/* Pronouns */}
                    <ChipSelect
                      label="Pronouns"
                      options={PRONOUNS_OPTIONS}
                      value={form.pronouns}
                      onChange={set("pronouns")}
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/48 text-body-sm hover:text-ivory transition-colors"
                      >
                        Back
                      </button>
                      <GoldCtaButton
                        className="flex-1"
                        disabled={!canAdvanceStep1}
                        onClick={nextStep}
                      >
                        Continue <ChevronRight className="size-4 ml-1" />
                      </GoldCtaButton>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2 (member): Career & income ── */}
                {step === 2 && role === "member" && (
                  <motion.div
                    key="step2-member"
                    className="space-y-5"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div>
                      <h2 className="text-body-lg text-ivory font-medium mb-1">
                        Career &amp; lifestyle
                      </h2>
                      <p className="text-body-sm text-ivory/40">
                        This helps us match you with Mommies who appreciate your world.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-label text-ivory/38 mb-1.5 block">Occupation</label>
                        <Input
                          value={form.occupation}
                          onChange={(e) => set("occupation")(e.target.value)}
                          placeholder="e.g. Founder, Doctor, Engineer"
                          className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                        />
                      </div>

                      <div>
                        <label className="text-label text-ivory/38 mb-2 block">
                          Monthly income
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {INCOME_BRACKETS.map((b) => (
                            <button
                              key={b.value}
                              type="button"
                              onClick={() => set("income_bracket")(b.value)}
                              className={cn(
                                "px-4 py-2 rounded-full border text-body-sm transition-all",
                                form.income_bracket === b.value
                                  ? "bg-champagne/20 border-champagne text-champagne"
                                  : "bg-smoke/60 border-champagne/15 text-ivory/50 hover:border-champagne/35 hover:text-ivory/70"
                              )}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-label text-ivory/38 mb-1.5 block">
                          How did you hear about us?{" "}
                          <span className="text-ivory/20">(optional)</span>
                        </label>
                        <Input
                          value={form.referral_source}
                          onChange={(e) => set("referral_source")(e.target.value)}
                          placeholder="Friend, social media, etc."
                          className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/48 text-body-sm hover:text-ivory transition-colors"
                      >
                        Back
                      </button>
                      <GoldCtaButton
                        className="flex-1"
                        disabled={!canAdvanceStep2_member}
                        onClick={nextStep}
                      >
                        Continue <ChevronRight className="size-4 ml-1" />
                      </GoldCtaButton>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2 (mommy): Socials ── */}
                {step === 2 && role === "mommy" && (
                  <motion.div
                    key="step2-mommy"
                    className="space-y-5"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div>
                      <h2 className="text-body-lg text-ivory font-medium mb-1">
                        Photos
                      </h2>
                      <p className="text-body-sm text-ivory/40">
                        Your first photo is your highlight — make it count. Add up to 5.
                      </p>
                    </div>

                    <PhotoGrid
                      photoUrls={form.photoUrls}
                      uploadingIdx={uploadingIdx}
                      maxPhotos={photoCount}

                      onPhotoClick={(idx) =>
                        pickAndUpload(
                          idx,
                          form.photoUrls,
                          (updater) => setForm((f) => ({ ...f, photoUrls: typeof updater === "function" ? updater(f.photoUrls) : updater })),
                          setUploadingIdx
                        )
                      }
                    />

                    <p className="text-[11px] text-ivory/30">
                      Photos are reviewed by our team and never shown publicly without your consent.
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/48 text-body-sm hover:text-ivory transition-colors"
                      >
                        Back
                      </button>
                      <GoldCtaButton
                        className="flex-1"
                        disabled={!canAdvancePhotos_mommy}
                        onClick={nextStep}
                      >
                        Continue <ChevronRight className="size-4 ml-1" />
                      </GoldCtaButton>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3 (member): Photos ── */}
                {step === 3 && role === "member" && (
                  <motion.div
                    key="step3-member"
                    className="space-y-5"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div>
                      <h2 className="text-body-lg text-ivory font-medium mb-1">
                        Photos
                      </h2>
                      <p className="text-body-sm text-ivory/40">
                        Add up to 3 photos. Your first is your highlight.
                      </p>
                    </div>

                    <PhotoGrid
                      photoUrls={form.photoUrls}
                      uploadingIdx={uploadingIdx}
                      maxPhotos={photoCount}

                      onPhotoClick={(idx) =>
                        pickAndUpload(
                          idx,
                          form.photoUrls,
                          (updater) => setForm((f) => ({ ...f, photoUrls: typeof updater === "function" ? updater(f.photoUrls) : updater })),
                          setUploadingIdx
                        )
                      }
                    />

                    <p className="text-[11px] text-ivory/30">
                      Photos are reviewed by our team and never shown publicly without your consent.
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/48 text-body-sm hover:text-ivory transition-colors"
                      >
                        Back
                      </button>
                      <GoldCtaButton
                        className="flex-1"
                        disabled={!canAdvancePhotos_member}
                        onClick={nextStep}
                      >
                        Continue <ChevronRight className="size-4 ml-1" />
                      </GoldCtaButton>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3 (mommy) / Step 4 (member): Story ── */}
                {((step === 3 && role === "mommy") ||
                  (step === 4 && role === "member")) && (
                  <motion.div
                    key="step-story"
                    className="space-y-5"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div>
                      <h2 className="text-body-lg text-ivory font-medium mb-1">
                        Your story
                      </h2>
                      <p className="text-body-sm text-ivory/40">
                        Tell us about yourself and what you&apos;re looking for.
                      </p>
                    </div>

                    {role === "mommy" && (
                      <div>
                        <label className="text-label text-ivory/38 mb-1.5 block">
                          Instagram{" "}
                          <span className="text-ivory/20">(optional)</span>
                        </label>
                        <Input
                          value={form.instagram}
                          onChange={(e) => set("instagram")(e.target.value)}
                          placeholder="@yourhandle"
                          className="h-11 bg-obsidian/50 border-champagne/20 text-ivory rounded-full px-5"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-label text-ivory/38 mb-2 block">
                        About you{" "}
                        <span className="text-ivory/20">(min 20 characters)</span>
                      </label>
                      <Textarea
                        value={form.motivation}
                        onChange={(e) => set("motivation")(e.target.value)}
                        placeholder={
                          role === "mommy"
                            ? "Tell us about yourself, what brings you here, and the kind of dynamic you're looking for..."
                            : "Tell us a bit about yourself and the kind of connection you're hoping to find..."
                        }
                        rows={5}
                        className="bg-obsidian/50 border-champagne/20 text-ivory rounded-2xl p-4 resize-none"
                      />
                      <div className="text-right text-label text-ivory/22 mt-1">
                        {form.motivation.length} chars
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-5 py-2.5 rounded-full border border-champagne/20 text-ivory/48 text-body-sm hover:text-ivory transition-colors"
                      >
                        Back
                      </button>
                      <GoldCtaButton
                        className="flex-1"
                        disabled={!canSubmit || submitting}
                        onClick={handleSubmit}
                      >
                        {submitting
                          ? "Submitting..."
                          : role === "mommy"
                            ? "Submit Application"
                            : "Submit Request"}
                      </GoldCtaButton>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Already have an account */}
      {!done && (
        <p className="text-center text-label text-ivory/40">
          Already a member?{" "}
          <a href="/login" className="text-champagne hover:underline">
            Sign in
          </a>
        </p>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense>
      <ApplyPageInner />
    </Suspense>
  );
}
