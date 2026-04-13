// DodoPayments product IDs — populated by scripts/setup-dodo-products.mjs
export const DODO_PRODUCTS = {
  // Active tiers (shown in UI)
  pro: {
    productId: process.env.DODO_PRODUCT_PRO ?? "",
    name: "Pro",
    tier: "pro" as const,
    tokens: 10,
    matches: 1,  // 1 curated match/day
    price: 8,
  },
  unlimited: {
    productId: process.env.DODO_PRODUCT_UNLIMITED ?? "",
    name: "Unlimited",
    tier: "unlimited" as const,
    tokens: 50,
    matches: -1, // unlimited curated matches
    price: 25,
  },
  // Legacy tiers — kept for existing subscribers; not shown in UI
  gold: {
    productId: process.env.DODO_PRODUCT_GOLD ?? "",
    name: "Patron",
    tier: "gold" as const,
    tokens: 50,
    matches: 1,
    price: 99,
  },
  platinum: {
    productId: process.env.DODO_PRODUCT_PLATINUM ?? "",
    name: "Fellow",
    tier: "platinum" as const,
    tokens: 150,
    matches: 2,
    price: 299,
  },
  black_card: {
    productId: process.env.DODO_PRODUCT_BLACK_CARD ?? "",
    name: "Principal",
    tier: "black_card" as const,
    tokens: 500,
    matches: -1,
    price: 999,
  },
};

export const TOKEN_PACKS = [
  {
    id: "tokens_5",
    label: "Intro",
    tokens: 5,
    price: 5,
    productId: process.env.DODO_PRODUCT_TOKENS_5 ?? "",
  },
  {
    id: "tokens_12",
    label: "Standard",
    tokens: 12,
    price: 10,
    savings: "Save 17%",
    productId: process.env.DODO_PRODUCT_TOKENS_12 ?? "",
  },
  {
    id: "tokens_30",
    label: "Premium",
    tokens: 30,
    price: 20,
    savings: "Save 33%",
    featured: true,
    productId: process.env.DODO_PRODUCT_TOKENS_30 ?? "",
  },
];

// Regional price display (UI only — DodoPayments handles actual billing currency via PPP)
// India gets ₹499/₹1,499. Global gets $7.99/$24.99. Other regions priced by PPP.
export const REGIONAL_PRICES: Record<
  string,
  { pro: string; unlimited: string; tokens_5: string; tokens_12: string; tokens_30: string; currency: string }
> = {
  IN:      { pro: "₹499",      unlimited: "₹1,499",    tokens_5: "₹199",     tokens_12: "₹399",    tokens_30: "₹799",    currency: "INR" },
  NP:      { pro: "Rs 699",    unlimited: "Rs 2,099",  tokens_5: "Rs 269",   tokens_12: "Rs 549",  tokens_30: "Rs 1,099", currency: "NPR" },
  PK:      { pro: "Rs 1,799",  unlimited: "Rs 5,499",  tokens_5: "Rs 549",   tokens_12: "Rs 1,099", tokens_30: "Rs 2,199", currency: "PKR" },
  BD:      { pro: "৳699",      unlimited: "৳2,199",    tokens_5: "৳219",     tokens_12: "৳449",    tokens_30: "৳899",    currency: "BDT" },
  ID:      { pro: "Rp 49K",    unlimited: "Rp 149K",   tokens_5: "Rp 14.9K", tokens_12: "Rp 29K",  tokens_30: "Rp 59K",  currency: "IDR" },
  PH:      { pro: "₱449",      unlimited: "₱1,399",    tokens_5: "₱139",     tokens_12: "₱279",    tokens_30: "₱549",    currency: "PHP" },
  MY:      { pro: "RM99",      unlimited: "RM299",     tokens_5: "RM29",     tokens_12: "RM59",    tokens_30: "RM119",   currency: "MYR" },
  VN:      { pro: "₫ 649K",    unlimited: "₫ 1.99M",  tokens_5: "₫ 199K",  tokens_12: "₫ 399K",  tokens_30: "₫ 799K",  currency: "VND" },
  DEFAULT: { pro: "$7.99",     unlimited: "$24.99",    tokens_5: "$5",       tokens_12: "$9.99",   tokens_30: "$19.99",  currency: "USD" },
};

// PRICE_SENSITIVE_COUNTRIES — show "Locally priced" badge
export const PRICE_SENSITIVE = new Set(["IN", "NP", "PK", "BD", "ID", "PH", "MY", "VN"]);

// MEMBER_PRICES for profile/display compatibility
export const MEMBER_PRICES = {
  pro:        { name: "Pro",       amount: 8,   tokens: 10,  matches: 1  },
  unlimited:  { name: "Unlimited", amount: 25,  tokens: 50,  matches: -1 },
  // Legacy — kept for existing subscribers
  gold:       { name: "Patron",    amount: 99,  tokens: 50,  matches: 1  },
  platinum:   { name: "Fellow",    amount: 299, tokens: 150, matches: 2  },
  black_card: { name: "Principal", amount: 999, tokens: 500, matches: -1 },
} as const;

export type MemberTier = keyof typeof MEMBER_PRICES;
