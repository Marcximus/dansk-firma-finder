
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildExactSecondaryTier = (cleanedQuery: string) => {
  return {
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
  };
};
