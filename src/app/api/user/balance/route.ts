import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/require-auth";

export async function GET() {
  const { user, supabase, response } = await requireAuth();
  if (response) return response;

  const { data, error } = await supabase
    .from("users")
    .select("token_balance, member_tier, role")
    .eq("id", user!.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ balance: 0, tier: null, role: null });
  }

  return NextResponse.json({
    balance: data.token_balance ?? 0,
    tier: data.member_tier ?? null,
    role: data.role ?? null,
  });
}
