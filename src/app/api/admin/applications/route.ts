import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/require-admin-api";

export async function GET(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { admin } = result;

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "mommy") as "mommy" | "member";

  const memberCols =
    "id, email, full_name, age, city, occupation, income_bracket, motivation, referral_source, status, reviewed_by, reviewed_at, invitation_code, ai_review, created_at, gender, pronouns";
  const mommyCols =
    "id, email, full_name, age, instagram, city, motivation, status, reviewed_by, reviewed_at, invitation_code, ai_review, created_at, gender, pronouns";

  if (type === "member") {
    const { data, error } = await admin
      .from("member_applications")
      .select(memberCols)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
    return NextResponse.json({ applications: data });
  }

  const { data, error } = await admin
    .from("mommy_applications")
    .select(mommyCols)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ applications: data });
}

export async function PATCH(req: Request) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { user, admin } = result;

  const { id, action, type = "mommy" } = await req.json();
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const table = type === "member" ? "member_applications" : "mommy_applications";

  if (action === "reject") {
    await admin
      .from(table)
      .update({ status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: true });
  }

  // Fetch application details for email
  const { data: application } = await admin
    .from(table)
    .select("email, full_name")
    .eq("id", id)
    .single();

  // Approve: generate invitation code
  const codePrefix = type === "member" ? "GOLD-RM" : "MOMMY-RM";
  const code = `${codePrefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const targetRole = type === "member" ? "member" : "mommy";

  const { error: codeErr } = await admin
    .from("invitation_codes")
    .insert({ code, target_role: targetRole, max_uses: 1, created_by: user.id });

  if (codeErr) return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });

  await admin
    .from(table)
    .update({
      status: "approved",
      invitation_code: code,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Send approval email (non-blocking)
  if (
    application?.email &&
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_placeholder"
  ) {
    const { resend } = await import("@/lib/resend/client");

    const subject =
      type === "member"
        ? "Your invitation to The Midnight Guild"
        : "You've been accepted — The Midnight Guild";

    const html =
      type === "member"
        ? `<p>Dear ${application.full_name},</p>
           <p>We're delighted to welcome you to The Midnight Guild.</p>
           <p>Your invitation code: <strong>${code}</strong></p>
           <p>Use this code at sign-up to complete your onboarding.</p>
           <p style="font-style:italic;color:#C9A84C">— The Midnight Guild</p>`
        : `<p>Dear ${application.full_name},</p>
           <p>We're delighted to welcome you to The Midnight Guild as a Mommy.</p>
           <p>Your invitation code: <strong>${code}</strong></p>
           <p>Use this code at sign-up to complete your onboarding.</p>
           <p style="font-style:italic;color:#C9A84C">— The Midnight Guild</p>`;

    resend.emails
      .send({
        from: "The Midnight Guild <noreply@replymommy.com>",
        to: application.email,
        subject,
        html,
      })
      .catch((err: unknown) => {
        console.error("[admin/applications] approval email failed", err);
      });
  }

  return NextResponse.json({ success: true, code });
}
