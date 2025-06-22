
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier5CorrectPositionsQuery = (queryWords: string[]) => {
  return {
    "bool": {
      "should": [
        {
          "match_phrase_prefix": {
            "Vrvirksomhed.navne.navn": {
              "query": queryWords[0],
              "boost": SEARCH_TIERS.CORRECT_POSITIONS
            }
          }
        },
        {
          "nested": {
            "path": "Vrvirksomhed.deltagerRelation",
            "query": {
              "match_phrase_prefix": {
                "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                  "query": queryWords[0],
                  "boost": SEARCH_TIERS.CORRECT_POSITIONS
                }
              }
            }
          }
        },
        {
          "match_phrase_prefix": {
            "Vrvirksomhed.binavne.navn": {
              "query": queryWords[0],
              "boost": SEARCH_TIERS.CORRECT_POSITIONS
            }
          }
        }
      ]
    }
  };
};
