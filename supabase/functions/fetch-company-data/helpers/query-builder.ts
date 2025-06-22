
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

    // Split query into words for positional matching
    const queryWords = cleanedQuery.split(/\s+/);
    
    // Build positional query for word order scoring
    const buildPositionalQuery = (field: string, boost: number) => {
      if (queryWords.length === 1) {
        return {
          "match": {
            [field]: {
              "query": cleanedQuery,
              "boost": boost
            }
          }
        };
      }
      
      // For multi-word queries, create a span query that scores based on word positions
      return {
        "bool": {
          "should": [
            // Exact phrase gets highest boost
            {
              "match_phrase": {
                [field]: {
                  "query": cleanedQuery,
                  "boost": boost * 2
                }
              }
            },
            // Words in correct order get medium boost
            {
              "span_near": {
                "clauses": queryWords.map(word => ({
                  "span_term": { [field]: word }
                })),
                "slop": 2,
                "in_order": true,
                "boost": boost * 1.5
              }
            },
            // Words in any order get lower boost
            {
              "match": {
                [field]: {
                  "query": cleanedQuery,
                  "operator": "and",
                  "boost": boost
                }
              }
            }
          ]
        }
      };
    };

    // Refined hierarchical search with precise ranking
    return {
      "query": {
        "bool": {
          "should": [
            // TIER 1: EXACT MATCHES (Highest Priority - Boost 1000-900)
            // Exact company name match (current names)
            {
              "match_phrase": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "boost": 1000
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
                      "boost": 950
                    }
                  }
                }
              }
            },
            
            // TIER 2: SECONDARY/BI-NAMES EXACT MATCHES (High Priority - Boost 800-750)
            // Exact secondary company name match (binavne)
            {
              "match_phrase": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "boost": 800
                }
              }
            },
            
            // TIER 3: ALL WORDS PRESENT - POSITIONAL SCORING (Medium-High Priority - Boost 600-400)
            // Company names with all words (positional scoring)
            buildPositionalQuery("Vrvirksomhed.navne.navn", 200),
            
            // Person names with all words (positional scoring)
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": buildPositionalQuery("Vrvirksomhed.deltagerRelation.deltager.navne.navn", 180)
              }
            },
            
            // Secondary names with all words (positional scoring)
            buildPositionalQuery("Vrvirksomhed.binavne.navn", 160),
            
            // TIER 4: SINGLE WORD MATCHES WITH POSITION PREFERENCE (Medium Priority - Boost 150-50)
            // Single word matches with position scoring for company names
            ...queryWords.map((word, index) => ({
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": word,
                  "boost": 150 - (index * 20) // First word gets higher boost
                }
              }
            })),
            
            // Single word matches with position scoring for person names
            ...queryWords.map((word, index) => ({
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": word,
                      "boost": 120 - (index * 15) // First word gets higher boost
                    }
                  }
                }
              }
            })),
            
            // Single word matches for secondary names
            ...queryWords.map((word, index) => ({
              "match": {
                "Vrvirksomhed.binavne.navn": {
                  "query": word,
                  "boost": 100 - (index * 10) // First word gets higher boost
                }
              }
            })),
            
            // TIER 5: FUZZY AND PARTIAL MATCHES (Lower Priority - Boost 40-10)
            // Fuzzy matches for typos
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "fuzziness": "1",
                  "operator": "and",
                  "boost": 40
                }
              }
            },
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": cleanedQuery,
                      "fuzziness": "1",
                      "operator": "and",
                      "boost": 30
                    }
                  }
                }
              }
            },
            {
              "match": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "fuzziness": "1",
                  "operator": "and",
                  "boost": 25
                }
              }
            },
            
            // TIER 6: PARTIAL WORD MATCHES (Lowest Priority - Boost 15-5)
            // Partial matches (60% of words)
            {
              "match": {
                "Vrvirksomhed.navne.navn": {
                  "query": cleanedQuery,
                  "operator": "or",
                  "minimum_should_match": "60%",
                  "boost": 15
                }
              }
            },
            {
              "nested": {
                "path": "Vrvirksomhed.deltagerRelation",
                "query": {
                  "match": {
                    "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                      "query": cleanedQuery,
                      "operator": "or",
                      "minimum_should_match": "60%",
                      "boost": 10
                    }
                  }
                }
              }
            },
            {
              "match": {
                "Vrvirksomhed.binavne.navn": {
                  "query": cleanedQuery,
                  "operator": "or",
                  "minimum_should_match": "60%",
                  "boost": 5
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
