
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildExactMatchQueries } from './exact-match-builder.ts';
import { buildPhraseMatchQueries } from './phrase-match-builder.ts';

// Simplified hierarchical search query without custom scripts
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  
  console.log(`Building query for: "${cleanedQuery}" (original: "${companyName}")`);
  console.log(`Query words: ${cleanedQuery.split(/\s+/).join(', ')}`);
  
  // Get all query components
  const exactMatchQueries = buildExactMatchQueries(companyName);
  const phraseMatchQueries = buildPhraseMatchQueries(companyName);
  
  return {
    "query": {
      "bool": {
        "should": [
          ...exactMatchQueries,
          ...phraseMatchQueries
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
