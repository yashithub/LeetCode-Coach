import { PROFILE_QUERY } from './queries';
import type {
  LeetCodeProfileResponse,
  ProfileSummary,
  TopicStat,
  Difficulty,
} from './types';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql/';

export class LeetCodeUserNotFoundError extends Error {
  constructor(username: string) {
    super(`No LeetCode user found for "${username}"`);
    this.name = 'LeetCodeUserNotFoundError';
  }
}

export class LeetCodeFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeetCodeFetchError';
  }
}

/**
 * Calls LeetCode's unofficial GraphQL endpoint. This MUST run server-side
 * (API route / server component) — LeetCode does not send permissive CORS
 * headers, so a direct browser fetch from another origin will be blocked.
 *
 * This is a reverse-engineered endpoint with no SLA: it can be rate-limited,
 * change shape, or reject requests that don't look like they came from a
 * real browser. Callers should always wrap this in caching and a graceful
 * UI fallback, never assume it will succeed.
 */
export async function fetchLeetCodeProfile(
  username: string
): Promise<ProfileSummary> {
  const res = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // LeetCode's edge rejects a meaningful fraction of requests that are
      // missing a same-site-looking Referer / Origin and a normal UA string.
      Referer: 'https://leetcode.com',
      Origin: 'https://leetcode.com',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
    body: JSON.stringify({
      query: PROFILE_QUERY,
      variables: { username },
      operationName: 'getUserProfile',
    }),
    // Don't let a hung request stall the whole API route.
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new LeetCodeFetchError(
      `LeetCode responded with ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as { data?: LeetCodeProfileResponse; errors?: unknown[] };

  if (json.errors && json.errors.length > 0) {
    throw new LeetCodeFetchError('LeetCode GraphQL returned errors');
  }

  const matchedUser = json.data?.matchedUser;
  if (!matchedUser) {
    throw new LeetCodeUserNotFoundError(username);
  }

  return normalizeProfile(matchedUser, username);
}

function normalizeProfile(
  matchedUser: NonNullable<LeetCodeProfileResponse['matchedUser']>,
  requestedUsername: string
): ProfileSummary {
  const solvedByDifficulty: Record<Difficulty, number> = {
    All: 0,
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };

  for (const entry of matchedUser.submitStats.acSubmissionNum) {
    solvedByDifficulty[entry.difficulty] = entry.count;
  }

  const topics: TopicStat[] = [
    ...matchedUser.tagProblemCounts.fundamental.map((t) => ({
      name: t.tagName,
      slug: t.tagSlug,
      solved: t.problemsSolved,
      tier: 'fundamental' as const,
    })),
    ...matchedUser.tagProblemCounts.intermediate.map((t) => ({
      name: t.tagName,
      slug: t.tagSlug,
      solved: t.problemsSolved,
      tier: 'intermediate' as const,
    })),
    ...matchedUser.tagProblemCounts.advanced.map((t) => ({
      name: t.tagName,
      slug: t.tagSlug,
      solved: t.problemsSolved,
      tier: 'advanced' as const,
    })),
  ].sort((a, b) => b.solved - a.solved);

  return {
    username: matchedUser.username || requestedUsername,
    realName: matchedUser.profile?.realName ?? null,
    avatar: matchedUser.profile?.userAvatar ?? null,
    ranking: matchedUser.profile?.ranking ?? null,
    solved: {
      all: solvedByDifficulty.All,
      easy: solvedByDifficulty.Easy,
      medium: solvedByDifficulty.Medium,
      hard: solvedByDifficulty.Hard,
    },
    topics,
    fetchedAt: Date.now(),
  };
}
