
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildPositionalQuery } from './positional-query-builder.ts';

// Company name search query builder with proper hierarchical ranking that prevents score accumulation
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  // Use function_score with boost_mode "replace" to ensure tier separation
  return {
    "query": {
      "function_score": {
        "query": {
          "bool": {
            "should": [
              // TIER 1: EXACT MATCHES ON PRIMARY NAMES (Highest Priority - Score 10000-9500)
              {
                "bool": {
                  "should": [
                    // Exact company name match (current names)
                    {
                      "match_phrase": {
                        "Vrvirksomhed.navne.navn": {
                          "query": cleanedQuery
                        }
                      }
                    },
                    // Exact person name match
                    {
                      "nested": {
                        "path": "Vrvirksomhed.deltagerRelation",
                        "query": {
                          "match_phrase": {
                            "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                              "query": cleanedQuery
                            }
                          }
                        }
                      }
                    }
                  ],
                  "boost": 1
                }
              },
              
              // TIER 2: EXACT MATCHES ON SECONDARY/BI-NAMES (Second Priority - Score 9000)
              {
                "bool": {
                  "should": [
                    {
                      "match_phrase": {
                        "Vrvirksomhed.binavne.navn": {
                          "query": cleanedQuery
                        }
                      }
                    }
                  ],
                  "boost": 1
                }
              },
              
              // TIER 3: ALL WORDS PRESENT - POSITIONAL SCORING (Medium-High Priority - Score 3000-2000)
              {
                "bool": {
                  "should": [
                    buildPositionalQuery("Vrvirksomhed.navne.navn", 1, queryWords, cleanedQuery),
                    {
                      "nested": {
                        "path": "Vrvirksomhed.deltagerRelation",
                        "query": buildPositionalQuery("Vrvirksomhed.deltagerRelation.deltager.navne.navn", 0.9, queryWords, cleanedQuery)
                      }
                    }
                  ],
                  "boost": 1
                }
              },
              
              // TIER 4: SINGLE WORD MATCHES WITH STRONG POSITION PREFERENCE (Medium Priority - Score 1500-300)
              {
                "bool": {
                  "should": [
                    ...queryWords.map((word, index) => ({
                      "match": {
                        "Vrvirksomhed.navne.navn": {
                          "query": word,
                          "boost": index === 0 ? 1.5 : Math.max(0.8 - (index * 0.1), 0.3)
                        }
                      }
                    })),
                    ...queryWords.map((word, index) => ({
                      "nested": {
                        "path": "Vrvirksomhed.deltagerRelation",
                        "query": {
                          "match": {
                            "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                              "query": word,
                              "boost": index === 0 ? 1.4 : Math.max(0.7 - (index * 0.08), 0.25)
                            }
                          }
                        }
                      }
                    }))
                  ],
                  "boost": 1
                }
              },
              
              // TIER 5: MATCHES ON SECONDARY NAMES (BINAVNE) - ALL WORDS AND SINGLE WORDS (Medium-Low Priority - Score 700-150)
              {
                "bool": {
                  "should": [
                    buildPositionalQuery("Vrvirksomhed.binavne.navn", 0.6, queryWords, cleanedQuery),
                    ...queryWords.map((word, index) => ({
                      "match": {
                        "Vrvirksomhed.binavne.navn": {
                          "query": word,
                          "boost": index === 0 ? 0.7 : Math.max(0.4 - (index * 0.05), 0.15)
                        }
                      }
                    }))
                  ],
                  "boost": 1
                }
              },
              
              // TIER 6: ALL OTHER REMAINING RESULTS - FUZZY AND PARTIAL MATCHES (Lower Priority - Score 100-5)
              {
                "bool": {
                  "should": [
                    {
                      "match": {
                        "Vrvirksomhed.navne.navn": {
                          "query": cleanedQuery,
                          "fuzziness": "1",
                          "operator": "and",
                          "boost": 0.1
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
                              "fuzziness": "1",
                              "operator": "and",
                              "boost": 0.08
                            }
                          }
                        }
                      }
                    },
                    {
                      "match": {
                        "Vrvirksomhed.binavne.navn": {
                          "query": cleanedQuery,
                          "fuzziness": "1",
                          "operator": "and",
                          "boost": 0.06
                        }
                      }
                    },
                    {
                      "match": {
                        "Vrvirksomhed.navne.navn": {
                          "query": cleanedQuery,
                          "operator": "or",
                          "minimum_should_match": "60%",
                          "boost": 0.04
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
                              "minimum_should_match": "60%",
                              "boost": 0.03
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
                          "minimum_should_match": "60%",
                          "boost": 0.02
                        }
                      }
                    }
                  ],
                  "boost": 1
                }
              }
            ],
            "minimum_should_match": 1
          }
        },
        "functions": [
          {
            "filter": {
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
                    "nested": {
                      "path": "Vrvirksomhed.deltagerRelation",
                      "query": {
                        "match_phrase": {
                          "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                            "query": cleanedQuery
                          }
                        }
                      }
                    }
                  }
                ]
              }
            },
            "weight": 10000
          },
          {
            "filter": {
              "match_phrase": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery
                }
              }
            },
            "weight": 9000
          },
          {
            "filter": {
              "bool": {
                "should": [
                  {
                    "match": {
                      "Vrvirksomhed.navne.navn": {
                        "query": cleanedQuery,
                        "operator": "and"
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
                            "operator": "and"
                          }
                        }
                      }
                    }
                  }
                ]
              }
            },
            "weight": 3000
          },
          {
            "filter": {
              "match": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "operator": "and"
                }
              }
            },
            "weight": 700
          }
        ],
        "score_mode": "max",
        "boost_mode": "replace"
      }
    },
    "size": 100,
    "sort": [
      "_score"
    ]
  };
};
