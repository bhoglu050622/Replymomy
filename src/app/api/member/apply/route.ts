import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  age: z.number().int().min(21).max(75),
  city: z.string().min(2).max(100),
  occupation: z.string().min(2).max(150),
  income_bracket: z.enum(["200k_500k", "500k_1m", "1m_plus"]),
  motivation: z.string().min(20).max(2000),
  referral_source: z.string().max(200).optional(),
  gender: z.string().max(100).optional(),
  pronouns: z.string().max(50).optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const supabase = createAdminClient();

    // Duplicate-email guard
    const { data: existing } = await supabase
      .from("member_applications")
      .select("id, status")
      .eq("email", body.email)
      .maybeSingle();

    if (existing?.status === "pending" || existing?.status === "approved") {
      // Already have an application — skip re-insert but still advance the user
    } else {
      const { error } = await supabase
        .from("member_applications")
        .insert({
          email: body.email,
          full_name: body.full_name,
          age: body.age,
          city: body.city,
          occupation: body.occupation,
          income_bracket: body.income_bracket,
          motivation: body.motivation,
          photo_url: null,
          photo_urls: [],
          referral_source: body.referral_source ?? null,
          gender: body.gender ?? null,
          pronouns: body.pronouns ?? null,
          status: "approved",
        });

      if (error) {
        return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
      }
    }

    // Auto-activate: advance the user to pending_profile so they go straight
    // to profile creation instead of waiting for manual approval.
    await supabase
      .from("users")
      .update({ status: "pending_profile" })
      .eq("email", body.email)
      .in("status", ["pending_invite", "pending_profile"]);

    return NextResponse.json({ success: true, redirect: "/create-profile" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
