
// Simplified utility functions for building positional queries with normalized boost scaling
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
  
  // For multi-word queries, create positional query with normalized boost values
  return {
    "bool": {
      "should": [
        // Exact phrase gets highest boost within this tier
        {
          "match_phrase": {
            [field]: {
              "query": cleanedQuery,
              "boost": boost * 3
            }
          }
        },
        // Words in exact order with no gaps
        {
          "span_near": {
            "clauses": queryWords.map(word => ({
              "span_term": { [field]: word }
            })),
            "slop": 0,
            "in_order": true,
            "boost": boost * 2.5
          }
        },
        // Words in correct order with small gaps
        {
          "span_near": {
            "clauses": queryWords.map(word => ({
              "span_term": { [field]: word }
            })),
            "slop": 2,
            "in_order": true,
            "boost": boost * 2
          }
        },
        // Words in correct order with larger gaps
        {
          "span_near": {
            "clauses": queryWords.map(word => ({
              "span_term": { [field]: word }
            })),
            "slop": 5,
            "in_order": true,
            "boost": boost * 1.5
          }
        },
        // All words present in any order
        {
          "match": {
            [field]: {
              "query": cleanedQuery,
              "operator": "and",
              "boost": boost
            }
          }
        }
      ]
    }
  };
};
