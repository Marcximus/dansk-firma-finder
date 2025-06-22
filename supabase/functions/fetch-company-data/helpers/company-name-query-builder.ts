
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildPositionalQuery } from './positional-query-builder.ts';

// Company name search query builder with refined ranking
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  // Refined hierarchical search with precise ranking according to requirements
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 1: EXACT MATCHES ON PRIMARY NAMES (Highest Priority - Boost 1000-950)
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
          
          // TIER 2: EXACT MATCHES ON SECONDARY/BI-NAMES (High Priority - Boost 900-850)
          // Exact secondary company name match (binavne)
          {
            "match_phrase": {
              "Vrvirksomhed.binavne.navn": {
                "query": cleanedQuery,
                "boost": 900
              }
            }
          },
          
          // TIER 3: ALL WORDS PRESENT - POSITIONAL SCORING (Medium-High Priority - Boost 800-600)
          // Company names with all words (positional scoring favors correct order)
          buildPositionalQuery("Vrvirksomhed.navne.navn", 300, queryWords, cleanedQuery),
          
          // Person names with all words (positional scoring)
          {
            "nested": {
              "path": "Vrvirksomhed.deltagerRelation",
              "query": buildPositionalQuery("Vrvirksomhed.deltagerRelation.deltager.navne.navn", 280, queryWords, cleanedQuery)
            }
          },
          
          // TIER 4: SINGLE WORD MATCHES WITH STRONG POSITION PREFERENCE (Medium Priority - Boost 500-300)
          // Enhanced positional scoring for single words - first word gets much higher boost
          ...queryWords.map((word, index) => ({
            "match": {
              "Vrvirksomhed.navne.navn": {
                "query": word,
                "boost": index === 0 ? 500 : Math.max(300 - (index * 50), 100) // First word gets 500, subsequent words decrease significantly
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
                    "boost": index === 0 ? 450 : Math.max(250 - (index * 40), 80) // First word gets 450, subsequent words decrease
                  }
                }
              }
            }
          })),
          
          // TIER 5: MATCHES ON SECONDARY NAMES (BINAVNE) - ALL WORDS AND SINGLE WORDS (Medium-Low Priority - Boost 250-100)
          // Secondary names with all words (positional scoring)
          buildPositionalQuery("Vrvirksomhed.binavne.navn", 200, queryWords, cleanedQuery),
          
          // Single word matches for secondary names with positional preference
          ...queryWords.map((word, index) => ({
            "match": {
              "Vrvirksomhed.binavne.navn": {
                "query": word,
                "boost": index === 0 ? 250 : Math.max(150 - (index * 30), 50) // First word gets higher boost
              }
            }
          })),
          
          // TIER 6: ALL OTHER REMAINING RESULTS - FUZZY AND PARTIAL MATCHES (Lower Priority - Boost 40-5)
          // Fuzzy matches for typos in primary names
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
                    "boost": 30
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
                "boost": 25
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
