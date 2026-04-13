import type { Profile, User } from "@/types/database";

interface MatchInput {
  member: User & { profile: Profile };
  candidate: User & { profile: Profile };
}

interface ScoredCandidate {
  candidateId: string;
  score: number;
  breakdown: {
    preferences: number;
    desires: number;
    activity: number;
    tier: number;
    randomness: number;
  };
}

const WEIGHTS = {
  preferences: 0.4,
  desires: 0.25,
  activity: 0.15,
  tier: 0.1,
  randomness: 0.1,
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function scoreCandidate({ member, candidate }: MatchInput): ScoredCandidate {
  // Preferences score (age + location)
  let prefScore = 0;
  const candidateAge = ageFromDob(candidate.profile.date_of_birth);
  if (
    candidateAge !== null &&
    member.profile.preferred_age_min !== null &&
    member.profile.preferred_age_max !== null
  ) {
    if (
      candidateAge >= member.profile.preferred_age_min &&
      candidateAge <= member.profile.preferred_age_max
    ) {
      prefScore += 60;
    }
  } else {
    prefScore += 30;
  }
  if (
    member.profile.preferred_locations &&
    candidate.profile.location_city &&
    member.profile.preferred_locations.includes(candidate.profile.location_city)
  ) {
    prefScore += 40;
  }

  // Desires overlap
  const memberDesires = new Set(member.profile.desires ?? []);
  const candidateDesires = candidate.profile.desires ?? [];
  const overlap = candidateDesires.filter((d) => memberDesires.has(d)).length;
  const desiresScore =
    candidateDesires.length > 0 ? (overlap / candidateDesires.length) * 100 : 50;

  // Activity recency
  const lastActive = candidate.last_active_at
    ? new Date(candidate.last_active_at).getTime()
    : 0;
  const hoursAgo = (Date.now() - lastActive) / (1000 * 60 * 60);
  const activityScore = Math.max(0, 100 - hoursAgo * 2);

  // Mommy tier boost (Icon > Elite > Standard)
  const tierScore =
    candidate.mommy_tier === "icon"
      ? 100
      : candidate.mommy_tier === "elite"
        ? 70
        : 40;

  // Randomness for freshness
  const randomScore = Math.random() * 100;

  const total =
    prefScore * WEIGHTS.preferences +
    desiresScore * WEIGHTS.desires +
    activityScore * WEIGHTS.activity +
    tierScore * WEIGHTS.tier +
    randomScore * WEIGHTS.randomness;

  return {
    candidateId: candidate.id,
    score: Math.round(total * 100) / 100,
    breakdown: {
      preferences: prefScore,
      desires: desiresScore,
      activity: activityScore,
      tier: tierScore,
      randomness: randomScore,
    },
  };
}

export function selectDailyMatches(
  member: User & { profile: Profile },
  candidates: Array<User & { profile: Profile }>,
  maxMatches: number,
  excludeIds: Set<string> = new Set()
): ScoredCandidate[] {
  return candidates
    .filter((c) => !excludeIds.has(c.id))
    .map((c) => scoreCandidate({ member, candidate: c }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMatches);
}

export function matchesPerDayForTier(tier: string | null): number {
  switch (tier) {
    case "unlimited":
    case "black_card":
      return -1; // unlimited
    case "platinum":
      return 2;
    case "pro":
    case "gold":
      return 1;
    default:
      return 0; // free tier — no curated matches
  }
}
