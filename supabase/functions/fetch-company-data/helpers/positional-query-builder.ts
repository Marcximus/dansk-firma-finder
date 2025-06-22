
// This file is completely deprecated as we now use a pure hierarchical approach
// All logic has been moved to company-name-query-builder.ts with strict tier-based filtering

export const buildPositionalQuery = (field: string, boost: number, queryWords: string[], cleanedQuery: string) => {
  // This function is deprecated - the new approach uses pure hierarchical tiers
  // with no point-based scoring system
  return {
    "match": {
      [field]: {
        "query": cleanedQuery,
        "boost": boost
      }
    }
  };
};
