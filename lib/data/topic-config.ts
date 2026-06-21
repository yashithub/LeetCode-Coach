import type { TopicConfig } from './types';

export const TOPIC_CONFIGS: TopicConfig[] = [
  { category: 'Arrays', slug: 'arrays', leetcodeTags: ['array'], tier: 'fundamental', referenceCount: 25, weeklyGoalTemplate: 'Master Array Fundamentals' },
  { category: 'Strings', slug: 'strings', leetcodeTags: ['string'], tier: 'fundamental', referenceCount: 20, weeklyGoalTemplate: 'Build String Manipulation Fluency' },
  { category: 'Hashing', slug: 'hashing', leetcodeTags: ['hash-table'], tier: 'fundamental', referenceCount: 18, weeklyGoalTemplate: 'Master Hash Map Patterns' },
  { category: 'Two Pointers', slug: 'two-pointers', leetcodeTags: ['two-pointers'], tier: 'fundamental', referenceCount: 15, weeklyGoalTemplate: 'Two Pointer Technique Mastery' },
  { category: 'Binary Search', slug: 'binary-search', leetcodeTags: ['binary-search'], tier: 'intermediate', referenceCount: 15, weeklyGoalTemplate: 'Binary Search Pattern Recognition' },
  { category: 'Sliding Window', slug: 'sliding-window', leetcodeTags: ['sliding-window'], tier: 'intermediate', referenceCount: 12, weeklyGoalTemplate: 'Sliding Window Optimization' },
  { category: 'Linked List', slug: 'linked-list', leetcodeTags: ['linked-list'], tier: 'fundamental', referenceCount: 12, weeklyGoalTemplate: 'Linked List Pointer Manipulation' },
  { category: 'Trees', slug: 'trees', leetcodeTags: ['tree', 'binary-tree'], tier: 'intermediate', referenceCount: 20, weeklyGoalTemplate: 'Tree Traversal Fundamentals' },
  { category: 'BST', slug: 'bst', leetcodeTags: ['binary-search-tree'], tier: 'intermediate', referenceCount: 10, weeklyGoalTemplate: 'BST Operations & Validation' },
  { category: 'Heap', slug: 'heap', leetcodeTags: ['heap-priority-queue'], tier: 'intermediate', referenceCount: 10, weeklyGoalTemplate: 'Priority Queue Applications' },
  { category: 'Graph', slug: 'graph', leetcodeTags: ['graph'], tier: 'intermediate', referenceCount: 18, weeklyGoalTemplate: 'Graph Representation & Traversal' },
  { category: 'BFS', slug: 'bfs', leetcodeTags: ['breadth-first-search'], tier: 'intermediate', referenceCount: 12, weeklyGoalTemplate: 'BFS Level-Order Patterns' },
  { category: 'DFS', slug: 'dfs', leetcodeTags: ['depth-first-search'], tier: 'intermediate', referenceCount: 12, weeklyGoalTemplate: 'DFS Exploration Patterns' },
  { category: 'Union Find', slug: 'union-find', leetcodeTags: ['union-find'], tier: 'advanced', referenceCount: 8, weeklyGoalTemplate: 'Disjoint Set Union Mastery' },
  { category: 'Topological Sort', slug: 'topological-sort', leetcodeTags: ['topological-sort'], tier: 'advanced', referenceCount: 8, weeklyGoalTemplate: 'DAG Ordering & Dependencies' },
  { category: 'Backtracking', slug: 'backtracking', leetcodeTags: ['backtracking'], tier: 'advanced', referenceCount: 15, weeklyGoalTemplate: 'Backtracking Decision Trees' },
  { category: 'Greedy', slug: 'greedy', leetcodeTags: ['greedy'], tier: 'intermediate', referenceCount: 12, weeklyGoalTemplate: 'Greedy Choice Property' },
  { category: 'Dynamic Programming', slug: 'dynamic-programming', leetcodeTags: ['dynamic-programming'], tier: 'advanced', referenceCount: 25, weeklyGoalTemplate: 'DP State Transition Mastery' },
  { category: 'Bit Manipulation', slug: 'bit-manipulation', leetcodeTags: ['bit-manipulation'], tier: 'intermediate', referenceCount: 10, weeklyGoalTemplate: 'Bitwise Operations Fluency' },
  { category: 'Trie', slug: 'trie', leetcodeTags: ['trie'], tier: 'advanced', referenceCount: 8, weeklyGoalTemplate: 'Prefix Tree Applications' },
  { category: 'Segment Tree', slug: 'segment-tree', leetcodeTags: ['segment-tree'], tier: 'advanced', referenceCount: 6, weeklyGoalTemplate: 'Range Query Optimization' },
];

export const TOPIC_BY_CATEGORY = Object.fromEntries(
  TOPIC_CONFIGS.map((t) => [t.category, t])
) as Record<string, TopicConfig>;

export const LEETCODE_TAG_TO_TOPIC: Record<string, string> = {};
for (const config of TOPIC_CONFIGS) {
  for (const tag of config.leetcodeTags) {
    LEETCODE_TAG_TO_TOPIC[tag] = config.category;
  }
}

export const ALL_TOPIC_CATEGORIES = TOPIC_CONFIGS.map((t) => t.category);
