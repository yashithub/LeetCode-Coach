export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type TopicCategory =
  | 'Arrays'
  | 'Strings'
  | 'Hashing'
  | 'Two Pointers'
  | 'Binary Search'
  | 'Sliding Window'
  | 'Linked List'
  | 'Trees'
  | 'BST'
  | 'Heap'
  | 'Graph'
  | 'BFS'
  | 'DFS'
  | 'Union Find'
  | 'Topological Sort'
  | 'Backtracking'
  | 'Greedy'
  | 'Dynamic Programming'
  | 'Bit Manipulation'
  | 'Trie'
  | 'Segment Tree';

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  primaryTopic: TopicCategory;
  topics: TopicCategory[];
  prerequisites: string[];
  learningObjective: string;
  progressionOrder: number;
  estimatedMinutes: number;
  learningValue: number;
}

export interface TopicConfig {
  category: TopicCategory;
  slug: string;
  leetcodeTags: string[];
  tier: 'fundamental' | 'intermediate' | 'advanced';
  referenceCount: number;
  weeklyGoalTemplate: string;
}
