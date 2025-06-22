
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildExactPrimaryTier } from './tier-builders/exact-primary-tier.ts';
import { buildExactSecondaryTier } from './tier-builders/exact-secondary-tier.ts';
import { buildAllWordsTier } from './tier-builders/all-words-tier.ts';
import { buildCorrectPositionsTier } from './tier-builders/correct-positions-tier.ts';
import { buildRemainingTier } from './tier-builders/remaining-tier.ts';

// Pure hierarchical search with no scoring - just tier-based filtering
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  const queryWords = cleanedQuery.split(/\s+/);
  
  return {
    "query": {
      "bool": {
        "should": [
          // TIER 1: EXACT matches on primary names (company names or person names)
          buildExactPrimaryTier(cleanedQuery),
          
          // TIER 2: EXACT matches on secondary names (binavne)
          buildExactSecondaryTier(cleanedQuery),
          
          // TIER 3: All words present (both words must be found)
          buildAllWordsTier(cleanedQuery),
          
          // TIER 4: Words in correct positions (Nordic as 1st word gets higher than others)
          buildCorrectPositionsTier(cleanedQuery, queryWords),
          
          // TIER 5: All other remaining results (at least one word match)
          buildRemainingTier(cleanedQuery, queryWords)
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
