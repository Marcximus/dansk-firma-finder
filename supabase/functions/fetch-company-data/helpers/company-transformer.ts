
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
  foundPersons?: string[]; // Track found persons in search
}

export const transformCompanyData = (hit: any, determineLegalForm: (vrvirksomhed: any) => string, determineStatus: (vrvirksomhed: any) => string, searchQuery?: string): CompanyTransformationResult => {
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
  
  // Extract found persons if search matches people in the company
  let foundPersons: string[] = [];
  let description = 'Company information from Danish Business Authority';
  
  if (searchQuery && vrvirksomhed.deltagerRelation) {
    const searchLower = searchQuery.toLowerCase();
    foundPersons = vrvirksomhed.deltagerRelation?.map((relation: any) => {
      const deltager = relation.deltager;
      if (!deltager) return null;
      
      const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
      const name = currentName?.navn || deltager.navne?.[0]?.navn || '';
      
      if (name.toLowerCase().includes(searchLower)) {
        // Determine role
        let role = 'Deltager';
        if (relation.organisationer && relation.organisationer.length > 0) {
          const org = relation.organisationer[0];
          if (org?.hovedtype) {
            role = org.hovedtype === 'DIREKTION' ? 'Direktør' : 
                   org.hovedtype === 'BESTYRELSE' ? 'Bestyrelse' : 
                   org.hovedtype === 'FULDT_ANSVARLIG_DELTAGERE' ? 'Interessenter' :
                   org.hovedtype;
          }
          
          // Get more specific role from member data
          if (org.medlemsData && org.medlemsData.length > 0) {
            const memberData = org.medlemsData[0];
            if (memberData.attributter) {
              const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
              if (funkAttribute && funkAttribute.vaerdier && funkAttribute.vaerdier.length > 0) {
                role = funkAttribute.vaerdier[0].vaerdi || role;
              }
            }
          }
        }
        
        return `${name} (${role})`;
      }
      return null;
    }).filter(Boolean) || [];
    
    // Update description if persons were found
    if (foundPersons.length > 0) {
      description = `Found person(s): ${foundPersons.join(', ')}. Company information from Danish Business Authority.`;
    }
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
    description: description,
    logo: null,
    email: emailAddress,
    legalForm: legalForm,
    status: status,
    foundPersons: foundPersons,
    // Store full CVR data for detailed view
    realCvrData: vrvirksomhed
  };
};
