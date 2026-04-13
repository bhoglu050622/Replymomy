/**
 * Seeds 20 realistic profiles from Bangalore — 10 mommies + 10 men.
 * These are "managed" profiles the admin can respond to via /admin/inbox.
 *
 * Usage: node --env-file=.env.local scripts/seed-bangalore-profiles.mjs
 *
 * Profiles are marked with response_commitment = "__managed__" so the admin
 * inbox can identify and operate them.
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Profile data ────────────────────────────────────────────────────────────

const MOMMIES = [
  {
    email: "priya.sharma.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Priya Sharma",
    headline: "Designing things that matter, one pixel at a time",
    bio: "UX designer at a Series B startup in Koramangala. I spend my days obsessing over human behaviour and my evenings on long drives to Nandi Hills. I have strong opinions about filter coffee, terrible taste in reality TV, and I cry at old Bollywood songs. Looking for someone who can keep up with both my pace and my silences.",
    date_of_birth: "1995-03-14",
    desires: ["Design", "Travel", "Music", "Coffee", "Hiking"],
    preferred_age_min: 28,
    preferred_age_max: 42,
    mommy_tier: "elite",
  },
  {
    email: "kavya.reddy.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Kavya Reddy",
    headline: "Marketing the world, one campaign at a time",
    bio: "Senior marketing lead at a global MNC in UB City. I've pitched in boardrooms in Singapore, Tokyo, and Mumbai — but nothing compares to a good conversation over biryani in Frazer Town. Sporadic reader, consistent overthinker. I like people who are straightforward and have opinions about things that actually matter.",
    date_of_birth: "1992-07-22",
    desires: ["Travel", "Fine Dining", "Literature", "Fitness", "Business"],
    preferred_age_min: 30,
    preferred_age_max: 45,
    mommy_tier: "icon",
  },
  {
    email: "ananya.krishnan.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Ananya Krishnan",
    headline: "Chasing light in places most don't notice",
    bio: "Freelance photographer with a studio in Indiranagar. I shoot weddings, portraits, and the occasional street series when the light does something extraordinary. I'm at my best at 6am and completely useless by 10pm. Looking for someone who respects quiet mornings and doesn't take themselves too seriously.",
    date_of_birth: "1997-11-05",
    desires: ["Photography", "Art", "Travel", "Nature", "Film"],
    preferred_age_min: 26,
    preferred_age_max: 40,
    mommy_tier: "standard",
  },
  {
    email: "meghna.nair.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Meghna Nair",
    headline: "Numbers by day, ocean by heart",
    bio: "Investment banker at a boutique firm in MG Road. I've closed deals worth more than I'll ever admit, but the thing I'm proudest of is finishing a triathlon in Goa last February. I'm direct, occasionally intimidating, and extremely loyal. I make exceptional appam on Sunday mornings.",
    date_of_birth: "1990-05-18",
    desires: ["Finance", "Fitness", "Travel", "Cooking", "Sailing"],
    preferred_age_min: 32,
    preferred_age_max: 48,
    mommy_tier: "icon",
  },
  {
    email: "shreya.iyer.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Shreya Iyer",
    headline: "Listening professionally, overthinking personally",
    bio: "Clinical psychologist with a private practice in Sadashivanagar. I help people untangle their minds for a living, which means I'm excellent at reading situations and terrible at watching thrillers — I always figure out the ending. I believe in slow dinners, honest conversations, and not checking your phone at the table.",
    date_of_birth: "1993-08-30",
    desires: ["Psychology", "Literature", "Wellness", "Music", "Art"],
    preferred_age_min: 29,
    preferred_age_max: 44,
    mommy_tier: "elite",
  },
  {
    email: "pooja.bhat.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Pooja Bhat",
    headline: "Feeding people is my love language",
    bio: "Food blogger and trained chef running a supper club out of my home in Basavanagudi. I've been to 22 countries and eaten in three Michelin-starred restaurants. I am impossibly stubborn about which neighbourhood has the best idlis (it's VV Puram, non-negotiable). I cook for anyone who sits at my table.",
    date_of_birth: "1996-01-12",
    desires: ["Food", "Travel", "Cooking", "Culture", "Wine"],
    preferred_age_min: 27,
    preferred_age_max: 40,
    mommy_tier: "standard",
  },
  {
    email: "divya.rao.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Divya Rao",
    headline: "Building systems. Avoiding small talk.",
    bio: "Staff engineer at a product company in Whitefield. I've shipped code used by twelve million people and still get excited when something compiles on the first try. I'm deeply introverted but genuinely curious — if you can talk about something with real depth, I'll follow that conversation anywhere. I collect vintage sci-fi novels and run half-marathons to justify my samosa habit.",
    date_of_birth: "1991-09-25",
    desires: ["Technology", "Science Fiction", "Running", "Books", "Chess"],
    preferred_age_min: 30,
    preferred_age_max: 42,
    mommy_tier: "elite",
  },
  {
    email: "tara.singh.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Tara Singh",
    headline: "Fashion is armour. Mine happens to look incredible.",
    bio: "Fashion designer with a label stocked in stores across Bangalore and Mumbai. I moved here from Ludhiana seven years ago with one suitcase and a very specific vision — the city didn't change me, I changed the city (a little). I think genuine warmth is the rarest quality in a person. I'm looking for exactly that.",
    date_of_birth: "1994-04-06",
    desires: ["Fashion", "Art", "Travel", "Music", "Dance"],
    preferred_age_min: 28,
    preferred_age_max: 43,
    mommy_tier: "standard",
  },
  {
    email: "nandini.kulkarni.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Nandini Kulkarni",
    headline: "Stillness is a practice, not a destination",
    bio: "Yoga teacher and co-founder of a wellness studio in Jayanagar. I've been practising for fifteen years and teaching for eight. I'm quiet in groups and extremely loud in the right company. I spent three months in Mysore studying Ashtanga and came back with stronger ankles and a very complicated relationship with silence. I want someone who can sit still.",
    date_of_birth: "1989-12-20",
    desires: ["Wellness", "Yoga", "Travel", "Nature", "Spirituality"],
    preferred_age_min: 32,
    preferred_age_max: 48,
    mommy_tier: "elite",
  },
  {
    email: "aditi.menon.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Aditi Menon",
    headline: "Literature PhD. Certified chaos. Excellent dinner company.",
    bio: "Third-year PhD student at NLSIU researching postcolonial fiction. I'm 26, chronically underpaid, and somehow still the most interesting person at most parties. I can talk about Rushdie, Coetzee, and mid-century Malayalam poetry. I cannot parallel park. If you're the type who finishes books and talks about them, please say hello.",
    date_of_birth: "1998-06-03",
    desires: ["Literature", "Writing", "Music", "Coffee", "Travel"],
    preferred_age_min: 25,
    preferred_age_max: 38,
    mommy_tier: "standard",
  },
];

const MEMBERS = [
  {
    email: "arjun.mehta.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Arjun Mehta",
    headline: "Building the third startup. The first two taught me everything.",
    bio: "Founder of a B2B SaaS company in HSR Layout, 40 people and growing. I'm a Chandigarh kid who ended up in Bangalore because of the startup ecosystem and stayed because of the weather. I work hard and take my time off seriously — usually involving a motorcycle and no signal. Looking for substance over small talk.",
    date_of_birth: "1988-02-14",
    desires: ["Entrepreneurship", "Motorcycles", "Travel", "Fitness", "Technology"],
    preferred_age_min: 26,
    preferred_age_max: 38,
    member_tier: "platinum",
  },
  {
    email: "karthik.subramanian.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Karthik Subramanian",
    headline: "Strategy by day. Carnatic music by night.",
    bio: "Senior consultant at a Big4 firm working on digital transformation projects. Born and raised in Chennai, transferred to Bangalore three years ago for a project and never left. I practise Carnatic violin on weekday evenings and take it mildly seriously. I'm good at listening and very bad at goodbyes.",
    date_of_birth: "1993-10-08",
    desires: ["Music", "Travel", "Business", "Food", "Cricket"],
    preferred_age_min: 25,
    preferred_age_max: 36,
    member_tier: "gold",
  },
  {
    email: "rohan.joshi.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Rohan Joshi",
    headline: "Product obsessed. Slightly too invested in coffee.",
    bio: "Director of Product at a unicorn-stage fintech in Koramangala. I've spent ten years building things people actually use. Outside work I'm a hobby cyclist — 80km on weekend mornings before most people wake up. I have a small balcony garden and three differing opinions on pour-over technique. I value directness and people who show up.",
    date_of_birth: "1986-04-17",
    desires: ["Technology", "Cycling", "Coffee", "Travel", "Design"],
    preferred_age_min: 27,
    preferred_age_max: 40,
    member_tier: "black_card",
  },
  {
    email: "vikram.nair.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Vikram Nair",
    headline: "Reading markets and people with equal interest.",
    bio: "Investment analyst at a family office managing a private equity portfolio. I moved from Kochi to IIM Ahmedabad to Bangalore, which is basically a cliché, and I own it. I read a lot — mostly history and economics — and have an inconvenient habit of fact-checking things. I am looking for genuine connection, not a transaction.",
    date_of_birth: "1991-12-01",
    desires: ["Finance", "History", "Travel", "Wine", "Cricket"],
    preferred_age_min: 26,
    preferred_age_max: 38,
    member_tier: "platinum",
  },
  {
    email: "siddharth.rao.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Siddharth Rao",
    headline: "Training models and running trails.",
    bio: "ML engineer at a deep tech company in Electronic City. Bengaluru born and bred — I know every shortcut and still choose the wrong one. I trail run on weekends and recently completed the Nilgiris Ultra. My conversational range spans from transformer architectures to the correct way to eat a masala dosa. I'm told I'm intense in a good way.",
    date_of_birth: "1995-07-23",
    desires: ["Technology", "Running", "Nature", "Science", "Food"],
    preferred_age_min: 24,
    preferred_age_max: 34,
    member_tier: "gold",
  },
  {
    email: "akash.sharma.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Akash Sharma",
    headline: "Building skylines and keeping a low profile.",
    bio: "Real estate developer focused on residential projects in North Bangalore. My family's been in construction for thirty years; I took it luxury. I'm understated in person and the exact opposite of my projects. I travel at least four times a year — usually somewhere remote — and I believe the best meals happen when nobody planned them.",
    date_of_birth: "1987-09-11",
    desires: ["Architecture", "Travel", "Food", "Art", "Polo"],
    preferred_age_min: 26,
    preferred_age_max: 40,
    member_tier: "black_card",
  },
  {
    email: "raj.kumar.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Raj Kumar",
    headline: "Cardiologist. Terrible at taking my own advice.",
    bio: "Interventional cardiologist at a private hospital in Rajajinagar. I spend my days making high-stakes decisions and my evenings utterly incapable of choosing what to watch. I grew up in Mysore and still think it's a better city — don't @ me. I run a small organic farm on weekends with my parents in Mandya. Prefer people who are warm before they're impressive.",
    date_of_birth: "1989-03-28",
    desires: ["Medicine", "Farming", "Running", "Classical Music", "Travel"],
    preferred_age_min: 27,
    preferred_age_max: 38,
    member_tier: "platinum",
  },
  {
    email: "dev.patel.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Dev Patel",
    headline: "Documentary filmmaker. Professional uncomfortable silence keeper.",
    bio: "Independent documentary filmmaker. My last film screened at MAMI and aired on a streaming platform I can't name due to NDA. I'm from Surat, moved to Pune for film school, then Bangalore for light and cost of living. I'm extremely easy to talk to and extremely difficult to categorise. If you've ever watched something and thought 'who made this and why' — hi.",
    date_of_birth: "1992-11-15",
    desires: ["Film", "Photography", "Travel", "Literature", "Music"],
    preferred_age_min: 25,
    preferred_age_max: 37,
    member_tier: "gold",
  },
  {
    email: "nikhil.agarwal.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Nikhil Agarwal",
    headline: "Consulting on weekdays. Escaping on weekends.",
    bio: "Management consultant working with leadership teams on organisational change. I've spent the last five years helping companies figure out what they actually want to do — the irony is not lost on me. I'm from Delhi but have been in Bangalore long enough to lose the accent and gain the startup paranoia. I scuba dive. I read fast. I argue well and concede even better.",
    date_of_birth: "1994-05-07",
    desires: ["Business", "Scuba Diving", "Travel", "Books", "Tennis"],
    preferred_age_min: 25,
    preferred_age_max: 36,
    member_tier: "platinum",
  },
  {
    email: "amit.verma.blr@replymommy.dev",
    password: "Guild2025!",
    display_name: "Amit Verma",
    headline: "Hospitality is not a job, it's a philosophy.",
    bio: "Owner of a boutique hotel in Coorg and a farm-to-table restaurant in Indiranagar. I spent eight years in London in hospitality before coming back to build something that felt like mine. I host well, travel slowly, and believe the best thing you can do for someone is feed them something extraordinary. Looking for someone who appreciates quality over quantity.",
    date_of_birth: "1986-08-22",
    desires: ["Food", "Travel", "Wine", "Hospitality", "Nature"],
    preferred_age_min: 27,
    preferred_age_max: 42,
    member_tier: "black_card",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function upsertProfile(profileData) {
  const { email, password, display_name, headline, bio, date_of_birth,
    desires, preferred_age_min, preferred_age_max,
    member_tier, mommy_tier } = profileData;

  const role = mommy_tier ? "mommy" : "member";

  // 1. Create or fetch auth user
  const { data: existingList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = existingList?.users?.find((u) => u.email === email);

  let userId;
  if (existing) {
    userId = existing.id;
    console.log(`  ↻ exists: ${email}`);
    await supabase.auth.admin.updateUserById(userId, { password });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`Auth create failed for ${email}: ${error.message}`);
    userId = data.user.id;
    console.log(`  + created: ${email} (${userId})`);
    // Wait for trigger to create public.users row
    await sleep(400);
  }

  // 2. Update public.users
  const userUpdate = {
    status: "active",
    role,
    token_balance: Math.floor(Math.random() * 80) + 20,
    verification_status: "approved",
    last_active_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
  };
  if (member_tier) userUpdate.member_tier = member_tier;
  if (mommy_tier) userUpdate.mommy_tier = mommy_tier;

  const { error: userErr } = await supabase
    .from("users")
    .update(userUpdate)
    .eq("id", userId);
  if (userErr) throw new Error(`User update failed for ${email}: ${userErr.message}`);

  // 3. Upsert profile (response_commitment = "__managed__" marks these as admin-operated)
  const { error: profileErr } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        display_name,
        headline,
        bio,
        date_of_birth,
        location_city: "Bangalore",
        location_country: "IN",
        desires,
        preferred_age_min,
        preferred_age_max,
        preferred_locations: ["Bangalore", "Mumbai", "Delhi", "Goa"],
        response_commitment: "__managed__",
      },
      { onConflict: "user_id" }
    );
  if (profileErr) throw new Error(`Profile upsert failed for ${email}: ${profileErr.message}`);

  return { userId, email, display_name, role };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding Bangalore profiles…\n");

  const created = [];

  console.log("── Mommies ──────────────────────────────────");
  for (const p of MOMMIES) {
    try {
      const result = await upsertProfile(p);
      created.push(result);
    } catch (err) {
      console.error(`  ✗ ${p.email}: ${err.message}`);
    }
  }

  console.log("\n── Members ──────────────────────────────────");
  for (const p of MEMBERS) {
    try {
      const result = await upsertProfile(p);
      created.push(result);
    } catch (err) {
      console.error(`  ✗ ${p.email}: ${err.message}`);
    }
  }

  // Save output
  const outputPath = new URL("./managed-profiles.json", import.meta.url).pathname;
  writeFileSync(outputPath, JSON.stringify(created, null, 2));

  console.log(`\n✓ Done. ${created.length}/20 profiles seeded.`);
  console.log(`  Saved to: scripts/managed-profiles.json`);
  console.log(`\n  Password for all accounts: Guild2025!`);
  console.log(`  All profiles marked __managed__ — visible in /admin/inbox`);
}

main().catch((e) => { console.error(e); process.exit(1); });
