import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Client — initialized once per cold start
// ---------------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AiApplicationReview {
  quality_score: number;
  strengths: string[];
  red_flags: string[];
  suggested_tags: string[];
  admin_summary: string;
}

export interface ProfileSnippet {
  displayName: string;
  bio: string | null;
  desires: string[] | null;
  locationCity: string | null;
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

function isAiApplicationReview(v: unknown): v is AiApplicationReview {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.quality_score === "number" &&
    Array.isArray(r.strengths) &&
    Array.isArray(r.red_flags) &&
    Array.isArray(r.suggested_tags) &&
    typeof r.admin_summary === "string"
  );
}

function isMatchIntro(v: unknown): v is { intro: string } {
  if (!v || typeof v !== "object") return false;
  return typeof (v as Record<string, unknown>).intro === "string";
}

function isIcebreakers(v: unknown): v is { starters: string[] } {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return Array.isArray(r.starters) && r.starters.every((s) => typeof s === "string");
}

function parseGeminiJson<T>(text: string, guard: (v: unknown) => v is T): T {
  const parsed: unknown = JSON.parse(text);
  if (!guard(parsed)) throw new Error("Gemini response shape mismatch");
  return parsed;
}

// ---------------------------------------------------------------------------
// Helper: compute shared desires
// ---------------------------------------------------------------------------

function sharedDesires(a: string[] | null, b: string[] | null): string {
  if (!a?.length || !b?.length) return "none identified";
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const overlap = a.filter((s) => setB.has(s.toLowerCase()));
  return overlap.length ? overlap.join(", ") : "none identified";
}

// ---------------------------------------------------------------------------
// Feature 1 — Application Review
// ---------------------------------------------------------------------------

export interface ApplicationInput {
  full_name: string;
  age: number;
  city: string;
  instagram: string | null;
  motivation: string;
}

export async function reviewApplication(app: ApplicationInput): Promise<AiApplicationReview> {
  const prompt = `You are a discerning concierge for ReplyMommy, a luxury private dating platform.
Evaluate this mommy application and return a structured quality assessment for an admin reviewer.
Be concise, tasteful, and professional. Return only valid JSON.

Application:
- Name: ${app.full_name}, Age: ${app.age}, City: ${app.city}
- Instagram: ${app.instagram ?? "not provided"}
- Motivation: "${app.motivation}"

Return this exact JSON structure:
{
  "quality_score": <integer 0-100>,
  "strengths": [<up to 3 strings, max 12 words each>],
  "red_flags": [<0-3 concerns, empty array if none>],
  "suggested_tags": [<2-5 short CRM label strings>],
  "admin_summary": "<one sentence, max 30 words>"
}

Score guide: 80-100 strong candidate, 60-79 promising with caveats, 40-59 borderline, below 40 not recommended.
Base primarily on the motivation statement's authenticity, specificity, and alignment with a luxury platform.`;

  const result = await model.generateContent(prompt);
  return parseGeminiJson(result.response.text(), isAiApplicationReview);
}

// ---------------------------------------------------------------------------
// Feature 2 — Match Introduction
// ---------------------------------------------------------------------------

export async function generateMatchIntro(
  member: ProfileSnippet,
  mommy: ProfileSnippet
): Promise<string> {
  const shared = sharedDesires(member.desires, mommy.desires);
  const memberBio = (member.bio ?? "").slice(0, 200);
  const mommyBio = (mommy.bio ?? "").slice(0, 200);

  const prompt = `You are a matchmaker for ReplyMommy, a luxury private dating platform.
Write a warm, sophisticated 1-2 sentence introduction explaining why this pairing was selected.
Address the member directly. Be personal, specific, and tasteful — never generic.
Return only valid JSON.

Member profile:
- Desires / interests: ${member.desires?.join(", ") || "not specified"}
- City: ${member.locationCity || "not specified"}
- Bio excerpt: "${memberBio}"

Mommy profile (${mommy.displayName}):
- City: ${mommy.locationCity || "not specified"}
- Desires / interests: ${mommy.desires?.join(", ") || "not specified"}
- Bio excerpt: "${mommyBio}"

Shared interests: ${shared}

Return this exact JSON structure:
{ "intro": "<1-2 sentences beginning with 'We matched you with ${mommy.displayName} because...'>" }`;

  const result = await model.generateContent(prompt);
  const parsed = parseGeminiJson(result.response.text(), isMatchIntro);
  return parsed.intro;
}

// ---------------------------------------------------------------------------
// Feature 3 — Conversation Icebreakers
// ---------------------------------------------------------------------------

export async function generateIcebreakers(
  member: ProfileSnippet,
  mommy: ProfileSnippet
): Promise<string[]> {
  const shared = sharedDesires(member.desires, mommy.desires);

  const prompt = `You are a witty but tasteful conversation curator for ReplyMommy, a luxury private dating platform.
Generate exactly 3 personalised conversation starters for a newly matched pair.
The starters should feel natural, specific to their shared interests, and befitting an exclusive platform.
Avoid generic openers like "Hey" or "What's up?". Return only valid JSON.

Member profile:
- Desires / interests: ${member.desires?.join(", ") || "not specified"}
- City: ${member.locationCity || "not specified"}
- Bio: "${member.bio ?? ""}"

${mommy.displayName}'s profile:
- Desires / interests: ${mommy.desires?.join(", ") || "not specified"}
- City: ${mommy.locationCity || "not specified"}
- Bio: "${mommy.bio ?? ""}"

Shared interests: ${shared}

Return this exact JSON structure:
{ "starters": ["<starter1>", "<starter2>", "<starter3>"] }

Each starter 1-2 sentences. At least one should reference a shared interest if any exist.
At least one should be playfully intriguing without being inappropriate.`;

  const result = await model.generateContent(prompt);
  const parsed = parseGeminiJson(result.response.text(), isIcebreakers);
  return parsed.starters;
}
