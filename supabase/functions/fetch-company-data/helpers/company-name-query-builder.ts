
import { cleanCompanyName } from './legal-form-utils.ts';
import { SEARCH_TIERS } from './search-tiers.ts';

// Simplified hierarchical search query with clean tier-based ranking
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  console.log(`Building query for: "${cleanedQuery}" (original: "${companyName}")`);
  console.log(`Query words: ${queryWords.join(', ')}`);
  
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 0: SHORTEST EXACT matches - prioritize exact matches with shorter names
          {
            "function_score": {
              "query": {
                "bool": {
                  "should": [
                    {
                      "match_phrase": {
                        "Vrvirksomhed.navne.navn": {
                          "query": cleanedQuery
                        }
                      }
                    },
                    {
                      "match_phrase": {
                        "Vrvirksomhed.binavne.navn": {
                          "query": cleanedQuery
                        }
                      }
                    }
                  ]
                }
              },
              "functions": [
                {
                  "field_value_factor": {
                    "field": "Vrvirksomhed.navne.navn.keyword",
                    "modifier": "reciprocal",
                    "factor": 0.1,
                    "missing": 1
                  }
                }
              ],
              "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH,
              "score_mode": "multiply"
            }
          },
          
          // TIER 1: EXACT matches for complete company names (case-insensitive)
          {
            "bool": {
              "should": [
                {
                  "match_phrase": {
                    "Vrvirksomhed.navne.navn": {
                      "query": cleanedQuery,
                      "boost": SEARCH_TIERS.EXACT_MATCH
                    }
                  }
                },
                {
                  "match_phrase": {
                    "Vrvirksomhed.binavne.navn": {
                      "query": cleanedQuery,
                      "boost": SEARCH_TIERS.EXACT_MATCH
                    }
                  }
                }
              ]
            }
          },
          
          // TIER 2: EXACT matches on primary names (company names or person names) - case insensitive
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
          
          // TIER 3: EXACT matches on secondary names (binavne) - case insensitive
          {
            "match_phrase": {
              "Vrvirksomhed.binavne.navn": {
                "query": cleanedQuery,
                "boost": SEARCH_TIERS.EXACT_SECONDARY
              }
            }
          },
          
          // TIER 4: All words present (both words must be found)
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
          
          // TIER 5: Words in correct positions (first word at start gets priority)
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
          
          // TIER 6: All other remaining results (at least one word match)
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
