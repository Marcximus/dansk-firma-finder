
// Utility functions for building positional queries
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
  
  // For multi-word queries, create a span query that scores based on word positions
  return {
    "bool": {
      "should": [
        // Exact phrase gets highest boost
        {
          "match_phrase": {
            [field]: {
              "query": cleanedQuery,
              "boost": boost * 2
            }
          }
        },
        // Words in correct order get medium boost
        {
          "span_near": {
            "clauses": queryWords.map(word => ({
              "span_term": { [field]: word }
            })),
            "slop": 2,
            "in_order": true,
            "boost": boost * 1.5
          }
        },
        // Words in any order get lower boost
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
