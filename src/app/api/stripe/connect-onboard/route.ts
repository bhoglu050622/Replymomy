import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

export async function POST() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "sk_test_placeholder"
  ) {
    return NextResponse.json({
      url: "/mommy-dashboard?stub_connect=success",
    });
  }

  const { stripe } = await import("@/lib/stripe/server");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Check if user already has a Connect account
  const { data: userRecord } = await supabase
    .from("users")
    .select("stripe_connect_account_id")
    .eq("id", user!.id)
    .single();

  let accountId = userRecord?.stripe_connect_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: { transfers: { requested: true } },
      metadata: { supabase_user_id: user!.id },
    });
    accountId = account.id;
    await supabase
      .from("users")
      .update({ stripe_connect_account_id: accountId })
      .eq("id", user!.id);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl}/mommy-dashboard`,
    return_url: `${siteUrl}/mommy-dashboard?onboarded=true`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
