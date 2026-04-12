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
  photo_url: z.string().url().optional(),
  referral_source: z.string().max(200).optional(),
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

    if (existing) {
      if (existing.status === "pending") {
        return NextResponse.json(
          { error: "An application from this email is already under review." },
          { status: 409 }
        );
      }
      if (existing.status === "approved") {
        return NextResponse.json(
          { error: "This email has already been approved. Check your inbox for your invitation code." },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("member_applications")
      .insert({
        email: body.email,
        full_name: body.full_name,
        age: body.age,
        city: body.city,
        occupation: body.occupation,
        income_bracket: body.income_bracket,
        motivation: body.motivation,
        photo_url: body.photo_url ?? null,
        referral_source: body.referral_source ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
    }

    return NextResponse.json({ success: true, applicationId: data.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
