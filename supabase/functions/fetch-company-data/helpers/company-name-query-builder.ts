
import { cleanCompanyName } from './legal-form-utils.ts';

// Pure hierarchical search with no scoring - just tier-based filtering
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
              "boost": 10000
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
                    // Exclude if already matched in tier 1
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
              "boost": 9000
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
                    // Exclude if already matched in previous tiers
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
              "boost": 8000
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
                          // Check if first word appears at the beginning
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
                    },
                    // Exclude if already matched in previous tiers
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
              "boost": 7000
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
                    // Exclude if already matched in previous tiers
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
              "boost": 6000
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
