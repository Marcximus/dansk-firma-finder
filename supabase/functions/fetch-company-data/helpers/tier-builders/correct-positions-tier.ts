
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildCorrectPositionsTier = (cleanedQuery: string, queryWords: string[]) => {
  return {
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
  };
};
