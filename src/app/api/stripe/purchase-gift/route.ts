import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  giftId: z.string(),
  recipientId: z.string(),
  message: z.string().max(280).optional(),
  isAnonymous: z.boolean().default(false),
});

export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const data = schema.parse(await req.json());

    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.json({
        success: true,
        clientSecret: "stub_pi_secret",
        ...data,
      });
    }

    // Look up gift and recipient Connect account
    const [{ data: gift }, { data: recipient }] = await Promise.all([
      supabase.from("gift_catalog").select("*").eq("id", data.giftId).single(),
      supabase
        .from("users")
        .select("stripe_connect_account_id")
        .eq("id", data.recipientId)
        .single(),
    ]);

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    const { stripe } = await import("@/lib/stripe/server");

    const { data: userRecord } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user!.id)
      .single();

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

    const platformFee = Math.round(gift.price_cents * 0.2);

    const paymentIntentParams: Parameters<typeof stripe.paymentIntents.create>[0] =
      {
        amount: gift.price_cents,
        currency: "usd",
        customer: customerId,
        metadata: {
          giftId: data.giftId,
          senderId: user!.id,
          recipientId: data.recipientId,
          message: data.message ?? "",
        },
      };

    if (recipient?.stripe_connect_account_id) {
      paymentIntentParams.application_fee_amount = platformFee;
      paymentIntentParams.transfer_data = {
        destination: recipient.stripe_connect_account_id,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
