import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  age: z.number().int().min(18).max(65),
  instagram: z.string().max(100).optional(),
  city: z.string().min(2).max(100),
  motivation: z.string().min(20).max(2000),
  photo_urls: z.array(z.string().url()).min(1).max(5),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const supabase = createAdminClient();

    // Check for duplicate application from same email
    const { data: existing } = await supabase
      .from("mommy_applications")
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
      .from("mommy_applications")
      .insert({
        email: body.email,
        full_name: body.full_name,
        age: body.age,
        instagram: body.instagram ?? null,
        city: body.city,
        motivation: body.motivation,
        photo_urls: body.photo_urls,
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
