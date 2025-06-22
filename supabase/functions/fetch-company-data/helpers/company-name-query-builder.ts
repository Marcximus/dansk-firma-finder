
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildTier0ExactMatchQuery } from './query-builders/tier0-exact-match.ts';
import { buildTier1PhraseMatchQuery } from './query-builders/tier1-phrase-match.ts';
import { buildTier2ExactPrimaryQuery } from './query-builders/tier2-exact-primary.ts';
import { buildTier3ExactSecondaryQuery } from './query-builders/tier3-exact-secondary.ts';
import { buildTier4AllWordsQuery } from './query-builders/tier4-all-words.ts';
import { buildTier5CorrectPositionsQuery } from './query-builders/tier5-correct-positions.ts';
import { buildTier6RemainingQuery } from './query-builders/tier6-remaining.ts';

// Simplified hierarchical search query with clean tier-based ranking
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  console.log(`Building query for: "${cleanedQuery}" (original: "${companyName}")`);
  console.log(`Query words: ${queryWords.join(', ')}`);
  
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 0: TRUE EXACT MATCHES - only companies with exactly this name
          buildTier0ExactMatchQuery(cleanedQuery),
          
          // TIER 1: PHRASE matches for complete company names (case-insensitive)
          buildTier1PhraseMatchQuery(cleanedQuery),
          
          // TIER 2: EXACT matches on primary names (company names or person names) - case insensitive
          buildTier2ExactPrimaryQuery(cleanedQuery),
          
          // TIER 3: EXACT matches on secondary names (binavne) - case insensitive
          buildTier3ExactSecondaryQuery(cleanedQuery),
          
          // TIER 4: All words present (both words must be found)
          buildTier4AllWordsQuery(cleanedQuery),
          
          // TIER 5: Words in correct positions (first word at start gets priority)
          buildTier5CorrectPositionsQuery(queryWords),
          
          // TIER 6: All other remaining results (at least one word match)
          buildTier6RemainingQuery(cleanedQuery)
        ],
        "minimum_should_match": 1
      }
    },
    "size": 100,
    "sort": [
      "_score"
    ]
  };
};
