"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, FileCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  // Inject Persona SDK script
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_PERSONA_API_KEY &&
      process.env.NODE_ENV !== "production"
    ) {
      return; // Stub mode — no script needed
    }
    const script = document.createElement("script");
    script.src = "https://cdn.withpersona.com/dist/persona-v4.9.0.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  async function handleBegin() {
    setLoading(true);

    try {
      const res = await fetch("/api/verification/create-inquiry", {
        method: "POST",
      });
      const data = await res.json();

      // Stub mode: advance directly
      if (data.stub || !data.sessionToken) {
        await fetch("/api/verification/complete", { method: "POST" });
        setVerified(true);
        setTimeout(() => router.push("/create-profile"), 1500);
        return;
      }

      // Production: load Persona widget
      // @ts-expect-error — Persona loaded via CDN
      const client = new window.Persona.Client({
        templateId: data.templateId,
        sessionToken: data.sessionToken,
        onComplete: async () => {
          await fetch("/api/verification/complete", { method: "POST" });
          setVerified(true);
          setTimeout(() => router.push("/create-profile"), 1500);
        },
        onError: () => {
          toast.error("Verification failed. Please try again.");
          setLoading(false);
        },
        onCancel: () => {
          setLoading(false);
        },
      });
      client.open();
    } catch {
      toast.error("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div className="space-y-8 text-center">
        <div className="size-20 rounded-full bg-champagne/20 border border-champagne/40 flex items-center justify-center mx-auto animate-gold-pulse">
          <CheckCircle className="size-10 text-champagne" />
        </div>
        <div className="space-y-2">
          <h1 className="text-display-lg text-ivory">Verified.</h1>
          <p className="text-body-md text-ivory/60">Taking you to your profile setup.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-center">
      <div className="space-y-4">
        <div className="text-label text-champagne">Step 02</div>
        <h1 className="text-display-lg text-ivory">
          A few
          <br />
          <span className="italic text-champagne">confirmations.</span>
        </h1>
        <p className="text-body-md text-ivory/60 max-w-sm mx-auto">
          Two steps. Completely private.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/20">
          <div className="size-12 rounded-full border border-champagne/40 flex items-center justify-center shrink-0">
            <Shield className="size-5 text-champagne" />
          </div>
          <div className="text-left">
            <div className="text-body-md text-ivory">Government ID</div>
            <div className="text-body-sm text-ivory/50">
              Confirms your identity & age
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-smoke border border-champagne/20">
          <div className="size-12 rounded-full border border-champagne/40 flex items-center justify-center shrink-0">
            <FileCheck className="size-5 text-champagne" />
          </div>
          <div className="text-left">
            <div className="text-body-md text-ivory">Financial Verification</div>
            <div className="text-body-sm text-ivory/50">
              Bank or income confirmation.
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="size-8 border-2 border-champagne/30 border-t-champagne rounded-full animate-spin" />
          <p className="text-label text-ivory/40">Preparing verification...</p>
        </div>
      ) : (
        <GoldCtaButton onClick={handleBegin} className="w-full">
          Begin
        </GoldCtaButton>
      )}

      <p className="text-label text-ivory/30">
        Powered by Persona · Bank-level encryption
      </p>
    </div>
  );
}
