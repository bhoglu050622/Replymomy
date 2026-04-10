import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

export async function POST() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  if (
    !process.env.PERSONA_API_KEY ||
    process.env.PERSONA_API_KEY === "your-persona-api-key"
  ) {
    return NextResponse.json({
      inquiryId: "stub-inquiry-id",
      sessionToken: "stub-session-token",
    });
  }

  try {
    const res = await fetch("https://withpersona.com/api/v1/inquiries", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
        "Content-Type": "application/json",
        "Persona-Version": "2023-01-05",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            "inquiry-template-id": process.env.PERSONA_TEMPLATE_ID,
            "reference-id": user!.id,
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[persona] create inquiry failed:", err);
      return NextResponse.json(
        { error: "Verification service unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const inquiryId = data.data?.id as string;
    const sessionToken = data.data?.attributes?.["session-token"] as string;

    // Store inquiry ID on the user record
    await supabase
      .from("users")
      .update({
        persona_inquiry_id: inquiryId,
        verification_status: "pending",
      })
      .eq("id", user!.id);

    return NextResponse.json({ inquiryId, sessionToken });
  } catch {
    return NextResponse.json(
      { error: "Failed to start verification" },
      { status: 500 }
    );
  }
}
