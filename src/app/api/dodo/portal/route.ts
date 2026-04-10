import { NextResponse } from "next/server";

// DodoPayments has no self-serve portal equivalent.
// Direct users to the subscription management page with cancel instructions.
export async function POST() {
  return NextResponse.json({
    url: "/settings/subscription?manage=true",
  });
}
