
import { cleanCompanyName } from './legal-form-utils.ts';

// Build function score for length penalties and exact match boosts
export const buildFunctionScore = (companyName: string) => {
  const cleanedQuery = cleanCompanyName(companyName);
  
  return [
    {
      "script_score": {
        "script": {
          "source": `
            // Penalty for longer company names when we have exact matches
            String name = doc['Vrvirksomhed.navne.navn.keyword'].value;
            if (name == null) return _score;
            
            String cleanName = name.toLowerCase().replaceAll(/\\s+/, ' ').trim();
            String searchTerm = params.searchTerm.toLowerCase().trim();
            
            // If this is an exact match, apply length penalty
            if (cleanName.equals(searchTerm)) {
              // Shorter names get higher scores
              double lengthPenalty = Math.max(0.5, 1.0 - (cleanName.length() - searchTerm.length()) * 0.01);
              return _score * lengthPenalty;
            }
            
            // If search term is contained in name, apply containment boost
            if (cleanName.contains(searchTerm)) {
              // Exact containment gets a boost, but less than exact match
              if (cleanName.startsWith(searchTerm + ' ') || cleanName.endsWith(' ' + searchTerm) || cleanName.contains(' ' + searchTerm + ' ')) {
                return _score * 0.9; // Word boundary match
              }
              return _score * 0.7; // Substring match
            }
            
            return _score;
          `,
          "params": {
            "searchTerm": cleanedQuery
          }
        }
      }
    }
  ];
};
