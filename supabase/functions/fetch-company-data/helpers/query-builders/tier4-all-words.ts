
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier4AllWordsQuery = (cleanedQuery: string) => {
  return {
    "bool": {
      "should": [
        {
          "match": {
            "Vrvirksomhed.navne.navn": {
              "query": cleanedQuery,
              "operator": "and",
              "boost": SEARCH_TIERS.ALL_WORDS
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
                  "operator": "and",
                  "boost": SEARCH_TIERS.ALL_WORDS
                }
              }
            }
          }
        },
        {
          "match": {
            "Vrvirksomhed.binavne.navn": {
              "query": cleanedQuery,
              "operator": "and",
              "boost": SEARCH_TIERS.ALL_WORDS
            }
          }
        }
      ]
    }
  };
};
