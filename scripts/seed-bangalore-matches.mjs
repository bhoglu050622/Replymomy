/**
 * seed-bangalore-matches.mjs
 * Creates mutual matches between the 20 Bangalore seed profiles
 * and seeds realistic opening messages for each conversation.
 *
 * Run: node --env-file=.env.local scripts/seed-bangalore-matches.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const profiles = JSON.parse(
  readFileSync(new URL("./managed-profiles.json", import.meta.url), "utf8")
);

const mommies = profiles.filter((p) => p.role === "mommy");
const members = profiles.filter((p) => p.role === "member");

// Pair each mommy with a member (10 pairs, 1:1)
const pairs = mommies.map((mommy, i) => ({
  mommy,
  member: members[i % members.length],
}));

// Realistic opening message sets (member sends first, mommy replies, back-and-forth)
const conversations = [
  [
    { from: "member", text: "Hey Priya! I saw your profile and really loved how you described your approach to design. Would love to know more about what kind of connection you're looking for here." },
    { from: "mommy", text: "Hi Arjun! That's a lovely opener. Honestly I'm looking for someone who's ambitious but also emotionally present. Startup guys tend to be all hustle — are you any different? 😄" },
    { from: "member", text: "Ha, fair question! I've learned the hard way that being present matters more than being busy. Coffee sometime? I'd love to hear about your UX work too." },
    { from: "mommy", text: "I like that answer. Let's plan for the weekend — Indiranagar has some lovely spots." },
  ],
  [
    { from: "member", text: "Kavya, your marketing background is super impressive. I'm curious — do you think personal brand matters as much as company brand?" },
    { from: "mommy", text: "Oh absolutely! Personal brand is the moat. Company brand rents attention, personal brand owns it. You clearly think about this — what do you do, Karthik?" },
    { from: "member", text: "Strategy consulting — so I basically live in decks and frameworks haha. But I'm working on changing that narrative." },
    { from: "mommy", text: "Frameworks can be sexy if the person behind them is interesting. You might just be interesting 😏" },
  ],
  [
    { from: "member", text: "Ananya! I went through your profile twice. A photographer who also writes poetry — that's rare. What kind of stories do you like to capture?" },
    { from: "mommy", text: "Rohan! I love people who notice details. I gravitate toward in-between moments — the pause before someone laughs, the glance across a table. Human stuff." },
    { from: "member", text: "That's beautiful. Makes me want to be more intentional about how I move through the day. Would love to see your work sometime." },
    { from: "mommy", text: "Come to my next exhibition then. It's next month in Koramangala — small gallery, intimate crowd. Very 'us' energy." },
  ],
  [
    { from: "member", text: "Meghna — an investment banker who reads philosophy. You're a walking contradiction and I mean that as a compliment." },
    { from: "mommy", text: "Ha! Vikram, most people find that confusing. Markets are just applied human psychology at scale — philosophy helps me understand both." },
    { from: "member", text: "That's genuinely one of the most compelling things I've heard someone say about finance. What's on your bedside table right now?" },
    { from: "mommy", text: "Nassim Taleb's Antifragile and a dog-eared copy of Meditations. You?" },
    { from: "member", text: "Skin in the Game and a business memoir I haven't opened in three weeks. We might be compatible 😄" },
  ],
  [
    { from: "member", text: "Shreya, I've been thinking about this match since it appeared. A psychologist who's into travel — I bet you read people as easily as boarding passes." },
    { from: "mommy", text: "Siddharth! I try not to psychoanalyze dates, I promise 😅 But yes, you get comfortable reading ambiguity quickly when you travel alone. What draws you to this platform?" },
    { from: "member", text: "Honestly? I want something with depth. Dating apps feel like catalogues. This feels more curated." },
    { from: "mommy", text: "Good answer. The curation is real. So is the intent — I'm not here for small talk." },
  ],
  [
    { from: "member", text: "Pooja! I follow three food blogs and none of them write the way yours does. The one about your grandmother's biryani made me genuinely emotional." },
    { from: "mommy", text: "Akash!! That post took me forever to write. I didn't expect anyone to say that. You actually read it?" },
    { from: "member", text: "Twice. You write food as memory and I think that's rare. I'd love to cook with you sometime — I'm decent with South Indian." },
    { from: "mommy", text: "Oh we're cooking together? Bold for a first conversation 😂 But honestly, yes. Someone who cooks is automatically interesting to me." },
  ],
  [
    { from: "member", text: "Divya, a staff engineer at Flipkart — that's genuinely impressive. I'm in real estate so I'm fascinated by builders of any kind. What are you working on?" },
    { from: "mommy", text: "Raj! Payments infrastructure — nothing glamorous but it affects millions of transactions daily. What kind of real estate? Residential or commercial?" },
    { from: "member", text: "Mostly luxury residential in Whitefield and HSR. I like building things that last. We might have more in common than it seems." },
    { from: "mommy", text: "Infrastructure and architecture — I like this framing. Tell me more over a drink?" },
  ],
  [
    { from: "member", text: "Tara! Fashion designer in Bangalore — I didn't know we had that here honestly. What's your aesthetic?" },
    { from: "mommy", text: "Dev! So much happens here, people just don't look 😄 I do structured minimalism — think Bangalore weather meets Japanese craft. And you make films?" },
    { from: "member", text: "Documentaries mostly. Right now I'm working on something about artisan crafts in Karnataka — which means I might want to interview you." },
    { from: "mommy", text: "Ha! I've been waiting for someone to notice this intersection. Yes, let's talk — professionally and otherwise." },
  ],
  [
    { from: "member", text: "Nandini, yoga teacher and wellness blogger — I like that you've built a real community. What does a perfect Sunday look like for you?" },
    { from: "mommy", text: "Nikhil! Morning practice on the terrace, farmers market with a friend, a long lunch, no screens after 4pm. You?" },
    { from: "member", text: "Honestly? A run, a long brunch with someone interesting, and a film in the evening. I think our Sundays could overlap nicely." },
    { from: "mommy", text: "I appreciate a man who's thought about his ideal day. Most people can't answer that question. Promising 🙂" },
  ],
  [
    { from: "member", text: "Aditi! A PhD in cognitive science — I feel like I should be nervous talking to you 😄 What's your research on?" },
    { from: "mommy", text: "Amit don't be nervous! I study decision-making under uncertainty. Which means I'm very used to ambiguity — including whatever this platform is 😄" },
    { from: "member", text: "Ha! A researcher studying decisions who chooses to be here — I find that interesting. What does your gut say about this match?" },
    { from: "mommy", text: "My gut says you're self-aware and direct, which is rarer than most people think. Ask me something real." },
    { from: "member", text: "What do you actually want from a relationship right now? Not what sounds good — the real answer." },
    { from: "mommy", text: "Presence. Real presence. Someone who shows up, not just shows up well. That's the whole thing honestly." },
  ],
];

async function run() {
  console.log("Creating mutual matches and seeding conversations…\n");

  for (let i = 0; i < pairs.length; i++) {
    const { mommy, member } = pairs[i];
    const convo = conversations[i] ?? conversations[0];

    // Insert match as mutual
    const matchDate = new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .insert({
        member_id: member.userId,
        mommy_id: mommy.userId,
        status: "mutual",
        member_responded: true,
        mommy_responded: true,
        member_response: "accepted",
        mommy_response: "accepted",
        match_score: 75 + Math.floor(Math.random() * 20),
        match_date: matchDate,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (matchErr) {
      console.error(`  ✗ match ${mommy.display_name} ↔ ${member.display_name}: ${matchErr.message}`);
      continue;
    }

    console.log(`  ✓ matched: ${mommy.display_name} ↔ ${member.display_name} (${match.id})`);

    // Seed messages
    let msgTime = new Date(Date.parse(matchDate) + 2 * 60 * 60 * 1000);
    for (const msg of convo) {
      const senderId = msg.from === "mommy" ? mommy.userId : member.userId;
      msgTime = new Date(msgTime.getTime() + (3 + Math.random() * 10) * 60 * 1000);

      const { error: msgErr } = await supabase.from("messages").insert({
        chat_id: `match-${match.id}`,
        sender_id: senderId,
        content: msg.text,
        attachments: [],
        created_at: msgTime.toISOString(),
      });

      if (msgErr) {
        console.error(`    ✗ message: ${msgErr.message}`);
      }
    }

    console.log(`    → ${convo.length} messages seeded`);
  }

  console.log("\n✓ All done. Visit /admin/inbox to start responding.");
}

run().catch(console.error);
