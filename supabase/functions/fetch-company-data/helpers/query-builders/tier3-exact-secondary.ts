
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier3ExactSecondaryQuery = (cleanedQuery: string) => {
  return {
    "match_phrase": {
      "Vrvirksomhed.binavne.navn": {
        "query": cleanedQuery,
        "boost": SEARCH_TIERS.EXACT_SECONDARY
      }
    }
  };
};
