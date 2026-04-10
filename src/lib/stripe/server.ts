import Stripe from "stripe";

// Lets the SDK pick its default pinned API version.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});
