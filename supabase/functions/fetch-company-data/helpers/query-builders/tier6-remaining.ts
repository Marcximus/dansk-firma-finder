
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier6RemainingQuery = (cleanedQuery: string) => {
  return {
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
  };
};
