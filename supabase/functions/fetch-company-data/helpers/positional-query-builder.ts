
// Enhanced utility functions for building positional queries with proper boost scaling
export const buildPositionalQuery = (field: string, boost: number, queryWords: string[], cleanedQuery: string) => {
  if (queryWords.length === 1) {
    return {
      "match": {
        [field]: {
          "query": cleanedQuery,
          "boost": boost
        }
      }
    };
  }
  
  // For multi-word queries, create enhanced span query with controlled boost values
  return {
    "bool": {
      "should": [
        // Exact phrase gets highest boost within this tier
        {
          "match_phrase": {
            [field]: {
              "query": cleanedQuery,
              "boost": boost * 3 // 3x base boost for exact phrases
            }
          }
        },
        // Words in exact order with no gaps gets very high boost
        {
          "span_near": {
            "clauses": queryWords.map(word => ({
              "span_term": { [field]: word }
            })),
            "slop": 0, // No gaps allowed
            "in_order": true,
            "boost": boost * 2.5 // 2.5x base boost
          }
        },
        // Words in correct order with small gaps get high boost
        {
          "span_near": {
            "clauses": queryWords.map(word => ({
              "span_term": { [field]: word }
            })),
            "slop": 2, // Allow small gaps
            "in_order": true,
            "boost": boost * 2 // 2x base boost
          }
        },
        // Words in correct order with larger gaps get medium boost
        {
          "span_near": {
            "clauses": queryWords.map(word => ({
              "span_term": { [field]: word }
            })),
            "slop": 5, // Allow larger gaps
            "in_order": true,
            "boost": boost * 1.5 // 1.5x base boost
          }
        },
        // All words present in any order gets base boost
        {
          "match": {
            [field]: {
              "query": cleanedQuery,
              "operator": "and",
              "boost": boost // Base boost
            }
          }
        }
      ]
    }
  };
};
