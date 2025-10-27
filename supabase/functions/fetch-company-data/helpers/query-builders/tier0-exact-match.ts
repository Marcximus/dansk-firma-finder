
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier0ExactMatchQuery = (cleanedQuery: string, originalQuery: string) => {
  return {
    "bool": {
      "should": [
        // HIGHEST PRIORITY: Phrase match for cleaned query (handles "novo nordisk" → "NOVO NORDISK A/S")
        {
          "match_phrase": {
            "Vrvirksomhed.navne.navn": {
              "query": cleanedQuery,
              "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH * 1.1 // Slightly higher to prioritize
            }
          }
        },
        // HIGHEST PRIORITY: Phrase match for original query 
        {
          "match_phrase": {
            "Vrvirksomhed.navne.navn": {
              "query": originalQuery,
              "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH * 1.1
            }
          }
        },
        // Phrase match on secondary names (binavne)
        {
          "match_phrase": {
            "Vrvirksomhed.binavne.navn": {
              "query": cleanedQuery,
              "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
            }
          }
        },
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
        },
        // ORIGINAL QUERY (with legal form) - lowercase
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": originalQuery,
                    "operator": "and"
                  }
                }
              }
            ],
            "filter": [
              {
                "term": {
                  "Vrvirksomhed.navne.navn.keyword": originalQuery.toLowerCase()
                }
              }
            ],
            "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
          }
        },
        // ORIGINAL QUERY (with legal form) - uppercase
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": originalQuery,
                    "operator": "and"
                  }
                }
              }
            ],
            "filter": [
              {
                "term": {
                  "Vrvirksomhed.navne.navn.keyword": originalQuery.toUpperCase()
                }
              }
            ],
            "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
          }
        },
        // ORIGINAL QUERY (with legal form) - original case
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": originalQuery,
                    "operator": "and"
                  }
                }
              }
            ],
            "filter": [
              {
                "term": {
                  "Vrvirksomhed.navne.navn.keyword": originalQuery
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
