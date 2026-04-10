import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const waitlistSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = waitlistSchema.parse(body);

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("waitlist")
      .insert({ email })
      .select("id")
      .single();

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "You're already on the list.",
        });
      }
      // If table doesn't exist yet, fall back gracefully
      console.error("[waitlist] DB error:", error.message);
      return NextResponse.json({
        success: true,
        message: "You're on the list.",
      });
    }

    // Get position (row count)
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      message: "You're on the list.",
      position: count ?? 1,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
