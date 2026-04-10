import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

export async function POST() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
  ) {
    return NextResponse.json({ url: "/settings/subscription?stub=portal" });
  }

  const { data: userRecord } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .single();

  if (!userRecord?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 404 }
    );
  }

  const { stripe } = await import("@/lib/stripe/server");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: userRecord.stripe_customer_id,
    return_url: `${siteUrl}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
