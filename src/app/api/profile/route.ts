import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().optional(),
  headline: z.string().max(80).optional(),
  desires: z.array(z.string()).max(12).optional(),
  photo_urls: z.array(z.string()).max(8).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location_city: z.string().max(100).optional(),
  location_country: z.string().max(100).optional(),
  preferred_age_min: z.number().int().min(18).max(80).optional(),
  preferred_age_max: z.number().int().min(18).max(80).optional(),
  preferred_interests: z.array(z.string()).optional(),
  preferred_locations: z.array(z.string()).optional(),
  preferred_member_tiers: z.array(z.string()).optional(),
  max_active_matches: z.number().int().min(1).max(99).optional(),
  response_commitment: z.string().optional(),
  show_online_status: z.boolean().optional(),
  show_last_active: z.boolean().optional(),
  allow_direct_messages: z.boolean().optional(),
  blur_photos_for_free: z.boolean().optional(),
  notification_preferences: z.record(z.string(), z.boolean()).optional(),
});

export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  if (error) return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function PUT(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const data = schema.parse(await req.json());

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: user!.id, ...data, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    // Advance onboarding status: pending_profile → pending_preferences
    const { data: userRecord } = await supabase
      .from("users")
      .select("status")
      .eq("id", user!.id)
      .single();

    if (userRecord?.status === "pending_profile") {
      await supabase
        .from("users")
        .update({ status: "pending_preferences" })
        .eq("id", user!.id);
    }

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
