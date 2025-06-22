

export const buildSearchQuery = (cvr?: string, companyName?: string) => {
  if (cvr) {
    // Search by CVR number - convert to integer for exact match
    return {
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "Vrvirksomhed.cvrNummer": parseInt(cvr)
              }
            }
          ]
        }
      }
    };
  } else if (companyName) {
    // Remove common Danish legal form suffixes from search query
    const legalFormSuffixes = [
      'A/S', 'ApS', 'I/S', 'P/S', 'K/S', 'G/S', 'F.M.B.A', 'FMBA', 'A.M.B.A', 'AMBA',
      'S.M.B.A', 'SMBA', 'V/S', 'E/S', 'AS', 'APS', 'IS', 'PS', 'KS', 'GS'
    ];
    
    let cleanedQuery = companyName.trim();
    
    // Remove legal form suffixes (case insensitive, word boundaries)
    for (const suffix of legalFormSuffixes) {
      const regex = new RegExp(`\\b${suffix.replace('/', '\\/')}\\b$`, 'i');
      cleanedQuery = cleanedQuery.replace(regex, '').trim();
    }
    
    // If the cleaned query is empty (user only searched for a legal form), use original
    if (!cleanedQuery) {
      cleanedQuery = companyName;
    }
    
    // Unified search that covers both company names and people
    return {
      "query": {
        "bool": {
          "should": [
            // Search in company names
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "fuzziness": "AUTO",
                  "operator": "and"
                }
              }
            },
            // Search in participant names (people associated with companies)
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": cleanedQuery,
                      "fuzziness": "AUTO",
                      "operator": "and"
                    }
                  }
                }
              }
            }
          ],
          "minimum_should_match": 1
        }
      },
      "size": 100
    };
  } else {
    throw new Error('Either CVR number or company name is required');
  }
};

