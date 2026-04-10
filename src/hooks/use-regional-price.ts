"use client";
import { useCountry } from "./use-country";
import { REGIONAL_PRICES, PRICE_SENSITIVE } from "@/lib/dodo/prices";

export function useRegionalPrices() {
  const country = useCountry();
  return {
    prices: REGIONAL_PRICES[country] ?? REGIONAL_PRICES.DEFAULT,
    country,
    isRegional: PRICE_SENSITIVE.has(country),
  };
}
