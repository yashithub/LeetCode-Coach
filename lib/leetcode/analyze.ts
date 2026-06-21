import type { TopicStat } from './types';

/** @deprecated Use lib/scoring/mastery instead */
export interface ScoredTopic extends TopicStat {
  score: number;
  label: 'Excellent' | 'Solid' | 'Developing' | 'Weak';
}

export { analyzeMastery as scoreTopics, getWeakestTopics as getWeakTopics, getStrongestTopics as getStrongTopics } from '@/lib/scoring/mastery';
