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
  gender: z.string().max(100).optional(),
  pronouns: z.string().max(50).optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const supabase = createAdminClient();

    // Duplicate-email guard
    const { data: existing } = await supabase
      .from("mommy_applications")
      .select("id, status")
      .eq("email", body.email)
      .maybeSingle();

    if (existing?.status === "pending" || existing?.status === "approved") {
      // Already have an application — skip re-insert but still advance the user
    } else {
      const { error } = await supabase
        .from("mommy_applications")
        .insert({
          email: body.email,
          full_name: body.full_name,
          age: body.age,
          instagram: body.instagram ?? null,
          city: body.city,
          motivation: body.motivation,
          photo_urls: [],
          gender: body.gender ?? null,
          pronouns: body.pronouns ?? null,
          status: "approved",
        });

      if (error) {
        return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
      }
    }

    // Auto-activate: advance the user to pending_profile and set role to mommy
    // so they go straight to mommy profile creation instead of waiting for review.
    await supabase
      .from("users")
      .update({ status: "pending_profile", role: "mommy" })
      .eq("email", body.email)
      .in("status", ["pending_invite", "pending_profile"]);

    return NextResponse.json({ success: true, redirect: "/mommy-profile" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
