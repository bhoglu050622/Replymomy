"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
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
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/create-profile");
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <div className="text-label text-champagne">Step 02</div>
        <h1 className="text-display-lg text-ivory">
          Create your
          <br />
          <span className="italic text-champagne">account.</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-label text-ivory/50 mb-2 block">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 bg-smoke border-champagne/30 text-ivory rounded-full px-6"
          />
        </div>
        <div>
          <label className="text-label text-ivory/50 mb-2 block">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-14 bg-smoke border-champagne/30 text-ivory rounded-full px-6"
          />
        </div>
        {error && (
          <p className="text-body-sm text-burgundy-300 text-center">{error}</p>
        )}
        <GoldCtaButton type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Continue"}
        </GoldCtaButton>
      </form>
    </div>
  );
}
