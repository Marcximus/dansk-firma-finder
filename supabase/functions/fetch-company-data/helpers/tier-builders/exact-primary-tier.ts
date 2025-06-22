
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildExactPrimaryTier = (cleanedQuery: string) => {
  return {
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
  };
};
