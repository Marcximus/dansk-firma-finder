
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier0ExactMatchQuery = (cleanedQuery: string) => {
  return {
    "bool": {
      "should": [
        // Case-insensitive exact match for company names using match with strict operator
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": cleanedQuery,
                    "operator": "and"
                  }
                }
              }
            ],
            "filter": [
              {
                "term": {
                  "Vrvirksomhed.navne.navn.keyword": cleanedQuery.toLowerCase()
                }
              }
            ],
            "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
          }
        },
        // Case-insensitive exact match for secondary names (binavne)
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.binavne.navn": {
                    "query": cleanedQuery,
                    "operator": "and"
                  }
                }
              }
            ],
            "filter": [
              {
                "term": {
                  "Vrvirksomhed.binavne.navn.keyword": cleanedQuery.toLowerCase()
                }
              }
            ],
            "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
          }
        },
        // Also try uppercase version for exact matching
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": cleanedQuery,
                    "operator": "and"
                  }
                }
              }
            ],
            "filter": [
              {
                "term": {
                  "Vrvirksomhed.navne.navn.keyword": cleanedQuery.toUpperCase()
                }
              }
            ],
            "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
          }
        },
        // Try the original case as well
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": cleanedQuery,
                    "operator": "and"
                  }
                }
              }
            ],
            "filter": [
              {
                "term": {
                  "Vrvirksomhed.navne.navn.keyword": cleanedQuery
                }
              }
            ],
            "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
          }
        }
      ]
    }
  };
};
