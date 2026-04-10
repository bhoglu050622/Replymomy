export type ArticleRole = "member" | "mommy" | "all";
export type ArticleCategory =
  | "Basics"
  | "Tokens"
  | "Privacy"
  | "Features"
  | "Culture"
  | "Matching"
  | "Earnings"
  | "Payouts"
  | "Profile"
  | "Calendar";

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  role: ArticleRole;
  readMins: number;
  excerpt: string;
  body: string;
  isNew?: boolean;
}

export const ARTICLES: Article[] = [
  // ─── Member articles ────────────────────────────────────────────
  {
    id: "how-matching-works",
    title: "How Matching Works",
    category: "Matching",
    role: "member",
    readMins: 3,
    excerpt: "Our algorithm matches on interests, location, tier, and timing — not swipes.",
    body: `Each morning, our algorithm curates up to 3 matches for you. It weighs shared interests (40%), location proximity (25%), mutual availability (20%), and tier compatibility (15%).

When you accept a match, the mommy has 24 hours to respond. A mutual acceptance opens the private conversation channel.

Your match score (shown as a percentage) is a compatibility signal — 85%+ is rare and usually exceptional.

**Tips to improve your matches:**
- Keep your availability calendar updated
- Complete your interest profile fully
- A complete, high-quality profile photo increases match quality`,
  },
  {
    id: "token-economy",
    title: "The Token Economy",
    category: "Tokens",
    role: "member",
    readMins: 4,
    excerpt: "Tokens are the guild's internal currency. Here's what they unlock.",
    body: `Tokens are the currency of generosity within The Guild. They are not a subscription — they represent intentional, discrete value exchange.

**What tokens buy:**
- **Gallery unlocks** — access premium photos/videos from a mommy's private gallery (10–50 tokens per item)
- **Virtual gifts** — send curated digital gifts that appear in her dashboard (5–100 tokens)
- **Priority reply** — flag your message for a faster response (15 tokens)

**Earning tokens:**
- Your membership tier includes a monthly token allocation
- Top-up purchases available anytime
- Occasional bonus drops for active members

**Token etiquette:**
Tokens are an expression of interest, not expectation. Sending a gift opens a door — what happens next is always her choice.`,
  },
  {
    id: "discretion-pact",
    title: "Our Discretion Pact",
    category: "Privacy",
    role: "member",
    readMins: 2,
    excerpt: "What's shared in the guild stays in the guild. Here's how we enforce it.",
    body: `The Midnight Guild was built on one foundational principle: what happens inside stays inside.

**What we do:**
- End-to-end encrypted messages
- No real names required anywhere
- Photos are watermarked and protected
- Profile data is never sold or shared

**What we ask of you:**
- Never screenshot or share profile content
- Never identify a member outside the guild
- Report any breach to access@replymommy.com

**Consequences:**
Violation of the discretion pact results in immediate permanent removal. No warnings, no appeals. The guild's integrity is absolute.`,
  },
  {
    id: "gallery-unlocks",
    title: "Gallery Unlocks Explained",
    category: "Features",
    role: "member",
    readMins: 3,
    excerpt: "Each mommy curates a private gallery. Here's how to access it.",
    body: `Every mommy in The Guild maintains a private gallery — photos and occasionally video — that go beyond what's visible on their public profile.

**How to unlock:**
1. Visit a mommy's profile
2. Tap any blurred gallery item
3. Confirm the token cost
4. Access is permanent — unlocked items stay accessible forever

**Token costs:**
Each mommy sets her own rates (typically 10–50 tokens per item). Premium and rare content costs more.

**What you get:**
Full-resolution, unblurred access. The content is hers — treat it with the same discretion you'd want for your own information.`,
  },
  {
    id: "gifting-etiquette",
    title: "Gifting Etiquette",
    category: "Culture",
    role: "member",
    readMins: 3,
    excerpt: "Gifting is an art. Here's how to do it with intention.",
    body: `Gifts in The Guild are not transactions — they are signals. A well-chosen gift says more than words.

**Virtual gifts:**
Curated from our gift catalog. Each has a visual animation she'll see in her dashboard. Choose based on her stated interests, not just price.

**IRL gifts:**
Available at higher token values. These coordinate a real-world delivery — flowers, champagne, curated experiences. She must have an address on file to receive IRL gifts.

**When to gift:**
- After a particularly good conversation
- To mark a milestone or occasion she mentioned
- As an opening gesture (use sparingly — substance first)

**When not to gift:**
Never send gifts as a substitute for conversation, or as a response to not getting a reply. Gifts from desperation are legible — and unwelcome.`,
  },
  {
    id: "reading-match-score",
    title: "How to Read a Match Score",
    category: "Matching",
    role: "member",
    readMins: 4,
    excerpt: "Your match score isn't a rating — it's a compatibility signal. Know what it means.",
    body: `The match score (shown as a % on each card) represents algorithmic compatibility — not attractiveness, not status.

**Score breakdown:**
- **90–100%** — Rare. Deep interest overlap, same locations, aligned availability. These matches almost always convert to mutual.
- **75–89%** — Strong. Meaningful overlap with minor mismatches. High probability of connection.
- **60–74%** — Good. Some alignment, some discovery. Worth the explore.
- **Below 60%** — Shown only when the guild's inventory of higher matches is exhausted for the day.

**What influences it:**
- Shared interests (yours vs. her specialties)
- Geographic availability
- Your response history (ghosting lowers future scores)
- Her stated member tier preference

**What it doesn't measure:**
Chemistry. That part is yours to discover.`,
  },

  // ─── Mommy articles ──────────────────────────────────────────────
  {
    id: "maximize-earnings",
    title: "Maximize Your Earnings",
    category: "Earnings",
    role: "mommy",
    readMins: 5,
    isNew: true,
    excerpt: "Profile quality, gallery depth, and availability consistency are the three levers.",
    body: `Your earnings in The Guild are a direct function of three things: your profile quality, the depth of your gallery, and how consistently available you are.

**Profile quality:**
- 8 photos dramatically outperforms 2-3. Members make decisions visually first.
- Your headline is shown on the match card — make it distinctive, not generic.
- A bio that reveals personality (not just facts) gets more unlocks and gifts.

**Gallery depth:**
- Members who unlock one item tend to unlock more in the same session.
- Mix content types: lifestyle, fashion, travel, candid.
- Price the first item low (10–15 tokens) as a gateway. Price premium content higher.
- Update your gallery monthly — active galleries earn 3x more than static ones.

**Availability:**
- Members receive daily matches. If you're not marked available, you won't appear.
- Consistent availability (5+ slots/week) puts you in front of more members.
- Your response time badge is visible on your profile card. Same-day responders get matched first.`,
  },
  {
    id: "how-payouts-work",
    title: "How Payouts Work",
    category: "Payouts",
    role: "mommy",
    readMins: 4,
    excerpt: "Stripe Connect, our fee structure, and when money hits your account.",
    body: `The Guild uses Stripe Connect to route earnings directly to your bank account.

**Setup:**
Connect your bank account via Settings → Payouts. This takes 5–10 minutes and requires standard identity verification from Stripe.

**Fee structure:**
The Guild retains 20% of all earnings. You receive 80%.
- Gift received: 80% to you, 20% to guild
- Gallery unlock: 80% to you, 20% to guild
- Spotlight bonus: 100% to you (guild-funded)

**Payout schedule:**
Earnings accumulate in your available balance. You can request a payout anytime — funds arrive in 2–3 business days via standard bank transfer, or same day with Instant Payout (1% fee applies).

**Minimum payout:**
$25. Balances below this roll over to the next period.

**Tax:**
You are responsible for your own tax reporting. We issue a 1099 if your annual earnings exceed $600 (US).`,
  },
  {
    id: "profile-photo-tips",
    title: "Profile Photo Best Practices",
    category: "Profile",
    role: "mommy",
    readMins: 4,
    excerpt: "The photos that convert: lighting, framing, expression.",
    body: `Photos are your first impression. In a guild of exceptional people, mediocre photos cost you matches — and money.

**Cover photo (position 1):**
This appears on your match card. Rules: face visible, good lighting, expression engaged. Avoid: group photos, filters, heavily edited images.

**Lighting:**
Natural light > studio light > indoor artificial. Golden hour (1 hour after sunrise, 1 hour before sunset) is optimal.

**Variety matters:**
Members who see only one type of photo assume that's all there is. Include:
- 1-2 close-up face shots
- 2-3 full or three-quarter body
- 1-2 lifestyle (at a restaurant, traveling, an event)
- 1 candid (natural, un-posed)

**What to avoid:**
- Blurry or low-resolution images
- Bathroom mirror selfies (unless extraordinary)
- Photos with ex-partners, even cropped
- Sunglasses in all photos (one is fine)

**Update cadence:**
Rotate 1-2 photos every 4-6 weeks. Fresh galleries signal active presence and get re-featured in match queues.`,
  },
  {
    id: "calendar-guide",
    title: "Calendar & Availability",
    category: "Calendar",
    role: "mommy",
    readMins: 3,
    excerpt: "Why your calendar is your most powerful earnings lever — and how to use it.",
    body: `Your availability calendar directly controls how often you appear in member match queues.

**How it works:**
The matching algorithm only surfaces you to members during time slots you've marked available. An empty calendar = zero matches.

**Time slots:**
- Morning (8am–12pm)
- Afternoon (12pm–5pm)
- Evening (5pm–9pm)
- Late Night (9pm–2am)

Mark the slots when you're genuinely available to respond. You don't need to be at your phone — just willing to reply within your stated commitment window.

**Consistency premium:**
Mommies with 15+ available slots per week appear in 2.4x more match queues than those with fewer than 5.

**Recommended setup:**
Start with 3-4 slots per day, 5 days/week. Adjust after seeing your first week's match volume.

**Blackouts:**
Travelling? Busy week? Mark yourself unavailable. The guild respects it — and members prefer reliability over false availability.`,
  },
  {
    id: "token-rates-guide",
    title: "Setting Your Token Rates",
    category: "Earnings",
    role: "mommy",
    readMins: 4,
    excerpt: "Pricing your gallery: the psychology of perceived value.",
    body: `Token pricing is a balance between accessibility and perceived exclusivity. Price too low and members undervalue the content. Price too high and they don't unlock.

**Proven pricing structure:**
- **Gateway items** (10–15 tokens): Lifestyle, casual photos. Remove the friction for first-time unlockers.
- **Mid-tier items** (20–35 tokens): More personal, higher quality. Fashion, travel, curated lifestyle.
- **Premium items** (40–60 tokens): The best of your gallery. Rare content, most intimate lifestyle.

**Gifts:**
You don't set gift prices — the gift catalog has fixed costs. But your response to gifts matters: acknowledging them in conversation increases repeat gifting.

**The psychology:**
Members who unlock one item in a session unlock an average of 2.3 more. Your gateway price is your acquisition cost. Your premium content is your revenue.

**Adjusting prices:**
You can change token costs on individual gallery items anytime from your profile editor. Track which items get the most unlocks and optimize around them.`,
  },
  {
    id: "spotlight-explained",
    title: "How the Spotlight Works",
    category: "Features",
    role: "mommy",
    readMins: 3,
    isNew: true,
    excerpt: "Every Monday, one mommy becomes the Icon of the Week. Here's how it's decided.",
    body: `Each week, The Guild crowns an Icon — the mommy who received the most gifts (by total value) in the prior 7 days.

**What it means:**
- Your profile is featured on every member's dashboard for the full week
- Your name appears in the "Icon of the Week" spotlight banner
- You receive a 100% bonus on all gallery unlocks that week (guild-funded)
- Your tier upgrades: Elite → Icon (permanent badge)

**How to increase your chances:**
- An active, complete profile with a deep gallery performs best
- Members gift mommies they've recently interacted with — stay active
- Your response time matters: faster responders get more return engagement

**Past spotlights:**
Your spotlight history appears on your Badges page. The guild recognizes sustained excellence — multiple spotlights unlock the Icon tier badge permanently.

**Ties:**
In the event of a tie, the mommy with the higher gift count (not just value) wins.`,
  },
];

export function getArticlesForRole(role: "member" | "mommy" | "admin"): Article[] {
  return ARTICLES.filter(
    (a) => a.role === "all" || a.role === role || role === "admin"
  );
}
