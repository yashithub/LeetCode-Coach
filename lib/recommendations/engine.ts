import type { ProfileSummary } from '@/lib/leetcode/types';
import type { Problem, TopicCategory } from '@/lib/data/types';
import { PROBLEMS, PROBLEMS_BY_TOPIC } from '@/lib/data/problems';
import type { MasteryTopic } from '@/lib/scoring/mastery';
import { getWeakestTopics, isAdvancedProfile } from '@/lib/scoring/mastery';

export interface Recommendation {
  problem: Problem;
  primaryTopic: TopicCategory;
  reason: string;
  concept: string;
  learningValue: number;
  leetcodeUrl: string;
  priority: number;
}

export interface RecommendationResult {
  nextBest: Recommendation | null;
  recommendations: Recommendation[];
  isAdvancedMode: boolean;
}

const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 } as const;

function estimateSkipCount(topic: MasteryTopic): number {
  return Math.min(topic.solved, PROBLEMS_BY_TOPIC[topic.category]?.length ?? topic.solved);
}

function buildReason(problem: Problem, topic: MasteryTopic, strongTopics: MasteryTopic[]): string {
  const strongNames = strongTopics.slice(0, 2).map((t) => t.category);
  if (strongNames.length >= 2) {
    return `Recommended because your ${topic.category} fundamentals are weaker than your ${strongNames.join(' and ')}.`;
  }
  if (topic.solved === 0) {
    return `Recommended to build your ${topic.category} foundation — this topic hasn't been started yet.`;
  }
  if (topic.relativeScore < -10) {
    return `Recommended because ${topic.category} is below your profile average and needs targeted practice.`;
  }
  return `Recommended to strengthen ${topic.category} with a ${problem.difficulty.toLowerCase()} problem at the right difficulty level.`;
}

function scoreProblem(problem: Problem, topic: MasteryTopic, index: number): number {
  const weaknessBonus = 100 - topic.masteryPercent;
  const progressionBonus = Math.max(0, 20 - index);
  const diffBonus = DIFFICULTY_ORDER[problem.difficulty] * 5;
  const valueBonus = problem.learningValue * 2;
  return weaknessBonus + progressionBonus + diffBonus + valueBonus;
}

export function generateRecommendations(
  profile: ProfileSummary,
  mastery: MasteryTopic[],
  limit = 8
): RecommendationResult {
  const isAdvancedMode = isAdvancedProfile(mastery);
  let weakTopics = getWeakestTopics(mastery, 5);

  if (isAdvancedMode) {
    weakTopics = [...mastery]
      .sort((a, b) => a.masteryPercent - b.masteryPercent)
      .slice(0, 5);
  }

  const strongTopics = [...mastery]
    .filter((t) => t.solved > 0)
    .sort((a, b) => b.masteryPercent - a.masteryPercent)
    .slice(0, 3);

  const candidates: Recommendation[] = [];

  for (const topic of weakTopics) {
    const pool = PROBLEMS_BY_TOPIC[topic.category] ?? [];
    const skip = estimateSkipCount(topic);
    const available = pool.slice(skip);

    const targetDiff = isAdvancedMode
      ? ['Medium', 'Hard']
      : topic.masteryPercent < 30
        ? ['Easy', 'Medium']
        : ['Easy', 'Medium', 'Hard'];

    for (let i = 0; i < available.length && candidates.filter((c) => c.primaryTopic === topic.category).length < 3; i++) {
      const problem = available[i];
      if (!targetDiff.includes(problem.difficulty)) continue;

      const priority = scoreProblem(problem, topic, i);
      candidates.push({
        problem,
        primaryTopic: topic.category,
        reason: buildReason(problem, topic, strongTopics),
        concept: problem.learningObjective,
        learningValue: problem.learningValue,
        leetcodeUrl: `https://leetcode.com/problems/${problem.slug}/`,
        priority,
      });
    }
  }

  if (candidates.length === 0) {
    const fallback = PROBLEMS.filter((p) => p.difficulty === 'Hard').slice(0, limit);
    const recs = fallback.map((problem, i) => ({
      problem,
      primaryTopic: problem.primaryTopic,
      reason: 'Advanced practice recommended — your profile shows strong fundamentals across topics.',
      concept: problem.learningObjective,
      learningValue: problem.learningValue,
      leetcodeUrl: `https://leetcode.com/problems/${problem.slug}/`,
      priority: 50 - i,
    }));
    return { nextBest: recs[0] ?? null, recommendations: recs, isAdvancedMode: true };
  }

  candidates.sort((a, b) => b.priority - a.priority);

  const balanced: Recommendation[] = [];
  const byDiff = { Easy: [] as Recommendation[], Medium: [] as Recommendation[], Hard: [] as Recommendation[] };
  for (const c of candidates) byDiff[c.problem.difficulty].push(c);

  const order: Array<'Easy' | 'Medium' | 'Hard'> = isAdvancedMode
    ? ['Medium', 'Hard', 'Easy']
    : ['Easy', 'Medium', 'Hard'];

  while (balanced.length < limit) {
    let added = false;
    for (const diff of order) {
      const next = byDiff[diff].shift();
      if (next && !balanced.some((b) => b.problem.id === next.problem.id)) {
        balanced.push(next);
        added = true;
        if (balanced.length >= limit) break;
      }
    }
    if (!added) break;
  }

  for (const c of candidates) {
    if (balanced.length >= limit) break;
    if (!balanced.some((b) => b.problem.id === c.problem.id)) balanced.push(c);
  }

  return {
    nextBest: balanced[0] ?? null,
    recommendations: balanced,
    isAdvancedMode,
  };
}
