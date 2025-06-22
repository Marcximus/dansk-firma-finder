
import { cleanCompanyName } from './legal-form-utils.ts';
import { SEARCH_TIERS } from './search-tiers.ts';

// Build phrase and word matching queries
export const buildPhraseMatchQueries = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  return [
    // TIER 1: EXACT phrase matches on primary names (case insensitive)
    {
      "bool": {
        "should": [
          {
            "match_phrase": {
              "Vrvirksomhed.navne.navn": {
                "query": cleanedQuery,
                "boost": SEARCH_TIERS.EXACT_PRIMARY
              }
            }
          },
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": {
                "match_phrase": {
                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                    "query": cleanedQuery,
                    "boost": SEARCH_TIERS.EXACT_PRIMARY
                  }
                }
              }
            }
          }
        ]
      }
    },
    
    // TIER 2: EXACT phrase matches on secondary names (binavne) - case insensitive
    {
      "match_phrase": {
        "Vrvirksomhed.binavne.navn": {
          "query": cleanedQuery,
          "boost": SEARCH_TIERS.EXACT_SECONDARY
        }
      }
    },
    
    // TIER 3: All words present (both words must be found)
    {
      "bool": {
        "should": [
          {
            "match": {
              "Vrvirksomhed.navne.navn": {
                "query": cleanedQuery,
                "operator": "and",
                "boost": SEARCH_TIERS.ALL_WORDS
              }
            }
          },
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": {
                "match": {
                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                    "query": cleanedQuery,
                    "operator": "and",
                    "boost": SEARCH_TIERS.ALL_WORDS
                  }
                }
              }
            }
          },
          {
            "match": {
              "Vrvirksomhed.binavne.navn": {
                "query": cleanedQuery,
                "operator": "and",
                "boost": SEARCH_TIERS.ALL_WORDS
              }
            }
          }
        ]
      }
    },
    
    // TIER 4: Words in correct positions (first word at start gets priority)
    {
      "bool": {
        "should": [
          {
            "match_phrase_prefix": {
              "Vrvirksomhed.navne.navn": {
                "query": queryWords[0],
                "boost": SEARCH_TIERS.CORRECT_POSITIONS
              }
            }
          },
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": {
                "match_phrase_prefix": {
                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                    "query": queryWords[0],
                    "boost": SEARCH_TIERS.CORRECT_POSITIONS
                  }
                }
              }
            }
          },
          {
            "match_phrase_prefix": {
              "Vrvirksomhed.binavne.navn": {
                "query": queryWords[0],
                "boost": SEARCH_TIERS.CORRECT_POSITIONS
              }
            }
          }
        ]
      }
    },
    
    // TIER 5: All other remaining results (at least one word match)
    {
      "bool": {
        "should": [
          {
            "match": {
              "Vrvirksomhed.navne.navn": {
                "query": cleanedQuery,
                "operator": "or",
                "boost": SEARCH_TIERS.REMAINING
              }
            }
          },
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": {
                "match": {
                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                    "query": cleanedQuery,
                    "operator": "or",
                    "boost": SEARCH_TIERS.REMAINING
                  }
                }
              }
            }
          },
          {
            "match": {
              "Vrvirksomhed.binavne.navn": {
                "query": cleanedQuery,
                "operator": "or",
                "boost": SEARCH_TIERS.REMAINING
              }
            }
          }
        ]
      }
    }
  ];
};
