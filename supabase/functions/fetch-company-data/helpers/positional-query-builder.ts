
// Enhanced utility functions for building positional queries with stronger word order preference
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
  
  // For multi-word queries, create enhanced span query with stronger positional scoring
  return {
    "bool": {
      "should": [
        // Exact phrase gets highest boost (perfect match)
        {
          "match_phrase": {
            [field]: {
              "query": cleanedQuery,
              "boost": boost * 3 // Significantly higher boost for exact phrases
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
            "boost": boost * 2.5
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
            "boost": boost * 2
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
            "boost": boost * 1.5
          }
        },
        // All words present in any order gets lower boost
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
