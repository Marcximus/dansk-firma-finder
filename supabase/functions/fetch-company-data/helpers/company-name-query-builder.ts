
import { cleanCompanyName } from './legal-form-utils.ts';

// Company name search query builder with strict static hierarchical ranking (no score accumulation)
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 1: EXACT MATCHES ON PRIMARY NAMES (Score: exactly 10000)
          {
            "constant_score": {
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
              "boost": 10000
            }
          },
          
          // TIER 2: EXACT MATCHES ON SECONDARY/BI-NAMES (Score: exactly 9000)
          {
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
                      "match_phrase": {
                        "Vrvirksomhed.binavne.navn": {
                          "query": cleanedQuery
                        }
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
          
          // TIER 3: ALL WORDS PRESENT IN PRIMARY NAMES (Score: exactly 8000)
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
          
          // TIER 4: SINGLE WORDS IN CORRECT POSITIONS IN PRIMARY NAMES (Score: 7000-6000)
          ...queryWords.map((word, index) => ({
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
                      "bool": {
                        "should": [
                          {
                            "match": {
                              "Vrvirksomhed.navne.navn": word
                            }
                          },
                          {
                            "nested": {
                              "path": "Vrvirksomhed.deltagerRelation",
                              "query": {
                                "match": {
                                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": word
                                }
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
                                },
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.binavne.navn": {
                                      "query": cleanedQuery
                                    }
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
              "boost": index === 0 ? 7000 : Math.max(6500 - (index * 200), 6000)
            }
          })),
          
          // TIER 5: ALL WORDS PRESENT IN SECONDARY NAMES (Score: exactly 5000)
          {
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
                      "match": {
                        "Vrvirksomhed.binavne.navn": {
                          "query": cleanedQuery,
                          "operator": "and"
                        }
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
                                },
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.binavne.navn": {
                                      "query": cleanedQuery
                                    }
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
              "boost": 5000
            }
          },
          
          // TIER 6: SINGLE WORDS IN SECONDARY NAMES (Score: 4000-3000)
          ...queryWords.map((word, index) => ({
            "constant_score": {
              "filter": {
                "bool": {
                  "must": [
                    {
                      "match": {
                        "Vrvirksomhed.binavne.navn": word
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
                                },
                                {
                                  "match_phrase": {
                                    "Vrvirksomhed.binavne.navn": {
                                      "query": cleanedQuery
                                    }
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
                                      }
                                    ]
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
              },
              "boost": index === 0 ? 4000 : Math.max(3500 - (index * 200), 3000)
            }
          })),
          
          // TIER 7: ALL OTHER REMAINING RESULTS (Score: 100-1000)
          {
            "bool": {
              "should": [
                {
                  "match": {
                    "Vrvirksomhed.navne.navn": {
                      "query": cleanedQuery,
                      "fuzziness": "1",
                      "boost": 1000
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
                          "boost": 800
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
                      "boost": 600
                    }
                  }
                },
                {
                  "match": {
                    "Vrvirksomhed.navne.navn": {
                      "query": cleanedQuery,
                      "operator": "or",
                      "minimum_should_match": "60%",
                      "boost": 400
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
                          "boost": 300
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
                      "boost": 200
                    }
                  }
                },
                ...queryWords.map((word, index) => ({
                  "match": {
                    "Vrvirksomhed.navne.navn": {
                      "query": word,
                      "boost": Math.max(150 - (index * 10), 100)
                    }
                  }
                }))
              ],
              "must_not": [
                {
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
                      },
                      {
                        "match_phrase": {
                          "Vrvirksomhed.binavne.navn": {
                            "query": cleanedQuery
                          }
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
                            }
                          ]
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
