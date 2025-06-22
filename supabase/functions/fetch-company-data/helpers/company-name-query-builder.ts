
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildPositionalQuery } from './positional-query-builder.ts';

// Company name search query builder with corrected hierarchical ranking
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  // Corrected hierarchical search with proper boost separation
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 1: EXACT MATCHES ON PRIMARY NAMES (Highest Priority - Boost 10000-9500)
          // Exact company name match (current names)
          {
            "match_phrase": {
              "Vrvirksomhed.navne.navn": {
                "query": cleanedQuery,
                "boost": 10000
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
                    "boost": 9500
                  }
                }
              }
            }
          },
          
          // TIER 2: EXACT MATCHES ON SECONDARY/BI-NAMES (Second Priority - Boost 9000)
          // Exact secondary company name match (binavne) - MUST rank higher than partial matches
          {
            "match_phrase": {
              "Vrvirksomhed.binavne.navn": {
                "query": cleanedQuery,
                "boost": 9000
              }
            }
          },
          
          // TIER 3: ALL WORDS PRESENT - POSITIONAL SCORING (Medium-High Priority - Boost 3000-2000)
          // Company names with all words (positional scoring favors correct order)
          buildPositionalQuery("Vrvirksomhed.navne.navn", 1000, queryWords, cleanedQuery),
          
          // Person names with all words (positional scoring)
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": buildPositionalQuery("Vrvirksomhed.deltagerRelation.deltager.navne.navn", 900, queryWords, cleanedQuery)
            }
          },
          
          // TIER 4: SINGLE WORD MATCHES WITH STRONG POSITION PREFERENCE (Medium Priority - Boost 1500-800)
          // Enhanced positional scoring for single words - first word gets much higher boost
          ...queryWords.map((word, index) => ({
            "match": {
              "Vrvirksomhed.navne.navn": {
                "query": word,
                "boost": index === 0 ? 1500 : Math.max(800 - (index * 100), 300) // First word gets 1500, subsequent words decrease significantly
              }
            }
          })),
          
          // Person names with enhanced positional scoring
          ...queryWords.map((word, index) => ({
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": {
                "match": {
                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                    "query": word,
                    "boost": index === 0 ? 1400 : Math.max(700 - (index * 80), 250) // First word gets 1400, subsequent words decrease
                  }
                }
              }
            }
          })),
          
          // TIER 5: MATCHES ON SECONDARY NAMES (BINAVNE) - ALL WORDS AND SINGLE WORDS (Medium-Low Priority - Boost 700-200)
          // Secondary names with all words (positional scoring)
          buildPositionalQuery("Vrvirksomhed.binavne.navn", 600, queryWords, cleanedQuery),
          
          // Single word matches for secondary names with positional preference
          ...queryWords.map((word, index) => ({
            "match": {
              "Vrvirksomhed.binavne.navn": {
                "query": word,
                "boost": index === 0 ? 700 : Math.max(400 - (index * 50), 150) // First word gets higher boost
              }
            }
          })),
          
          // TIER 6: ALL OTHER REMAINING RESULTS - FUZZY AND PARTIAL MATCHES (Lower Priority - Boost 100-5)
          // Fuzzy matches for typos in primary names
          {
            "match": {
              "Vrvirksomhed.navne.navn": {
                "query": cleanedQuery,
                "fuzziness": "1",
                "operator": "and",
                "boost": 100
              }
            }
          },
          // Fuzzy matches for person names
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": {
                "match": {
                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                    "query": cleanedQuery,
                    "fuzziness": "1",
                    "operator": "and",
                    "boost": 80
                  }
                }
              }
            }
          },
          // Fuzzy matches for secondary names
          {
            "match": {
              "Vrvirksomhed.binavne.navn": {
                "query": cleanedQuery,
                "fuzziness": "1",
                "operator": "and",
                "boost": 60
              }
            }
          },
          
          // Partial matches (60% of words) - lowest priority
          {
            "match": {
              "Vrvirksomhed.navne.navn": {
                "query": cleanedQuery,
                "operator": "or",
                "minimum_should_match": "60%",
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
                    "operator": "or",
                    "minimum_should_match": "60%",
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
                "operator": "or",
                "minimum_should_match": "60%",
                "boost": 20
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
