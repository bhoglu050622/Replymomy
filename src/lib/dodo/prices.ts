// DodoPayments product IDs — populated by scripts/setup-dodo-products.mjs
export const DODO_PRODUCTS = {
  gold: {
    productId: process.env.DODO_PRODUCT_GOLD ?? "",
    name: "Patron",
    tier: "gold" as const,
    tokens: 50,
    matches: 3,
    price: 99,
  },
  platinum: {
    productId: process.env.DODO_PRODUCT_PLATINUM ?? "",
    name: "Fellow",
    tier: "platinum" as const,
    tokens: 150,
    matches: 7,
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

// Regional price display (UI only — DodoPayments handles actual billing currency)
export const REGIONAL_PRICES: Record<
  string,
  { gold: string; platinum: string; black_card: string; tokens_5: string; currency: string }
> = {
  IN: { gold: "₹1,999", platinum: "₹5,999", black_card: "₹19,999", tokens_5: "₹199", currency: "INR" },
  NP: { gold: "Rs 2,699", platinum: "Rs 7,999", black_card: "Rs 26,999", tokens_5: "Rs 269", currency: "NPR" },
  PK: { gold: "Rs 5,599", platinum: "Rs 16,999", black_card: "Rs 55,999", tokens_5: "Rs 549", currency: "PKR" },
  BD: { gold: "৳2,199", platinum: "৳6,599", black_card: "৳21,999", tokens_5: "৳219", currency: "BDT" },
  ID: { gold: "Rp 149K", platinum: "Rp 449K", black_card: "Rp 1.49M", tokens_5: "Rp 14.9K", currency: "IDR" },
  PH: { gold: "₱1,399", platinum: "₱4,199", black_card: "₱13,999", tokens_5: "₱139", currency: "PHP" },
  MY: { gold: "RM299", platinum: "RM899", black_card: "RM2,999", tokens_5: "RM29", currency: "MYR" },
  VN: { gold: "₫ 1.99M", platinum: "₫ 5.99M", black_card: "₫ 19.9M", tokens_5: "₫ 199K", currency: "VND" },
  DEFAULT: { gold: "$99", platinum: "$299", black_card: "$999", tokens_5: "$5", currency: "USD" },
};

// PRICE_SENSITIVE_COUNTRIES — show "Locally priced" badge
export const PRICE_SENSITIVE = new Set(["IN", "NP", "PK", "BD", "ID", "PH", "MY", "VN"]);

// MEMBER_PRICES kept for profile/display compatibility
export const MEMBER_PRICES = {
  gold: { name: "Patron", amount: 99, tokens: 50, matches: 3 },
  platinum: { name: "Fellow", amount: 299, tokens: 150, matches: 7 },
  black_card: { name: "Principal", amount: 999, tokens: 500, matches: -1 },
} as const;

export type MemberTier = keyof typeof MEMBER_PRICES;
