
import { cleanCompanyName } from './legal-form-utils.ts';
import { SEARCH_TIERS } from './search-tiers.ts';

// Build exact match queries for company names
export const buildExactMatchQueries = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  
  return [
    // TIER 0: TRUE EXACT matches (case-insensitive, exact company name)
    {
      "bool": {
        "should": [
          {
            "bool": {
              "must": [
                {
                  "match": {
                    "Vrvirksomhed.navne.navn": {
                      "query": cleanedQuery,
                      "operator": "and"
                    }
                  }
                }
              ],
              "filter": [
                {
                  "script": {
                    "script": {
                      "source": `
                        String name = doc['Vrvirksomhed.navne.navn.keyword'].value;
                        if (name == null) return false;
                        String cleanName = name.toLowerCase().replaceAll(/\\s+/, ' ').trim();
                        String searchTerm = params.searchTerm.toLowerCase().trim();
                        return cleanName.equals(searchTerm);
                      `,
                      "params": {
                        "searchTerm": cleanedQuery
                      }
                    }
                  }
                }
              ],
              "boost": SEARCH_TIERS.EXACT_MATCH
            }
          },
          {
            "bool": {
              "must": [
                {
                  "match": {
                    "Vrvirksomhed.binavne.navn": {
                      "query": cleanedQuery,
                      "operator": "and"
                    }
                  }
                }
              ],
              "filter": [
                {
                  "script": {
                    "script": {
                      "source": `
                        String name = doc['Vrvirksomhed.binavne.navn.keyword'].value;
                        if (name == null) return false;
                        String cleanName = name.toLowerCase().replaceAll(/\\s+/, ' ').trim();
                        String searchTerm = params.searchTerm.toLowerCase().trim();
                        return cleanName.equals(searchTerm);
                      `,
                      "params": {
                        "searchTerm": cleanedQuery
                      }
                    }
                  }
                }
              ],
              "boost": SEARCH_TIERS.EXACT_MATCH
            }
          }
        ]
      }
    }
  ];
};
