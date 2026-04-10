/**
 * Create DodoPayments products for The Midnight Guild.
 *
 * Run once after getting your DODO_SECRET_KEY:
 *   DODO_SECRET_KEY=<key> node scripts/setup-dodo-products.mjs
 *
 * Outputs .env.local lines to paste in.
 */

import DodoPayments from "dodopayments";

const key = process.env.DODO_SECRET_KEY;
if (!key) {
  console.error("Missing DODO_SECRET_KEY");
  process.exit(1);
}

const dodo = new DodoPayments({
  bearerToken: key,
  environment: "live_mode",
});

const PRODUCTS = [
  {
    envKey: "DODO_PRODUCT_GOLD",
    name: "Patron — Monthly",
    description: "The Midnight Guild Patron membership. One curated introduction daily, 5 Rose Tokens monthly.",
    price: {
      type: "recurring_price",
      currency: "USD",
      price: 9900,
      payment_frequency_count: 1,
      payment_frequency_interval: "Month",
      subscription_period_count: 1,
      subscription_period_interval: "Month",
      discount: 0,
      purchasing_power_parity: false,
    },
  },
  {
    envKey: "DODO_PRODUCT_PLATINUM",
    name: "Fellow — Monthly",
    description: "The Midnight Guild Fellow membership. Unlimited introductions, 20 Rose Tokens monthly, event access.",
    price: {
      type: "recurring_price",
      currency: "USD",
      price: 29900,
      payment_frequency_count: 1,
      payment_frequency_interval: "Month",
      subscription_period_count: 1,
      subscription_period_interval: "Month",
      discount: 0,
      purchasing_power_parity: false,
    },
  },
  {
    envKey: "DODO_PRODUCT_BLACK_CARD",
    name: "Principal — Monthly",
    description: "The Midnight Guild Principal membership. Personal matchmaking, 100 Rose Tokens monthly, dedicated host, personal liaison.",
    price: {
      type: "recurring_price",
      currency: "USD",
      price: 99900,
      payment_frequency_count: 1,
      payment_frequency_interval: "Month",
      subscription_period_count: 1,
      subscription_period_interval: "Month",
      discount: 0,
      purchasing_power_parity: false,
    },
  },
  {
    envKey: "DODO_PRODUCT_TOKENS_5",
    name: "5 Rose Tokens",
    description: "5 Rose Tokens for gifting and unlocking premium interactions.",
    price: {
      type: "one_time_price",
      currency: "USD",
      price: 500,
      discount: 0,
      purchasing_power_parity: false,
    },
  },
  {
    envKey: "DODO_PRODUCT_TOKENS_12",
    name: "12 Rose Tokens",
    description: "12 Rose Tokens — Standard pack, save 17%.",
    price: {
      type: "one_time_price",
      currency: "USD",
      price: 1000,
      discount: 0,
      purchasing_power_parity: false,
    },
  },
  {
    envKey: "DODO_PRODUCT_TOKENS_30",
    name: "30 Rose Tokens",
    description: "30 Rose Tokens — Premium pack, save 33%.",
    price: {
      type: "one_time_price",
      currency: "USD",
      price: 2000,
      discount: 0,
      purchasing_power_parity: false,
    },
  },
];

async function main() {
  console.log("Creating DodoPayments products for The Midnight Guild...\n");
  const results = [];

  for (const p of PRODUCTS) {
    try {
      console.log(`Creating: ${p.name}`);
      const product = await dodo.products.create({
        name: p.name,
        description: p.description,
        price: p.price,
        tax_category: "saas",
      });
      results.push({ envKey: p.envKey, productId: product.product_id, name: p.name });
      console.log(`  ✓ ${product.product_id}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log("\n--- Add these to your .env.local ---\n");
  for (const r of results) {
    console.log(`${r.envKey}=${r.productId}`);
  }
  console.log("\n--- Also add these to Vercel Environment Variables ---");
  console.log("(Settings → Environment Variables → Add each line above)\n");
}

main();
