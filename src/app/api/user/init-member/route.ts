import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// POST /api/user/init-member
// Advances a new member from pending_invite → pending_profile, skipping invite and KYC.
// Called right after email signUp() in non-email-confirmation mode.
// The callback route handles the same advancement for Google OAuth and confirmation flows.
export async function POST() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  await supabase
    .from("users")
    .update({ status: "pending_profile" })
    .eq("id", user.id)
    .eq("role", "member")         // never advance mommies
    .eq("status", "pending_invite"); // idempotent — only acts on fresh signups

  return NextResponse.json({ ok: true });
}
