import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

// GET /api/gifts/catalog — returns the gift catalog from the database.
export async function GET() {
  const { supabase, response } = await requireAuth();
  if (response) return response;

  const { data, error } = await supabase
    .from("gift_catalog")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    // Fall back to static catalog if table doesn't exist yet
    return NextResponse.json({
      gifts: [
        { id: "1", name: "Single Rose", type: "virtual", price_cents: 500, token_cost: 5 },
        { id: "2", name: "Champagne Toast", type: "virtual", price_cents: 1500, token_cost: 15 },
        { id: "3", name: "Diamond Whisper", type: "virtual", price_cents: 2500, token_cost: 25 },
        { id: "4", name: "Bouquet of Peonies", type: "irl", price_cents: 7500, token_cost: null },
        { id: "5", name: "Vintage Champagne", type: "irl", price_cents: 25000, token_cost: null },
        { id: "6", name: "Cartier Trinity", type: "irl", price_cents: 50000, token_cost: null },
      ],
    });
  }

  return NextResponse.json({ gifts: data });
}
