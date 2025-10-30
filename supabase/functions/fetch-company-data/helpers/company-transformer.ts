
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
  founders: Array<{ name: string; cvr?: string; type?: string; identifier?: string }> | null;
  realCvrData: any;
  foundPersons?: string[]; // Track found persons in search
}

export const transformCompanyData = (hit: any, determineLegalForm: (vrvirksomhed: any) => string, determineStatus: (vrvirksomhed: any) => string, searchQuery?: string): CompanyTransformationResult => {
  const source = hit._source;
  const vrvirksomhed = source.Vrvirksomhed || {};
  
  // Get the current/active name (where gyldigTil is null) or the most recent name
  const currentName = vrvirksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null);
  const primaryName = currentName?.navn || vrvirksomhed.navne?.[vrvirksomhed.navne.length - 1]?.navn || 'Unknown';
  
  // Get the current/active address (where gyldigTil is null) or the most recent address
  const currentAddress = vrvirksomhed.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
  const primaryAddress = currentAddress || vrvirksomhed.beliggenhedsadresse?.[vrvirksomhed.beliggenhedsadresse.length - 1] || {};
  
  // Get current industry info
  const currentIndustry = vrvirksomhed.hovedbranche?.find((branch: any) => branch.periode?.gyldigTil === null);
  const industry = currentIndustry?.branchetekst || vrvirksomhed.hovedbranche?.[vrvirksomhed.hovedbranche.length - 1]?.branchetekst || 'N/A';
  
  // Get current email
  const currentEmail = vrvirksomhed.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
  const emailAddress = currentEmail?.kontaktoplysning || vrvirksomhed.elektroniskPost?.[vrvirksomhed.elektroniskPost.length - 1]?.kontaktoplysning || null;
  
  // Get current legal form using enhanced logic
  const legalForm = determineLegalForm(vrvirksomhed);
  
  // Get current status using enhanced logic
  const status = determineStatus(vrvirksomhed);
  
  // Get employee count from current employment data (where gyldigTil is null) or the most recent
  const currentEmployment = vrvirksomhed.aarsbeskaeftigelse?.find((emp: any) => emp.periode?.gyldigTil === null);
  const latestEmployment = currentEmployment || vrvirksomhed.aarsbeskaeftigelse?.[0]; // Index 0 = newest in CVR API
  const employeeCount = latestEmployment?.antalAnsatte || latestEmployment?.antalAarsvaerk || 0;
  
  // Debug logging
  if (vrvirksomhed.aarsbeskaeftigelse && vrvirksomhed.aarsbeskaeftigelse.length > 0) {
    console.log('[EMPLOYEE COUNT]', {
      cvrNummer: vrvirksomhed.cvrNummer,
      totalEntries: vrvirksomhed.aarsbeskaeftigelse.length,
      foundCurrent: !!currentEmployment,
      employeeCount: employeeCount,
      latestPeriod: latestEmployment?.periode
    });
  }
  
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
      
      const currentPersonName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
      const name = currentPersonName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || '';
      
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
  
  // Get current website
  const currentWebsite = vrvirksomhed.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null);
  const website = currentWebsite?.kontaktoplysning || vrvirksomhed.hjemmeside?.[vrvirksomhed.hjemmeside.length - 1]?.kontaktoplysning || null;
  
  // Get founders from deltagerRelation
  let founders: Array<{ name: string; cvr?: string; type?: string; identifier?: string }> | null = null;
  if (vrvirksomhed.deltagerRelation) {
    const founderRelations = vrvirksomhed.deltagerRelation.filter((relation: any) => {
      // Check enriched _medlemsData first
      if (relation._medlemsData?.attributter?.some((attr: any) => attr.type === 'STIFTER')) {
        return true;
      }
      
      // Fallback: Check original organisationer structure
      if (relation.organisationer) {
        return relation.organisationer.some((org: any) => {
          if (org.medlemsData) {
            return org.medlemsData.some((medlem: any) => {
              return medlem.attributter?.some((attr: any) => 
                attr.type === 'FUNKTION' && 
                attr.vaerdier?.some((v: any) => v.vaerdi === 'STIFTERE')
              );
            });
          }
          return false;
        });
      }
      
      return false;
    });
    
    if (founderRelations.length > 0) {
      founders = founderRelations.map((relation: any) => {
        const deltager = relation._enrichedDeltagerData || relation.deltager;
        const currentName = deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
        const name = currentName?.navn || deltager?.navne?.[deltager.navne.length - 1]?.navn || 'Ikke oplyst';
        
        // Extract entity type and identifier
        const enhedstype = deltager?.enhedstype; // 'VIRKSOMHED' or 'PERSON'
        const identifier = deltager?.enhedsNummer?.toString();
        
        // For backward compatibility, keep cvr for companies
        let cvr: string | undefined = undefined;
        if (enhedstype === 'VIRKSOMHED') {
          cvr = identifier;
        }
        
        return { 
          name, 
          cvr,              // Backward compatibility
          type: enhedstype, // 'PERSON' or 'VIRKSOMHED'
          identifier        // Works for both CVR numbers and person IDs
        };
      });
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
    website: website,
    description: description,
    logo: null,
    email: emailAddress,
    legalForm: legalForm,
    status: status,
    founders: founders,
    foundPersons: foundPersons,
    // Store full CVR data for detailed view
    realCvrData: vrvirksomhed
  };
};
