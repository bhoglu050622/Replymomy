import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase auth callback — exchanges code for session.
// For new member signups (email confirmation or Google OAuth), advances status from
// pending_invite → pending_profile so the onboarding gate routes them correctly.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // If the user came from the /apply page, send them straight back there.
        // Don't advance their status — they still need to fill the application.
        if (next.startsWith("/apply")) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        const { data: record } = await supabase
          .from("users")
          .select("status, role")
          .eq("id", user.id)
          .single();

        // New member arriving via Google OAuth or email confirmation link.
        // The handle_new_user trigger sets status = 'pending_invite' by default;
        // advance them to pending_profile to skip the invite and KYC gates.
        if (record?.role === "member" && record?.status === "pending_invite") {
          await supabase
            .from("users")
            .update({ status: "pending_profile" })
            .eq("id", user.id);
          return NextResponse.redirect(`${origin}/create-profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
