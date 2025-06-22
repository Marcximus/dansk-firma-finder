
import { cleanCompanyName } from './legal-form-utils.ts';
import { buildExactMatchQueries } from './exact-match-builder.ts';
import { buildPhraseMatchQueries } from './phrase-match-builder.ts';
import { buildFunctionScore } from './function-score-builder.ts';

// Enhanced hierarchical search query with proper exact matching and length penalties
export const buildCompanyNameQuery = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  
  console.log(`Building query for: "${cleanedQuery}" (original: "${companyName}")`);
  console.log(`Query words: ${cleanedQuery.split(/\s+/).join(', ')}`);
  
  // Get all query components
  const exactMatchQueries = buildExactMatchQueries(companyName);
  const phraseMatchQueries = buildPhraseMatchQueries(companyName);
  const functionScoreFunctions = buildFunctionScore(companyName);
  
  return {
    "query": {
      "function_score": {
        "query": {
          "bool": {
            "should": [
              ...exactMatchQueries,
              ...phraseMatchQueries
            ],
            "minimum_should_match": 1
          }
        },
        "functions": functionScoreFunctions,
        "boost_mode": "multiply",
        "score_mode": "multiply"
      }
    },
    "size": 100,
    "sort": [
      "_score"
    ]
  };
};
