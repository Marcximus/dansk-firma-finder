
// Main export file for company API services
export type { Company } from './types';
export { searchCompanies, getCompanyById, getFinancialData, getSubsidiaries, getPersonData } from './apiService';
export { extractCvrDetails } from './cvrUtils';
export { MOCK_COMPANIES } from './mockData';
