// Tier configuration & Stripe price ID mapping

export const MEMBER_PRICES = {
  gold: {
    name: "Gold",
    priceId: process.env.STRIPE_PRICE_GOLD!,
    amount: 99,
    matchesPerDay: 1,
    monthlyTokens: 5,
  },
  platinum: {
    name: "Platinum",
    priceId: process.env.STRIPE_PRICE_PLATINUM!,
    amount: 299,
    matchesPerDay: 2,
    monthlyTokens: 20,
  },
  black_card: {
    name: "Black Card",
    priceId: process.env.STRIPE_PRICE_BLACK_CARD!,
    amount: 999,
    matchesPerDay: 3,
    monthlyTokens: 100,
  },
} as const;

export const MOMMY_PRICES = {
  standard: {
    name: "Standard",
    priceId: null,
    amount: 0,
    platformFeeRate: 0.3,
  },
  elite: {
    name: "Elite",
    priceId: process.env.STRIPE_PRICE_MOMMY_ELITE!,
    amount: 49,
    platformFeeRate: 0.25,
  },
  icon: {
    name: "Icon",
    priceId: process.env.STRIPE_PRICE_MOMMY_ICON!,
    amount: 149,
    platformFeeRate: 0.2,
  },
} as const;

export const TOKEN_PACKS = [
  { id: "pack_5", priceId: process.env.STRIPE_PRICE_TOKENS_5!, amount: 5, price: 5 },
  { id: "pack_12", priceId: process.env.STRIPE_PRICE_TOKENS_12!, amount: 12, price: 10 },
  { id: "pack_30", priceId: process.env.STRIPE_PRICE_TOKENS_30!, amount: 30, price: 20 },
] as const;

export const PLATFORM_FEE_RATES = {
  standard: 0.3,
  elite: 0.25,
  icon: 0.2,
} as const;

export type MemberTier = keyof typeof MEMBER_PRICES;
export type MommyTier = keyof typeof MOMMY_PRICES;
