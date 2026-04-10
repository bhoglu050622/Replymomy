"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";

export function InvitationForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invitation/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        const msg = data.error ?? "This code is not valid.";
        setError(msg);
        toast.error(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      router.push("/verify");
    } catch {
      const msg = "Something went wrong. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <Input
        type="text"
        placeholder="GOLD-RM-XXXX"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="h-14 text-center font-headline text-xl tracking-widest bg-smoke border-champagne/30 text-champagne uppercase rounded-full"
        required
        autoFocus
      />
      {error && (
        <p className="text-center text-body-sm text-burgundy-300">{error}</p>
      )}
      <GoldCtaButton type="submit" disabled={loading} className="w-full">
        {loading ? "Verifying..." : "Enter"}
      </GoldCtaButton>
      <p className="text-center text-label text-ivory/40">
        Don&apos;t have a code?{" "}
        <a href="/" className="text-champagne hover:underline">
          Join the waitlist
        </a>
      </p>
    </motion.form>
  );
}
