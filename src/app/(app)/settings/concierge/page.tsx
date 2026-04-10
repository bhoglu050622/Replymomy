import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConciergeChat } from "./concierge-chat";

export default async function ConciergePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userRecord } = await supabase
    .from("users")
    .select("member_tier")
    .eq("id", user!.id)
    .single();

  if (userRecord?.member_tier !== "black_card") {
    redirect("/settings/subscription");
  }

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="text-label text-champagne mb-3">Principal Exclusive</div>
        <h1 className="text-display-lg text-ivory mb-2">
          Your <span className="italic text-champagne">liaison.</span>
        </h1>
        <p className="text-body-sm text-ivory/50 max-w-lg">
          Available around the clock. Handles scheduling, discretion management, and any communication
          needs between you and your match.
        </p>
      </div>

      <div className="rounded-2xl border border-champagne/20 bg-smoke overflow-hidden" style={{ minHeight: 480 }}>
        <ConciergeChat userId={user!.id} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {["Scheduling", "Discretion", "Mediation"].map((item) => (
          <div
            key={item}
            className="p-4 rounded-2xl bg-smoke border border-champagne/10 text-center"
          >
            <div className="text-label text-champagne">{item}</div>
            <div className="text-body-sm text-ivory/40 mt-1">Always available</div>
          </div>
        ))}
      </div>
    </div>
  );
}
