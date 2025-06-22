
import { SEARCH_TIERS } from '../search-tiers.ts';

export const buildTier0ExactMatchQuery = (cleanedQuery: string) => {
  return {
    "function_score": {
      "query": {
        "bool": {
          "should": [
            {
              "bool": {
                "must": [
                  {
                    "term": {
                      "Vrvirksomhed.navne.navn.keyword": cleanedQuery
                    }
                  }
                ]
              }
            },
            {
              "bool": {
                "must": [
                  {
                    "term": {
                      "Vrvirksomhed.binavne.navn.keyword": cleanedQuery
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      "functions": [
        {
          "field_value_factor": {
            "field": "Vrvirksomhed.navne.navn.keyword",
            "modifier": "reciprocal",
            "factor": 1,
            "missing": 1
          }
        }
      ],
      "boost": SEARCH_TIERS.SHORTEST_EXACT_MATCH,
      "score_mode": "multiply",
      "boost_mode": "multiply"
    }
  };
};
