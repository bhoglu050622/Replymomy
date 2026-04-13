"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid credentials.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <ShieldCheck className="size-8 text-champagne mx-auto" />
        <h1 className="text-display-lg text-ivory">
          Admin <span className="italic text-champagne">access.</span>
        </h1>
        <p className="text-label text-ivory/30">Restricted. Email &amp; password only.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          required
          autoComplete="username"
          className="h-14 bg-smoke border-champagne/30 text-ivory rounded-full px-6"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete="current-password"
          className="h-14 bg-smoke border-champagne/30 text-ivory rounded-full px-6"
        />
        {error && (
          <p className="text-body-sm text-burgundy-300 text-center">{error}</p>
        )}
        <GoldCtaButton type="submit" disabled={loading} className="w-full">
          {loading ? "Verifying..." : "Enter Admin"}
        </GoldCtaButton>
      </form>
    </div>
  );
}
