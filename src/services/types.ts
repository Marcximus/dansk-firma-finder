
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
  founders?: Array<{ name: string; cvr?: string; enhedstype?: string }>; // Array of company founders with optional CVR numbers and entity type
  // Additional CVR data
  realCvrData?: any; // Store the full CVR response for detailed view
  productionUnits?: any[]; // Production units from produktionsenhed endpoint
}
