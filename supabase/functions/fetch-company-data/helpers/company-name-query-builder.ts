
import { cleanCompanyName } from './legal-form-utils.ts';
import { SEARCH_TIERS } from './search-tiers.ts';

// Enhanced hierarchical search query with proper exact matching and length penalties
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  console.log(`Building query for: "${cleanedQuery}" (original: "${companyName}")`);
  console.log(`Query words: ${queryWords.join(', ')}`);
  
  return {
    "query": {
      "function_score": {
        "query": {
          "bool": {
            "should": [
              // TIER 0: TRUE EXACT matches (case-insensitive, exact company name)
              {
                "bool": {
                  "should": [
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
                            "script": {
                              "script": {
                                "source": `
                                  String name = doc['Vrvirksomhed.navne.navn.keyword'].value;
                                  if (name == null) return false;
                                  String cleanName = name.toLowerCase().replaceAll(/\\s+/, ' ').trim();
                                  String searchTerm = params.searchTerm.toLowerCase().trim();
                                  return cleanName.equals(searchTerm);
                                `,
                                "params": {
                                  "searchTerm": cleanedQuery
                                }
                              }
                            }
                          }
                        ],
                        "boost": SEARCH_TIERS.EXACT_MATCH
                      }
                    },
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
                            "script": {
                              "script": {
                                "source": `
                                  String name = doc['Vrvirksomhed.binavne.navn.keyword'].value;
                                  if (name == null) return false;
                                  String cleanName = name.toLowerCase().replaceAll(/\\s+/, ' ').trim();
                                  String searchTerm = params.searchTerm.toLowerCase().trim();
                                  return cleanName.equals(searchTerm);
                                `,
                                "params": {
                                  "searchTerm": cleanedQuery
                                }
                              }
                            }
                          }
                        ],
                        "boost": SEARCH_TIERS.EXACT_MATCH
                      }
                    }
                  ]
                }
              },
              
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
            ],
            "minimum_should_match": 1
          }
        },
        "functions": [
          {
            "script_score": {
              "script": {
                "source": `
                  // Penalty for longer company names when we have exact matches
                  String name = doc['Vrvirksomhed.navne.navn.keyword'].value;
                  if (name == null) return _score;
                  
                  String cleanName = name.toLowerCase().replaceAll(/\\s+/, ' ').trim();
                  String searchTerm = params.searchTerm.toLowerCase().trim();
                  
                  // If this is an exact match, apply length penalty
                  if (cleanName.equals(searchTerm)) {
                    // Shorter names get higher scores
                    double lengthPenalty = Math.max(0.5, 1.0 - (cleanName.length() - searchTerm.length()) * 0.01);
                    return _score * lengthPenalty;
                  }
                  
                  // If search term is contained in name, apply containment boost
                  if (cleanName.contains(searchTerm)) {
                    // Exact containment gets a boost, but less than exact match
                    if (cleanName.startsWith(searchTerm + ' ') || cleanName.endsWith(' ' + searchTerm) || cleanName.contains(' ' + searchTerm + ' ')) {
                      return _score * 0.9; // Word boundary match
                    }
                    return _score * 0.7; // Substring match
                  }
                  
                  return _score;
                `,
                "params": {
                  "searchTerm": cleanedQuery
                }
              }
            }
          }
        ],
        "boost_mode": "multiply",
        "score_mode": "multiply"
      }
    },
    "size": 100,
    "sort": [
      "_score"
    ]
  };
};
