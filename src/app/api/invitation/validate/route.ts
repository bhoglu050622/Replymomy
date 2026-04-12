import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  code: z.string().min(4).max(50),
});

export async function POST(req: Request) {
  try {
    const { code } = schema.parse(await req.json());

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("validate_invitation_code", {
      p_code: code,
    });

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { valid: false, error: "This code is not valid." },
        { status: 400 }
      );
    }

    const result = data[0];
    return NextResponse.json({
      valid: true,
      codeId: result.code_id,
      targetRole: result.target_role,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: "Invalid code format." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { valid: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
