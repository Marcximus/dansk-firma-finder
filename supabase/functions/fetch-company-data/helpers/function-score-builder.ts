
import { cleanCompanyName } from './legal-form-utils.ts';

// Build function score for length penalties using native Elasticsearch features only
export const buildFunctionScore = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  
  return [
    // Use field_value_factor to apply length-based scoring
    {
      "field_value_factor": {
        "field": "Vrvirksomhed.navne.navn.keyword",
        "factor": 1.0,
        "modifier": "none",
        "missing": 1
      },
      "weight": 1.0
    },
    // Add a simple boost for shorter names
    {
      "weight": 1.2,
      "filter": {
        "range": {
          "Vrvirksomhed.navne.navn.keyword": {
            "gte": cleanedQuery,
            "lte": cleanedQuery + "Z"
          }
        }
      }
    }
  ];
};
