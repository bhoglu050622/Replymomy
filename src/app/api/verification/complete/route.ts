import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/verification/complete — called after Persona widget completes.
// Updates user status from pending_verification → pending_profile.
export async function POST() {
  const { user, response } = await requireAuth();
  if (response) return response;

  const admin = createAdminClient();

  const { error } = await admin
    .from("users")
    .update({
      verification_status: "approved",
      status: "pending_profile",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user!.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
