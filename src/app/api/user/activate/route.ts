import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// POST /api/user/activate — called after preferences are saved.
// Advances user status to 'active' and sends welcome email.
export async function POST() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  // RLS policy users_update_own allows this without admin client
  const { error } = await supabase
    .from("users")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", user!.id);

  if (error) {
    return NextResponse.json({ error: "Failed to activate account" }, { status: 500 });
  }

  // Fetch profile for welcome email (non-blocking if missing)
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user!.id)
    .single();

  // Send welcome email (non-blocking)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder") {
    try {
      const { resend } = await import("@/lib/resend/client");
      const { welcomeEmailHtml } = await import("@/lib/resend/welcome-email");
      const { data: userRecord } = await supabase
        .from("users")
        .select("email")
        .eq("id", user!.id)
        .single();

      if (userRecord?.email && profile?.display_name) {
        await resend.emails.send({
          from: "ReplyMommy <hello@replymommy.com>",
          to: userRecord.email,
          subject: "You're in.",
          html: welcomeEmailHtml(profile.display_name),
        });
      }
    } catch {
      // Email failure is non-blocking
    }
  }

  return NextResponse.json({ success: true });
}
