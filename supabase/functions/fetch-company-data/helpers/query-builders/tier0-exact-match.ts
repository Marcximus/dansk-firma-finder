
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier0ExactMatchQuery = (cleanedQuery: string) => {
  return {
    "bool": {
      "should": [
        {
          "term": {
            "Vrvirksomhed.navne.navn.keyword": {
              "value": cleanedQuery,
              "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
            }
          }
        },
        {
          "term": {
            "Vrvirksomhed.binavne.navn.keyword": {
              "value": cleanedQuery,
              "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
            }
          }
        }
      ]
    }
  };
};
