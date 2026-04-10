import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  priceId: z.string(),
  mode: z.enum(["subscription", "payment"]).default("subscription"),
});

export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const { priceId, mode } = schema.parse(await req.json());

    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.json({
        url: "/dashboard?stub_checkout=success",
        sessionId: "stub-session-id",
      });
    }

    // Get or resolve Stripe customer ID
    const { data: userRecord } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user!.id)
      .single();

    const { stripe } = await import("@/lib/stripe/server");

    let customerId = userRecord?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userRecord?.email ?? user!.email,
        metadata: { supabase_user_id: user!.id },
      });
      customerId = customer.id;
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user!.id);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user!.id },
      success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/settings/subscription`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
