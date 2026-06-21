import type { MasteryTopic } from '@/lib/scoring/mastery';
import { getWeakestTopics } from '@/lib/scoring/mastery';
import type { Recommendation } from '@/lib/recommendations/engine';
import { TOPIC_BY_CATEGORY } from '@/lib/data/topic-config';

export interface StudyPlanItem {
  topic: string;
  count: number;
  difficulty: string;
}

export interface StudyPlan {
  todayItems: StudyPlanItem[];
  estimatedMinutes: number;
  weeklyGoal: string;
  revisionTopic: string | null;
}

export function generateStudyPlan(
  mastery: MasteryTopic[],
  recommendations: Recommendation[]
): StudyPlan {
  const weak = getWeakestTopics(mastery, 3);
  const todayItems: StudyPlanItem[] = [];

  if (weak[0]) {
    todayItems.push({ topic: weak[0].category, count: 2, difficulty: 'Easy–Medium' });
  }
  if (weak[1]) {
    todayItems.push({ topic: weak[1].category, count: 1, difficulty: 'Medium' });
  }
  if (weak[2]) {
    todayItems.push({ topic: weak[2].category, count: 1, difficulty: 'Medium' });
  }

  if (todayItems.length === 0) {
    todayItems.push(
      { topic: 'Dynamic Programming', count: 1, difficulty: 'Hard' },
      { topic: 'Graph', count: 1, difficulty: 'Hard' }
    );
  }

  const strongest = [...mastery]
    .filter((t) => t.solved > 0)
    .sort((a, b) => b.masteryPercent - a.masteryPercent)[0];

  const estimatedMinutes = recommendations.slice(0, 4).reduce(
    (sum, r) => sum + r.problem.estimatedMinutes,
    0
  ) || todayItems.length * 25;

  const focusTopic = weak[0]?.category ?? 'Advanced Patterns';
  const weeklyTemplate =
    TOPIC_BY_CATEGORY[focusTopic]?.weeklyGoalTemplate ?? `Master ${focusTopic} Fundamentals`;

  return {
    todayItems,
    estimatedMinutes: Math.max(estimatedMinutes, 45),
    weeklyGoal: weeklyTemplate,
    revisionTopic: strongest?.category ?? null,
  };
}

/** Synthetic weekly improvement data for visualization (based on mastery profile). */
export function generateWeeklyTrend(mastery: MasteryTopic[]): { day: string; score: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const base = mastery.filter((t) => t.solved > 0).reduce((s, t) => s + t.masteryPercent, 0) / Math.max(1, mastery.filter((t) => t.solved > 0).length);
  const seed = mastery.reduce((s, t) => s + t.solved, 0);

  return days.map((day, i) => ({
    day,
    score: Math.min(100, Math.round(base * 0.85 + (seed % 7) * 2 + i * 3 + (i % 2) * 5)),
  }));
}

/** Synthetic activity heatmap data (12 weeks). */
export function generateActivityHeatmap(totalSolved: number): { week: number; day: number; count: number }[] {
  const cells: { week: number; day: number; count: number }[] = [];
  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 7; d++) {
      const intensity = Math.max(0, Math.round(((totalSolved / 120) * (0.3 + Math.sin(w + d) * 0.5 + ((w * 7 + d) % 5) * 0.1)) % 4));
      cells.push({ week: w, day: d, count: intensity });
    }
  }
  return cells;
}

/** Radar chart data from top topics. */
export function getRadarData(mastery: MasteryTopic[]): { topic: string; value: number }[] {
  const priority = ['Arrays', 'Trees', 'Graph', 'Dynamic Programming', 'Hashing', 'Binary Search'];
  return priority.map((topic) => {
    const m = mastery.find((t) => t.category === topic);
    return { topic: topic.split(' ')[0], value: m?.masteryPercent ?? 0 };
  });
}
