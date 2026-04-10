/**
 * Creates test@gmail.com with password 1234 as an active member.
 * Run: node --env-file=.env.local scripts/seed-test-user.mjs
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMAIL = "test@gmail.com";
const PASSWORD = "1234";

async function main() {
  // 1. Create auth user (or fetch existing)
  let userId;

  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === EMAIL);

  if (found) {
    console.log("User already exists, updating...");
    userId = found.id;
    await supabase.auth.admin.updateUserById(userId, { password: PASSWORD });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log("Auth user created:", userId);
  }

  // 2. Activate public.users record
  const { error: userErr } = await supabase
    .from("users")
    .update({
      status: "active",
      role: "member",
      member_tier: "gold",
      token_balance: 100,
      verification_status: "approved",
      last_active_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (userErr) throw userErr;
  console.log("User record activated.");

  // 3. Upsert profile
  const { error: profileErr } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        display_name: "Alex",
        bio: "A distinguished member of the guild. Discerning, private, always seeking exceptional company.",
        date_of_birth: "1988-06-15",
        location_city: "New York",
        location_country: "US",
        desires: ["Travel", "Fine Dining", "Art"],
        preferred_age_min: 26,
        preferred_age_max: 42,
        preferred_locations: ["New York", "London", "Miami"],
        preferred_interests: ["Travel", "Fine Dining", "Art", "Wellness"],
      },
      { onConflict: "user_id" }
    );

  if (profileErr) throw profileErr;
  console.log("Profile upserted.");

  console.log("\n✓ Done.");
  console.log("  email:    test@gmail.com");
  console.log("  password: 1234");
  console.log("  tier:     Gold Member");
  console.log("  tokens:   100");
}

main().catch((e) => { console.error(e); process.exit(1); });
