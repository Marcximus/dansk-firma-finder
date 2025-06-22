
import { cleanCompanyName } from './legal-form-utils.ts';
import { SEARCH_TIERS } from './search-tiers.ts';

// Build exact match queries for company names using native Elasticsearch features only
export const buildExactMatchQueries = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  
  return [
    // TIER 0: TRUE EXACT matches using term queries on keyword fields
    {
      "bool": {
        "should": [
          {
            "term": {
              "Vrvirksomhed.navne.navn.keyword": {
                "value": cleanedQuery,
                "boost": SEARCH_TIERS.EXACT_MATCH,
                "case_insensitive": true
              }
            }
          },
          {
            "term": {
              "Vrvirksomhed.binavne.navn.keyword": {
                "value": cleanedQuery,
                "boost": SEARCH_TIERS.EXACT_MATCH,
                "case_insensitive": true
              }
            }
          }
        ]
      }
    }
  ];
};
