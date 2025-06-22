
// Utility functions for handling Danish legal form suffixes
export const LEGAL_FORM_SUFFIXES = [
  'A/S', 'ApS', 'I/S', 'P/S', 'K/S', 'G/S', 'F.M.B.A', 'FMBA', 'A.M.B.A', 'AMBA',
  'S.M.B.A', 'SMBA', 'V/S', 'E/S', 'AS', 'APS', 'IS', 'PS', 'KS', 'GS'
];

export const cleanCompanyName = (companyName: string): string => {
  let cleanedQuery = companyName.trim();
  
  // Remove legal form suffixes (case insensitive, word boundaries)
  for (const suffix of LEGAL_FORM_SUFFIXES) {
    const regex = new RegExp(`\\b${suffix.replace('/', '\\/')}\\b$`, 'i');
    cleanedQuery = cleanedQuery.replace(regex, '').trim();
  }
  
  // If the cleaned query is empty (user only searched for a legal form), use original
  if (!cleanedQuery) {
    cleanedQuery = companyName;
  }
  
  return cleanedQuery;
};
