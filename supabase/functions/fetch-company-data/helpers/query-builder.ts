
import { buildCvrQuery } from './cvr-query-builder.ts';
import { buildCompanyNameQuery } from './company-name-query-builder.ts';

export const buildSearchQuery = (cvr?: string, companyName?: string) => {
  if (cvr) {
    // Search by CVR number - convert to integer for exact match
    return buildCvrQuery(cvr);
  } else if (companyName) {
    // Search by company name with hierarchical ranking
    return buildCompanyNameQuery(companyName);
  } else {
    throw new Error('Either CVR number or company name is required');
  }
};
