// Shapes we care about from LeetCode's GraphQL responses, trimmed to
// only the fields the dashboard actually uses.

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'All';

export interface SubmitStatEntry {
  difficulty: Difficulty;
  count: number;
  submissions: number;
}

export interface TagCount {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

export interface TagProblemCounts {
  fundamental: TagCount[];
  intermediate: TagCount[];
  advanced: TagCount[];
}

export interface MatchedUser {
  username: string;
  profile: {
    realName: string | null;
    ranking: number | null;
    userAvatar: string | null;
  };
  submitStats: {
    acSubmissionNum: SubmitStatEntry[];
  };
  tagProblemCounts: TagProblemCounts;
}

export interface LeetCodeProfileResponse {
  matchedUser: MatchedUser | null;
}

// Normalized shape the frontend actually renders. Keeping this separate
// from the raw GraphQL shape means if LeetCode changes their schema,
// only lib/leetcode/client.ts needs to change — not every component.
export interface TopicStat {
  name: string;
  slug: string;
  solved: number;
  tier: 'fundamental' | 'intermediate' | 'advanced';
}

export interface ProfileSummary {
  username: string;
  realName: string | null;
  avatar: string | null;
  ranking: number | null;
  solved: {
    all: number;
    easy: number;
    medium: number;
    hard: number;
  };
  topics: TopicStat[];
  fetchedAt: number;
}
