import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const investorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  investment_type: z.enum(["angel", "vc", "strategic", "friends_family", "other"]),
  investment_range: z.enum(["under_50l", "50l_250l", "250l_1cr", "1cr_plus"]),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = investorSchema.parse(body);

    const supabase = createAdminClient();
    const { error } = await supabase.from("investors").insert(data);

    if (error) {
      console.error("[investor/apply] DB error:", error.message);
      return NextResponse.json({ error: "Failed to submit." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
