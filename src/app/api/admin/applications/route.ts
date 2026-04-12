import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { user, supabase, response } = await requireAuth();
  if (response) return { user: null, response };
  const { data } = await supabase.from("users").select("role").eq("id", user!.id).single();
  if (data?.role !== "admin") {
    return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, response: null };
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("mommy_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ applications: data });
}

export async function PATCH(req: Request) {
  const { user, response } = await requireAdmin();
  if (response) return response;

  const { id, action } = await req.json(); // action: "approve" | "reject"
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === "reject") {
    await supabase
      .from("mommy_applications")
      .update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  // Fetch application details for email
  const { data: application } = await supabase
    .from("mommy_applications")
    .select("email, full_name")
    .eq("id", id)
    .single();

  // Approve: generate mommy invitation code
  const code = `MOMMY-RM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { error: codeErr } = await supabase
    .from("invitation_codes")
    .insert({ code, target_role: "mommy", max_uses: 1, created_by: user!.id });

  if (codeErr) return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });

  await supabase
    .from("mommy_applications")
    .update({
      status: "approved",
      invitation_code: code,
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Send approval email with invitation code (non-blocking)
  if (
    application?.email &&
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_placeholder"
  ) {
    const { resend } = await import("@/lib/resend/client");
    resend.emails
      .send({
        from: "The Midnight Guild <noreply@replymommy.com>",
        to: application.email,
        subject: "You've been accepted — The Midnight Guild",
        html: `<p>Dear ${application.full_name},</p>
               <p>We're delighted to welcome you to The Midnight Guild as a Mommy.</p>
               <p>Your invitation code: <strong>${code}</strong></p>
               <p>Use this code at sign-up to complete your onboarding.</p>
               <p style="font-style:italic;color:#C9A84C">— The Midnight Guild</p>`,
      })
      .catch((err: unknown) => {
        console.error("[admin/applications] approval email failed", err);
      });
  }

  return NextResponse.json({ success: true, code });
}
