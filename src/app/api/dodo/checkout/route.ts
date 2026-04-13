import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";
import { isConfigured } from "@/lib/env";
import { getPostHogClient } from "@/lib/posthog-server";

const schema = z.object({
  productId: z.string(),
  mode: z.enum(["subscription", "payment"]).default("subscription"),
  tier: z.string().optional(),
  tokenAmount: z.number().optional(),
  giftId: z.string().optional(),
});

export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const body = schema.parse(await req.json());

    if (!isConfigured.dodo) {
      return NextResponse.json({
        url: "/settings/subscription?stub=success",
        session_id: "stub-session-id",
      });
    }

    const { data: userRecord } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", user!.id)
      .single();

    const { dodo } = await import("@/lib/dodo/server");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: body.productId, quantity: 1 }],
      customer: {
        email: userRecord?.email ?? user!.email!,
        name: userRecord?.full_name ?? undefined,
      },
      metadata: {
        userId: user!.id,
        ...(body.tier ? { tier: body.tier } : {}),
        ...(body.tokenAmount ? { tokenAmount: String(body.tokenAmount) } : {}),
        ...(body.giftId ? { giftId: body.giftId } : {}),
      },
      return_url: `${siteUrl}/join-confirmed?tier=${body.tier ?? ""}`,
      cancel_url: `${siteUrl}/settings/subscription`,
    });

    getPostHogClient().capture({
      distinctId: user!.id,
      event: "checkout_initiated",
      properties: {
        mode: body.mode,
        tier: body.tier ?? null,
        token_amount: body.tokenAmount ?? null,
      },
    });

    return NextResponse.json({ url: session.checkout_url, session_id: session.session_id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("[dodo/checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
