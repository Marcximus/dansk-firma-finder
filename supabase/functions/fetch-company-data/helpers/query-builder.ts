
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
    // Unified search that covers both company names and people
    return {
      "query": {
        "bool": {
          "should": [
            // Search in company names
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": companyName,
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
                      "query": companyName,
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
