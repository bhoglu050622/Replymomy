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

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
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

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-champagne/20" />
        <span className="text-label text-ivory/30">or</span>
        <div className="flex-1 h-px bg-champagne/20" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-14 flex items-center justify-center gap-3 rounded-full border border-champagne/30 bg-smoke text-ivory text-body-sm hover:border-champagne/60 transition-colors disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-label text-ivory/40">
        New?{" "}
        <a href="/signup" className="text-champagne hover:underline">
          Create free account
        </a>
      </p>
    </div>
  );
}
