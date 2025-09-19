
// Main export file for company API services
export type { Company } from './types';
export type { SearchSuggestion } from './apiService';
export { searchCompanies, getCompanyById, getFinancialData, getSearchSuggestions } from './apiService';
export { extractCvrDetails } from './cvrUtils';
export { MOCK_COMPANIES } from './mockData';
