
import { cleanCompanyName } from './legal-form-utils.ts';
import { SEARCH_TIERS } from './search-tiers.ts';

// Single hierarchical search query with proper tier-based ranking
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 1: EXACT matches on primary names (company names or person names)
          {
            "constant_score": {
              "filter": {
                "bool": {
                  "should": [
                    {
                      "match_phrase": {
                        "Vrvirksomhed.navne.navn": cleanedQuery
                      }
                    },
                    {
                      "nested": {
                        "path": "Vrvirksomhed.deltagerRelation",
                        "query": {
                          "match_phrase": {
                            "Vrvirksomhed.deltagerRelation.deltager.navne.navn": cleanedQuery
                          }
                        }
                      }
                    }
                  ]
                }
              },
              "boost": SEARCH_TIERS.EXACT_PRIMARY
            }
          },
          
          // TIER 2: EXACT matches on secondary names (binavne)
          {
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
                      "match_phrase": {
                        "Vrvirksomhed.binavne.navn": cleanedQuery
                      }
                    },
                    {
                      "bool": {
                        "must_not": [
                          {
                            "bool": {
                              "should": [
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.navne.navn": cleanedQuery
                                  }
                                },
                                {
                                  "nested": {
                                    "path": "Vrvirksomhed.deltagerRelation",
                                    "query": {
                                      "match_phrase": {
                                        "Vrvirksomhed.deltagerRelation.deltager.navne.navn": cleanedQuery
                                      }
                                    }
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              "boost": SEARCH_TIERS.EXACT_SECONDARY
            }
          },
          
          // TIER 3: All words present (both words must be found)
          {
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
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
                          },
                          {
                            "match": {
                              "Vrvirksomhed.binavne.navn": {
                                "query": cleanedQuery,
                                "operator": "and"
                              }
                            }
                          }
                        ]
                      }
                    },
                    {
                      "bool": {
                        "must_not": [
                          {
                            "bool": {
                              "should": [
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.navne.navn": cleanedQuery
                                  }
                                },
                                {
                                  "nested": {
                                    "path": "Vrvirksomhed.deltagerRelation",
                                    "query": {
                                      "match_phrase": {
                                        "Vrvirksomhed.deltagerRelation.deltager.navne.navn": cleanedQuery
                                      }
                                    }
                                  }
                                },
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.binavne.navn": cleanedQuery
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              "boost": SEARCH_TIERS.ALL_WORDS
            }
          },
          
          // TIER 4: Words in correct positions (Nordic as 1st word gets higher than others)
          {
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
                      "bool": {
                        "should": [
                          {
                            "regexp": {
                              "Vrvirksomhed.navne.navn": `^${queryWords[0]}.*`
                            }
                          },
                          {
                            "nested": {
                              "path": "Vrvirksomhed.deltagerRelation",
                              "query": {
                                "regexp": {
                                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": `^${queryWords[0]}.*`
                                }
                              }
                            }
                          },
                          {
                            "regexp": {
                              "Vrvirksomhed.binavne.navn": `^${queryWords[0]}.*`
                            }
                          }
                        ]
                      }
                    },
                    {
                      "bool": {
                        "must_not": [
                          {
                            "bool": {
                              "should": [
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.navne.navn": cleanedQuery
                                  }
                                },
                                {
                                  "nested": {
                                    "path": "Vrvirksomhed.deltagerRelation",
                                    "query": {
                                      "match_phrase": {
                                        "Vrvirksomhed.deltagerRelation.deltager.navne.navn": cleanedQuery
                                      }
                                    }
                                  }
                                },
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.binavne.navn": cleanedQuery
                                  }
                                },
                                {
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
                                      },
                                      {
                                        "match": {
                                          "Vrvirksomhed.binavne.navn": {
                                            "query": cleanedQuery,
                                            "operator": "and"
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              "boost": SEARCH_TIERS.CORRECT_POSITIONS
            }
          },
          
          // TIER 5: All other remaining results (at least one word match)
          {
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
                      "bool": {
                        "should": [
                          {
                            "match": {
                              "Vrvirksomhed.navne.navn": {
                                "query": cleanedQuery,
                                "operator": "or"
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
                                    "operator": "or"
                                  }
                                }
                              }
                            }
                          },
                          {
                            "match": {
                              "Vrvirksomhed.binavne.navn": {
                                "query": cleanedQuery,
                                "operator": "or"
                              }
                            }
                          }
                        ]
                      }
                    },
                    {
                      "bool": {
                        "must_not": [
                          {
                            "bool": {
                              "should": [
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.navne.navn": cleanedQuery
                                  }
                                },
                                {
                                  "nested": {
                                    "path": "Vrvirksomhed.deltagerRelation",
                                    "query": {
                                      "match_phrase": {
                                        "Vrvirksomhed.deltagerRelation.deltager.navne.navn": cleanedQuery
                                      }
                                    }
                                  }
                                },
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.binavne.navn": cleanedQuery
                                  }
                                },
                                {
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
                                      },
                                      {
                                        "match": {
                                          "Vrvirksomhed.binavne.navn": {
                                            "query": cleanedQuery,
                                            "operator": "and"
                                          }
                                        }
                                      }
                                    ]
                                  }
                                },
                                {
                                  "bool": {
                                    "should": [
                                      {
                                        "regexp": {
                                          "Vrvirksomhed.navne.navn": `^${queryWords[0]}.*`
                                        }
                                      },
                                      {
                                        "nested": {
                                          "path": "Vrvirksomhed.deltagerRelation",
                                          "query": {
                                            "regexp": {
                                              "Vrvirksomhed.deltagerRelation.deltager.navne.navn": `^${queryWords[0]}.*`
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "regexp": {
                                          "Vrvirksomhed.binavne.navn": `^${queryWords[0]}.*`
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              "boost": SEARCH_TIERS.REMAINING
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
