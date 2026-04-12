import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac } from "crypto";

// Persona webhook handler — receives inquiry status updates and updates verification_status.
export async function POST(req: Request) {
  const body = await req.text();

  // Verify Persona webhook signature
  const signature = req.headers.get("Persona-Signature");
  const secret = process.env.PERSONA_WEBHOOK_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV !== "development") {
      console.error("[verification/webhook] PERSONA_WEBHOOK_SECRET is not set — rejecting all Persona webhooks in production.");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    // In dev without a secret, allow through for local testing.
  } else {
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    const parts = Object.fromEntries(
      signature.split(",").map((p) => p.split("=") as [string, string])
    );
    const timestamp = parts["t"];
    const expected = createHmac("sha256", secret)
      .update(`${timestamp}.${body}`)
      .digest("hex");

    if (parts["v1"] !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const attributes =
    (payload?.data as Record<string, unknown>)?.attributes ?? {};
  const inquiryStatus = (
    (attributes as Record<string, unknown>)?.payload as Record<string, unknown>
  )?.data;
  const status = (
    (inquiryStatus as Record<string, unknown>)?.attributes as Record<
      string,
      unknown
    >
  )?.status as string | undefined;

  const referenceId = (
    (inquiryStatus as Record<string, unknown>)?.attributes as Record<
      string,
      unknown
    >
  )?.["reference-id"] as string | undefined;

  if (!referenceId || !status) {
    return NextResponse.json({ received: true });
  }

  const statusMap: Record<string, string> = {
    completed: "approved",
    failed: "declined",
    "needs_review": "needs_review",
    pending: "pending",
  };

  const verificationStatus = statusMap[status] ?? "pending";

  const supabase = createAdminClient();
  await supabase
    .from("users")
    .update({ verification_status: verificationStatus })
    .eq("id", referenceId);

  return NextResponse.json({ received: true });
}
