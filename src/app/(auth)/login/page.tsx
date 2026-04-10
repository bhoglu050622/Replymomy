"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { GoldCtaButton } from "@/components/shared/gold-cta-button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
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
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-display-lg text-ivory">
          Welcome <span className="italic text-champagne">back.</span>
        </h1>
        <p className="text-body-md text-ivory/60">
          Sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="h-14 bg-smoke border-champagne/30 text-ivory rounded-full px-6"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="h-14 bg-smoke border-champagne/30 text-ivory rounded-full px-6"
        />
        {error && (
          <p className="text-body-sm text-burgundy-300 text-center">{error}</p>
        )}
        <GoldCtaButton type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </GoldCtaButton>
      </form>

      <p className="text-center text-label text-ivory/40">
        New?{" "}
        <a href="/invite" className="text-champagne hover:underline">
          Enter invitation code
        </a>
      </p>
    </div>
  );
}
