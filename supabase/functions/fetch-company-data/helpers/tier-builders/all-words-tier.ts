
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildAllWordsTier = (cleanedQuery: string) => {
  return {
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
  };
};
