
export interface Company {
  id: string;
  name: string;
  cvr: string; // Danish business registration number
  address: string;
  city: string;
  postalCode: string;
  industry: string;
  employeeCount: number;
  yearFounded: number | null;
  revenue?: string;
  website?: string;
  description?: string;
  logo?: string; // URL to company logo
  email?: string;
  legalForm?: string;
  status?: string;
  founders?: Array<{ name: string; cvr?: string; type?: string; identifier?: string }>; // Array of founders with type (PERSON/VIRKSOMHED) and identifier
  // Additional CVR data
  realCvrData?: any; // Store the full CVR response for detailed view
  productionUnits?: any[]; // Production units from produktionsenhed endpoint
}
