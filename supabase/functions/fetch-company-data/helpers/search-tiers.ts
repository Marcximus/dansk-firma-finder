
// Search tier definitions and boost values
export const SEARCH_TIERS = {
  SHORTEST_EXACT_MATCH: 50000, // Increased significantly to ensure exact matches win
  EXACT_MATCH: 15000,
  EXACT_PRIMARY: 10000,
  EXACT_SECONDARY: 9000,
  ALL_WORDS: 8000,
  CORRECT_POSITIONS: 7000,
  REMAINING: 6000
} as const;

export type SearchTier = keyof typeof SEARCH_TIERS;
