
import { cleanCompanyName } from './legal-form-utils.ts';
import { SEARCH_TIERS } from './search-tiers.ts';

// Simplified hierarchical search query with clean tier-based ranking
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 1: EXACT matches on primary names (company names or person names)
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
          
          // TIER 2: EXACT matches on secondary names (binavne)
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
                  "regexp": {
                    "Vrvirksomhed.navne.navn": {
                      "value": `^${queryWords[0]}.*`,
                      "boost": SEARCH_TIERS.CORRECT_POSITIONS
                    }
                  }
                },
                {
                  "nested": {
                    "path": "Vrvirksomhed.deltagerRelation",
                    "query": {
                      "regexp": {
                        "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                          "value": `^${queryWords[0]}.*`,
                          "boost": SEARCH_TIERS.CORRECT_POSITIONS
                        }
                      }
                    }
                  }
                },
                {
                  "regexp": {
                    "Vrvirksomhed.binavne.navn": {
                      "value": `^${queryWords[0]}.*`,
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
        ],
        "minimum_should_match": 1
      }
    },
    "size": 100,
    "sort": [
      "_score"
    ]
  };
};
