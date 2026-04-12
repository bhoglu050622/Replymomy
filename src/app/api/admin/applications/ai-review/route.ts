import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewApplication, reviewMemberApplication } from "@/lib/ai/gemini";

async function requireAdmin() {
  const { user, supabase, response } = await requireAuth();
  if (response) return { error: response };
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (userRecord?.role !== "admin")
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { admin: createAdminClient(), userId: user!.id };
}

const schema = z.object({
  applicationId: z.string().uuid(),
  type: z.enum(["mommy", "member"]).default("mommy"),
});

export async function POST(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;
  const { admin } = result;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  let applicationId: string;
  let type: "mommy" | "member";
  try {
    ({ applicationId, type } = schema.parse(await req.json()));
  } catch {
    return NextResponse.json({ error: "applicationId (UUID) required" }, { status: 400 });
  }

  if (type === "member") {
    const { data: app, error: fetchError } = await admin
      .from("member_applications")
      .select("full_name, age, city, occupation, income_bracket, motivation")
      .eq("id", applicationId)
      .single();

    if (fetchError || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    try {
      const review = await reviewMemberApplication({
        full_name: app.full_name,
        age: app.age,
        city: app.city,
        occupation: app.occupation,
        income_bracket: app.income_bracket,
        motivation: app.motivation,
      });

      await admin
        .from("member_applications")
        .update({ ai_review: review })
        .eq("id", applicationId);

      return NextResponse.json({ review });
    } catch (err) {
      console.error("[ai-review/member]", err);
      return NextResponse.json({ error: "AI review failed" }, { status: 502 });
    }
  }

  // Mommy review (original behaviour)
  const { data: app, error: fetchError } = await admin
    .from("mommy_applications")
    .select("full_name, age, city, instagram, motivation")
    .eq("id", applicationId)
    .single();

  if (fetchError || !app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  try {
    const review = await reviewApplication({
      full_name: app.full_name,
      age: app.age,
      city: app.city,
      instagram: app.instagram ?? null,
      motivation: app.motivation,
    });

    await admin
      .from("mommy_applications")
      .update({ ai_review: review })
      .eq("id", applicationId);

    return NextResponse.json({ review });
  } catch (err) {
    console.error("[ai-review/mommy]", err);
    return NextResponse.json({ error: "AI review failed" }, { status: 502 });
  }
}
