import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/supabase/require-auth";

const schema = z.object({
  packId: z.string(),
});

export async function POST(req: Request) {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  try {
    const { packId } = schema.parse(await req.json());

    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
    ) {
      return NextResponse.json({ url: `/tokens?stub_purchase=${packId}` });
    }

    const { stripe } = await import("@/lib/stripe/server");
    const { TOKEN_PACKS } = await import("@/lib/stripe/prices");
    const pack = TOKEN_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json({ error: "Unknown pack" }, { status: 400 });
    }

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: pack.priceId, quantity: 1 }],
      metadata: { userId: user!.id, tokenAmount: String(pack.amount) },
      success_url: `${siteUrl}/tokens?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/tokens`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
