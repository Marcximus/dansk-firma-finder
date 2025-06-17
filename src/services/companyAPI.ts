// Mock API service for Danish company data
// In a real implementation, this would connect to your actual API

import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  cvr: string; // Danish business registration number
  address: string;
  city: string;
  postalCode: string;
  industry: string;
  employeeCount: number;
  yearFounded: number;
  revenue?: string;
  website?: string;
  description?: string;
  logo?: string; // URL to company logo
  email?: string;
  legalForm?: string;
  status?: string;
  // Additional CVR data
  realCvrData?: any; // Store the full CVR response for detailed view
}

// Sample company data
const MOCK_COMPANIES: Company[] = [
  {
    id: "1",
    name: "Novo Nordisk A/S",
    cvr: "24256790",
    address: "Novo Allé 1",
    city: "Bagsværd",
    postalCode: "2880",
    industry: "Pharmaceuticals",
    employeeCount: 48000,
    yearFounded: 1923,
    revenue: "176.9 billion DKK",
    website: "https://www.novonordisk.com",
    description: "Global healthcare company with more than 95 years of innovation and leadership in diabetes care.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Novo_Nordisk.svg"
  },
  {
    id: "2",
    name: "Maersk",
    cvr: "14661603",
    address: "Esplanaden 50",
    city: "Copenhagen",
    postalCode: "1263",
    industry: "Shipping & Logistics",
    employeeCount: 80000,
    yearFounded: 1904,
    revenue: "352.0 billion DKK",
    website: "https://www.maersk.com",
    description: "An integrated container logistics company connecting and simplifying trade to help customers grow.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Maersk_Group_Logo.svg/2560px-Maersk_Group_Logo.svg.png"
  },
  {
    id: "3",
    name: "Danske Bank",
    cvr: "61126228",
    address: "Holmens Kanal 2-12",
    city: "Copenhagen",
    postalCode: "1092",
    industry: "Banking",
    employeeCount: 22000,
    yearFounded: 1871,
    revenue: "44.9 billion DKK",
    website: "https://www.danskebank.com",
    description: "One of the largest banks in the Nordic countries with operations across Northern Europe.",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7b/Danske_Bank_logo.svg"
  },
  {
    id: "4",
    name: "Vestas Wind Systems",
    cvr: "10403782",
    address: "Hedeager 42",
    city: "Aarhus",
    postalCode: "8200",
    industry: "Renewable Energy",
    employeeCount: 29000,
    yearFounded: 1945,
    revenue: "14.8 billion EUR",
    website: "https://www.vestas.com",
    description: "Global leader in sustainable energy solutions, specializing in wind turbine design, manufacturing, installation, and services.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Vestas_logo.svg/2560px-Vestas_logo.svg.png"
  },
  {
    id: "5",
    name: "Carlsberg Group",
    cvr: "61056416",
    address: "J.C. Jacobsens Gade 1",
    city: "Copenhagen",
    postalCode: "1799",
    industry: "Beverages",
    employeeCount: 41000,
    yearFounded: 1847,
    revenue: "66.6 billion DKK",
    website: "https://www.carlsberggroup.com",
    description: "One of the leading brewery groups in the world, with a large portfolio of beer and other beverage brands.",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/5c/Carlsberg_Group_logo.svg"
  },
  {
    id: "6",
    name: "LEGO Group",
    cvr: "12345678",
    address: "Aastvej 1",
    city: "Billund",
    postalCode: "7190",
    industry: "Toys & Entertainment",
    employeeCount: 20000,
    yearFounded: 1932,
    revenue: "43.7 billion DKK",
    website: "https://www.lego.com",
    description: "Family-owned company based in Billund, Denmark, and best known for the manufacture of LEGO-brand toys.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png"
  }
];

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
  return MOCK_COMPANIES.filter(company => 
    company.name.toLowerCase().includes(normalizedQuery) ||
    company.cvr.includes(normalizedQuery) ||
    company.industry.toLowerCase().includes(normalizedQuery) ||
    company.city.toLowerCase().includes(normalizedQuery)
  );
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
        company.realCvrData = data.fullCvrData || data.companies[0];
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

// Helper function to extract real CVR data for company details
export const extractCvrDetails = (cvrData: any) => {
  if (!cvrData || !cvrData.Vrvirksomhed) {
    return null;
  }

  const vrvirksomhed = cvrData.Vrvirksomhed;
  
  // Extract management and board information
  const management = vrvirksomhed.deltagerRelation?.map((relation: any) => {
    const deltager = relation.deltager;
    if (!deltager) return null;
    
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    const name = currentName?.navn || deltager.navne?.[0]?.navn || 'Unknown';
    
    const currentAddress = deltager.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
    const address = currentAddress || deltager.beliggenhedsadresse?.[0];
    
    let addressString = 'N/A';
    if (address) {
      const street = address.vejnavn || '';
      const houseNumber = address.husnummerFra || '';
      const floor = address.etage ? `, ${address.etage}` : '';
      const door = address.sidedoer ? ` ${address.sidedoer}` : '';
      const city = address.postdistrikt || '';
      const postalCode = address.postnummer ? address.postnummer.toString() : '';
      addressString = `${street} ${houseNumber}${floor}${door}, ${postalCode} ${city}`.trim();
    }
    
    // Determine role based on attributes or organization type
    let role = 'Deltager';
    if (relation.organisationer) {
      const org = relation.organisationer[0];
      if (org?.hovedtype) {
        role = org.hovedtype === 'DIREKTION' ? 'Direktør' : 
               org.hovedtype === 'BESTYRELSE' ? 'Bestyrelse' : 
               org.hovedtype;
      }
    }
    
    return {
      role: role,
      name: name,
      address: addressString
    };
  }).filter(Boolean) || [];

  // Extract historical information
  const historicalNames = vrvirksomhed.navne?.map((navnItem: any) => ({
    period: `${navnItem.periode?.gyldigFra || 'Unknown'} - ${navnItem.periode?.gyldigTil || 'Present'}`,
    name: navnItem.navn
  })) || [];

  const historicalAddresses = vrvirksomhed.beliggenhedsadresse?.map((addr: any) => {
    let addressString = '';
    if (addr.vejnavn || addr.husnummerFra) {
      const street = addr.vejnavn || '';
      const houseNumber = addr.husnummerFra || '';
      const floor = addr.etage ? `, ${addr.etage}` : '';
      const door = addr.sidedoer ? ` ${addr.sidedoer}` : '';
      const city = addr.postdistrikt || '';
      const postalCode = addr.postnummer ? addr.postnummer.toString() : '';
      addressString = `${street} ${houseNumber}${floor}${door}\n${postalCode} ${city}`;
    }
    
    return {
      period: `${addr.periode?.gyldigFra || 'Unknown'} - ${addr.periode?.gyldigTil || 'Present'}`,
      address: addressString
    };
  }) || [];

  // Extract company form information
  const currentForm = vrvirksomhed.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
  const legalForm = currentForm?.langBeskrivelse || currentForm?.kortBeskrivelse || 'N/A';

  // Extract status
  const currentStatus = vrvirksomhed.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
  const status = currentStatus?.status || 'N/A';

  // Extract employment data
  const latestEmployment = vrvirksomhed.aarsbeskaeftigelse?.[0];
  const employeeCount = latestEmployment?.antalAnsatte || latestEmployment?.antalAarsvaerk || 0;

  return {
    management,
    historicalNames,
    historicalAddresses,
    legalForm,
    status,
    employeeCount,
    fullData: vrvirksomhed
  };
};
