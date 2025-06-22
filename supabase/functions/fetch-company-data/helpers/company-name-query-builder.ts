
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildPositionalQuery } from './positional-query-builder.ts';

// Company name search query builder
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
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
          buildPositionalQuery("Vrvirksomhed.navne.navn", 200, queryWords, cleanedQuery),
          
          // Person names with all words (positional scoring)
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": buildPositionalQuery("Vrvirksomhed.deltagerRelation.deltager.navne.navn", 180, queryWords, cleanedQuery)
            }
          },
          
          // Secondary names with all words (positional scoring)
          buildPositionalQuery("Vrvirksomhed.binavne.navn", 160, queryWords, cleanedQuery),
          
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
};
