export const SITE_CONFIG = {
  name: "ReplyMommy",
  tagline: "Where desire meets discretion.",
  description:
    "An invitation-only luxury connection platform for those who move differently.",
  url: "https://replymommy.com",
  socials: {
    twitter: "https://x.com/ReplyMommy",
    instagram: "https://instagram.com/replymommy",
  },
} as const;

export const MEMBERSHIP_TIERS = {
  member: {
    gold: { name: "Gold", price: 99, matchesPerDay: 1, tokens: 5 },
    platinum: { name: "Platinum", price: 299, matchesPerDay: 2, tokens: 20 },
    black_card: { name: "Black Card", price: 999, matchesPerDay: 3, tokens: 100 },
  },
  mommy: {
    standard: { name: "Standard", price: 0, matchesPerMonth: 10 },
    elite: { name: "Elite", price: 49, matchesPerMonth: -1 },
    icon: { name: "Icon", price: 149, matchesPerMonth: -1 },
  },
} as const;

export const PLATFORM_FEE_RATES = {
  standard: 0.3,
  elite: 0.25,
  icon: 0.2,
} as const;

export const TOKEN_PACKS = [
  { amount: 5, price: 5 },
  { amount: 12, price: 10 },
  { amount: 30, price: 20 },
] as const;
