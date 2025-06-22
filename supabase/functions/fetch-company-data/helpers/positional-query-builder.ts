
// This file is no longer needed as we're using static constant_score queries
// The functionality has been moved directly into company-name-query-builder.ts
// for better control over the hierarchical ranking

export const buildPositionalQuery = (field: string, boost: number, queryWords: string[], cleanedQuery: string) => {
  // This function is deprecated but kept for backward compatibility
  // The new approach uses constant_score queries for static ranking
  return {
    "match": {
      [field]: {
        "query": cleanedQuery,
        "boost": boost
      }
    }
  };
};
