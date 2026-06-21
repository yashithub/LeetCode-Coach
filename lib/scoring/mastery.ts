import type { TopicStat } from '@/lib/leetcode/types';
import { TOPIC_BY_CATEGORY, LEETCODE_TAG_TO_TOPIC, ALL_TOPIC_CATEGORIES } from '@/lib/data/topic-config';
import type { TopicCategory } from '@/lib/data/types';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface MasteryTopic {
  name: string;
  slug: string;
  category: TopicCategory;
  solved: number;
  tier: TopicStat['tier'];
  /** Absolute mastery 0-100 based on reference counts */
  masteryPercent: number;
  /** Relative to user's own profile average */
  relativeScore: number;
  /** Rank among all topics (1 = weakest) */
  rank: number;
  skillLevel: SkillLevel;
  label: 'Excellent' | 'Solid' | 'Developing' | 'Weak' | 'Untouched';
  suggestion: string;
  isWeakest: boolean;
}

function getSkillLevel(mastery: number, solved: number): SkillLevel {
  if (solved === 0) return 'Beginner';
  if (mastery >= 70 || solved >= 20) return 'Advanced';
  if (mastery >= 35 || solved >= 8) return 'Intermediate';
  return 'Beginner';
}

function getLabel(mastery: number, solved: number): MasteryTopic['label'] {
  if (solved === 0) return 'Untouched';
  if (mastery >= 75) return 'Excellent';
  if (mastery >= 45) return 'Solid';
  if (mastery >= 20) return 'Developing';
  return 'Weak';
}

function getSuggestion(
  category: TopicCategory,
  mastery: number,
  solved: number,
  relativeScore: number,
  avgMastery: number
): string {
  if (solved === 0) {
    return `Start with foundational ${category} problems — this topic hasn't been touched yet.`;
  }
  if (mastery >= 75 && relativeScore >= 0) {
    return `Strong ${category} skills. Tackle hard variants and interview-style problems to stay sharp.`;
  }
  if (relativeScore < -15) {
    return `Your ${category} is significantly below your average (${Math.round(avgMastery)}%). Focus here to balance your profile.`;
  }
  if (mastery < 30) {
    return `Build core ${category} patterns with easy→medium progression before moving to advanced problems.`;
  }
  if (mastery < 60) {
    return `Solid start in ${category}. Push into medium problems to reach interview-ready depth.`;
  }
  return `Near mastery in ${category}. Practice hard problems and timed sessions to cement skills.`;
}

/** Merge LeetCode topic stats with our full topic catalog for complete coverage. */
export function analyzeMastery(topics: TopicStat[]): MasteryTopic[] {
  const topicMap = new Map<string, TopicStat>();
  for (const t of topics) {
    topicMap.set(t.slug, t);
    topicMap.set(t.name.toLowerCase(), t);
  }

  const allTopics: MasteryTopic[] = ALL_TOPIC_CATEGORIES.map((category) => {
    const config = TOPIC_BY_CATEGORY[category];
    const lcTopic = topics.find(
      (t) =>
        LEETCODE_TAG_TO_TOPIC[t.slug] === category ||
        t.slug === config.slug ||
        t.name.toLowerCase() === category.toLowerCase()
    );

    const solved = lcTopic?.solved ?? 0;
    const tier = lcTopic?.tier ?? config.tier;
    const ref = config.referenceCount;
    const masteryPercent = Math.min(100, Math.round((solved / ref) * 100));

    return {
      name: category,
      slug: config.slug,
      category,
      solved,
      tier,
      masteryPercent,
      relativeScore: 0,
      rank: 0,
      skillLevel: getSkillLevel(masteryPercent, solved),
      label: getLabel(masteryPercent, solved),
      suggestion: '',
      isWeakest: false,
    };
  });

  const active = allTopics.filter((t) => t.solved > 0);
  const avgMastery =
    active.length > 0
      ? active.reduce((sum, t) => sum + t.masteryPercent, 0) / active.length
      : 0;

  for (const t of allTopics) {
    t.relativeScore = t.solved === 0 ? -100 : t.masteryPercent - avgMastery;
    t.suggestion = getSuggestion(t.category, t.masteryPercent, t.solved, t.relativeScore, avgMastery);
  }

  const ranked = [...allTopics].sort((a, b) => {
    if (a.masteryPercent !== b.masteryPercent) return a.masteryPercent - b.masteryPercent;
    if (a.solved !== b.solved) return a.solved - b.solved;
    return a.relativeScore - b.relativeScore;
  });

  ranked.forEach((t, i) => {
    t.rank = i + 1;
    t.isWeakest = i < 5;
  });

  const rankMap = new Map(ranked.map((t) => [t.category, t.rank]));
  return allTopics
    .map((t) => ({ ...t, rank: rankMap.get(t.category) ?? t.rank, isWeakest: (rankMap.get(t.category) ?? 99) <= 5 }))
    .sort((a, b) => a.rank - b.rank);
}

export function getWeakestTopics(mastery: MasteryTopic[], limit = 5): MasteryTopic[] {
  return mastery.filter((t) => t.isWeakest).slice(0, limit);
}

export function getStrongestTopics(mastery: MasteryTopic[], limit = 5): MasteryTopic[] {
  return [...mastery]
    .filter((t) => t.solved > 0)
    .sort((a, b) => b.masteryPercent - a.masteryPercent)
    .slice(0, limit);
}

export function isAdvancedProfile(mastery: MasteryTopic[]): boolean {
  const active = mastery.filter((t) => t.solved > 0);
  if (active.length < 5) return false;
  const avg = active.reduce((s, t) => s + t.masteryPercent, 0) / active.length;
  return avg >= 60 && active.filter((t) => t.masteryPercent >= 50).length >= active.length * 0.7;
}

export function getAdvancedPracticeMessage(mastery: MasteryTopic[]): string {
  const weak = getWeakestTopics(mastery, 3);
  const names = weak.map((t) => t.category).join(', ');
  return `You're performing well across most topics. Push into advanced ${names} and Hard problems to continue improving.`;
}

export function getProfileAverageMastery(mastery: MasteryTopic[]): number {
  const active = mastery.filter((t) => t.solved > 0);
  if (active.length === 0) return 0;
  return Math.round(active.reduce((s, t) => s + t.masteryPercent, 0) / active.length);
}
