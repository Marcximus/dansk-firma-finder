
export interface CompanyTransformationResult {
  id: string;
  name: string;
  cvr: string;
  address: string;
  city: string;
  postalCode: string;
  industry: string;
  employeeCount: number;
  yearFounded: number | null;
  revenue: string;
  website: string | null;
  description: string;
  logo: null;
  email: string | null;
  legalForm: string;
  status: string;
  realCvrData: any;
}

export const transformCompanyData = (hit: any, determineLegalForm: (vrvirksomhed: any) => string, determineStatus: (vrvirksomhed: any) => string): CompanyTransformationResult => {
  const source = hit._source;
  const vrvirksomhed = source.Vrvirksomhed || {};
  
  // Get the current/active name (where gyldigTil is null) or the most recent name
  const activeName = vrvirksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null);
  const primaryName = activeName?.navn || vrvirksomhed.navne?.[0]?.navn || 'Unknown';
  
  // Get the current/active address (where gyldigTil is null) or the most recent address
  const activeAddress = vrvirksomhed.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
  const primaryAddress = activeAddress || vrvirksomhed.beliggenhedsadresse?.[0] || {};
  
  // Get current industry info
  const currentIndustry = vrvirksomhed.hovedbranche?.find((branch: any) => branch.periode?.gyldigTil === null);
  const industry = currentIndustry?.branchetekst || vrvirksomhed.hovedbranche?.[0]?.branchetekst || 'N/A';
  
  // Get current email
  const currentEmail = vrvirksomhed.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
  const emailAddress = currentEmail?.kontaktoplysning || vrvirksomhed.elektroniskPost?.[0]?.kontaktoplysning || null;
  
  // Get current legal form using enhanced logic
  const legalForm = determineLegalForm(vrvirksomhed);
  
  // Get current status using enhanced logic
  const status = determineStatus(vrvirksomhed);
  
  // Get employee count from latest employment data
  const latestEmployment = vrvirksomhed.aarsbeskaeftigelse?.[0];
  const employeeCount = latestEmployment?.antalAnsatte || latestEmployment?.antalAarsvaerk || 0;
  
  // Build address string
  let addressString = 'N/A';
  if (primaryAddress.vejnavn || primaryAddress.husnummerFra) {
    const street = primaryAddress.vejnavn || '';
    const houseNumber = primaryAddress.husnummerFra || '';
    const floor = primaryAddress.etage ? `, ${primaryAddress.etage}` : '';
    const door = primaryAddress.sidedoer ? ` ${primaryAddress.sidedoer}` : '';
    addressString = `${street} ${houseNumber}${floor}${door}`.trim();
  }
  
  return {
    id: vrvirksomhed.cvrNummer?.toString() || hit._id,
    name: primaryName,
    cvr: vrvirksomhed.cvrNummer?.toString() || '',
    address: addressString,
    city: primaryAddress.postdistrikt || 'N/A',
    postalCode: primaryAddress.postnummer?.toString() || 'N/A',
    industry: industry,
    employeeCount: employeeCount,
    yearFounded: vrvirksomhed.stiftelsesDato ? new Date(vrvirksomhed.stiftelsesDato).getFullYear() : null,
    revenue: 'N/A',
    website: vrvirksomhed.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null)?.kontaktoplysning || null,
    description: 'Company information from Danish Business Authority',
    logo: null,
    email: emailAddress,
    legalForm: legalForm,
    status: status,
    // Store full CVR data for detailed view
    realCvrData: vrvirksomhed
  };
};
