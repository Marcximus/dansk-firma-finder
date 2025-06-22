
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier1PhraseMatchQuery = (cleanedQuery: string) => {
  return {
    "bool": {
      "should": [
        {
          "match_phrase": {
            "Vrvirksomhed.navne.navn": {
              "query": cleanedQuery,
              "boost": SEARCH_TIERS.EXACT_MATCH
            }
          }
        },
        {
          "match_phrase": {
            "Vrvirksomhed.binavne.navn": {
              "query": cleanedQuery,
              "boost": SEARCH_TIERS.EXACT_MATCH
            }
          }
        }
      ]
    }
  };
};
