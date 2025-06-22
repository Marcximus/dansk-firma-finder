import { supabase } from '@/integrations/supabase/client';
import { Company } from './types';
import { MOCK_COMPANIES } from './mockData';

// Enhanced search function that uses the Danish Business Authority API
export const searchCompanies = async (query: string): Promise<Company[]> => {
  console.log(`Searching for companies with query: ${query}`);
  
  if (!query) {
    return MOCK_COMPANIES;
  }
  
  try {
    // Check if query is a CVR number (8 digits)
    const isCVR = /^\d{8}$/.test(query);
    
    const { data, error } = await supabase.functions.invoke('fetch-company-data', {
      body: isCVR ? { cvr: query } : { companyName: query }
    });
    
    if (error) {
      console.error('Error calling fetch-company-data function:', error);
      // Fall back to mock data search
      return searchMockCompanies(query);
    }
    
    if (data && data.companies && data.companies.length > 0) {
      console.log(`Found ${data.companies.length} companies from Danish Business Authority`);
      // CRITICAL: Return companies in the exact order from backend - DO NOT SORT
      return data.companies;
    } else {
      console.log('No companies found from API, falling back to mock data');
      return searchMockCompanies(query);
    }
    
  } catch (error) {
    console.error('Error searching companies:', error);
    // Fall back to mock data search
    return searchMockCompanies(query);
  }
};

// Helper function to search mock companies
const searchMockCompanies = (query: string): Company[] => {
  const normalizedQuery = query.toLowerCase();
  const filteredCompanies = MOCK_COMPANIES.filter(company => 
    company.name.toLowerCase().includes(normalizedQuery) ||
    company.cvr.includes(normalizedQuery) ||
    company.industry.toLowerCase().includes(normalizedQuery) ||
    company.city.toLowerCase().includes(normalizedQuery)
  );
  
  // For mock data, sort by exact matches first, then relevance
  return filteredCompanies.sort((a, b) => {
    const aExact = a.name.toLowerCase() === normalizedQuery;
    const bExact = b.name.toLowerCase() === normalizedQuery;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    const aStarts = a.name.toLowerCase().startsWith(normalizedQuery);
    const bStarts = b.name.toLowerCase().startsWith(normalizedQuery);
    
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    return a.name.localeCompare(b.name);
  });
};

// Enhanced get company by ID function that fetches full CVR data
export const getCompanyById = async (id: string): Promise<Company | undefined> => {
  console.log(`Fetching company with ID: ${id}`);
  
  try {
    // First try to search by CVR if it looks like one
    if (/^\d{8}$/.test(id)) {
      const { data, error } = await supabase.functions.invoke('fetch-company-data', {
        body: { cvr: id }
      });
      
      if (!error && data && data.companies && data.companies.length > 0) {
        const company = data.companies[0];
        // Store the full CVR data for use in the details page
        company.realCvrData = data.fullCvrData || data.companies[0].realCvrData;
        return company;
      }
    }
    
    // Fall back to mock data
    return MOCK_COMPANIES.find(company => company.id === id);
    
  } catch (error) {
    console.error('Error fetching company by ID:', error);
    // Fall back to mock data
    return MOCK_COMPANIES.find(company => company.id === id);
  }
};

// New function to get financial data
export const getFinancialData = async (cvr: string) => {
  console.log(`Fetching financial data for CVR: ${cvr}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
      body: { cvr }
    });
    
    if (error) {
      console.error('Error calling fetch-financial-data function:', error);
      return null;
    }
    
    return data;
    
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return null;
  }
};
