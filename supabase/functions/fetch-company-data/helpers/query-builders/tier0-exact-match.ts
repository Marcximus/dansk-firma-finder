
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier0ExactMatchQuery = (cleanedQuery: string) => {
  return {
    "bool": {
      "should": [
        // Case-insensitive exact match for company names with length preference
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": cleanedQuery,
                    "operator": "and",
                    "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
                  }
                }
              }
            ],
            "filter": [
              {
                "script": {
                  "script": {
                    "source": "doc['Vrvirksomhed.navne.navn.keyword'].value.toLowerCase() == params.query.toLowerCase()",
                    "params": {
                      "query": cleanedQuery
                    }
                  }
                }
              }
            ]
          }
        },
        // Case-insensitive exact match for secondary names (binavne) with length preference
        {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.binavne.navn": {
                    "query": cleanedQuery,
                    "operator": "and",
                    "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH
                  }
                }
              }
            ],
            "filter": [
              {
                "script": {
                  "script": {
                    "source": "doc['Vrvirksomhed.binavne.navn.keyword'].value.toLowerCase() == params.query.toLowerCase()",
                    "params": {
                      "query": cleanedQuery
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    }
  };
};
