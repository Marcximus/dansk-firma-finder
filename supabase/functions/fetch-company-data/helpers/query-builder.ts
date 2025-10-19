import { buildCvrQuery } from './cvr-query-builder.ts';
import { buildCompanyNameQuery } from './company-name-query-builder.ts';
import { buildPersonQuery } from './person-query-builder.ts';

export const buildSearchQuery = (cvr?: string, companyName?: string, personName?: string) => {
  if (cvr) {
    // Search by CVR number - convert to integer for exact match
    return buildCvrQuery(cvr);
  } else if (personName) {
    // Search by person name - find active relations only
    return buildPersonQuery(personName);
  } else if (companyName) {
    // Search by company name with hierarchical ranking
    return buildCompanyNameQuery(companyName);
  } else {
    throw new Error('Either CVR number, company name, or person name is required');
  }
};