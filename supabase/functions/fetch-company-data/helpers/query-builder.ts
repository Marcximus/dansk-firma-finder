
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
    
    // Hierarchical search with clear priority levels
    return {
      "query": {
        "bool": {
          "should": [
            // TIER 1: EXACT MATCHES (Highest Priority - Boost 100)
            // Exact company name match (current names)
            {
              "match_phrase": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "boost": 100
                }
              }
            },
            // Exact company name match (secondary names)
            {
              "match_phrase": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "boost": 95
                }
              }
            },
            // Exact person name match
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match_phrase": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": cleanedQuery,
                      "boost": 90
                    }
                  }
                }
              }
            },
            
            // TIER 2: CLOSE MATCHES (High Priority - Boost 50-70)
            // Company name with minimal fuzziness (typos, small variations)
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "fuzziness": "1",
                  "operator": "and",
                  "boost": 70
                }
              }
            },
            // Secondary company names with minimal fuzziness
            {
              "match": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "fuzziness": "1",
                  "operator": "and",
                  "boost": 65
                }
              }
            },
            // Person names with minimal fuzziness
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": cleanedQuery,
                      "fuzziness": "1",
                      "operator": "and",
                      "boost": 50
                    }
                  }
                }
              }
            },
            
            // TIER 3: PARTIAL WORD MATCHES (Medium Priority - Boost 10-30)
            // Company name with all words required (but not as phrase)
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "operator": "and",
                  "boost": 30
                }
              }
            },
            // Secondary company names with all words required
            {
              "match": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "operator": "and",
                  "boost": 25
                }
              }
            },
            // Person names with all words required
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": cleanedQuery,
                      "operator": "and",
                      "boost": 20
                    }
                  }
                }
              }
            },
            
            // TIER 4: PARTIAL MATCHES (Lower Priority - Boost 1-10)
            // Company name with some words matching
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "operator": "or",
                  "minimum_should_match": "60%",
                  "boost": 10
                }
              }
            },
            // Secondary company names with some words matching
            {
              "match": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "operator": "or",
                  "minimum_should_match": "60%",
                  "boost": 8
                }
              }
            },
            // Person names with some words matching
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": cleanedQuery,
                      "operator": "or",
                      "minimum_should_match": "60%",
                      "boost": 5
                    }
                  }
                }
              }
            }
          ],
          "minimum_should_match": 1
        }
      },
      "size": 100,
      // Sort by relevance score (highest first)
      "sort": [
        "_score"
      ]
    };
  } else {
    throw new Error('Either CVR number or company name is required');
  }
};
