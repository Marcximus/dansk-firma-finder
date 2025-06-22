
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
    // Check if the query looks like a person's name (contains spaces and multiple words)
    const isPersonSearch = companyName.trim().split(/\s+/).length >= 2;
    
    if (isPersonSearch) {
      // Search for person in company relationships
      return {
        "query": {
          "bool": {
            "should": [
              // Search in company name as well (in case it's actually a company)
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": companyName,
                    "fuzziness": "AUTO",
                    "operator": "and"
                  }
                }
              },
              // Search in participant names (board members, directors, owners, etc.)
              {
                "nested": {
                  "path": "Vrvirksomhed.deltagerRelation",
                  "query": {
                    "nested": {
                      "path": "Vrvirksomhed.deltagerRelation.deltager",
                      "query": {
                        "nested": {
                          "path": "Vrvirksomhed.deltagerRelation.deltager.navne",
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
      // Search by company name using match query with fuzziness
      return {
        "query": {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": companyName,
                    "fuzziness": "AUTO",
                    "operator": "and"
                  }
                }
              }
            ]
          }
        },
        "size": 100
      };
    }
  } else {
    throw new Error('Either CVR number or company name is required');
  }
};
