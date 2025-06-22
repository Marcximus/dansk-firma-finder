
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier2ExactPrimaryQuery = (cleanedQuery: string) => {
  return {
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
  };
};
