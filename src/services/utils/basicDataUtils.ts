
import { formatAddress, formatPeriod } from './formatUtils';

// Helper function to extract basic CVR data for company details
export const extractCvrDetails = (cvrData: any) => {
  console.log('extractCvrDetails - Input data:', cvrData);
  
  if (!cvrData || !cvrData.Vrvirksomhed) {
    console.log('extractCvrDetails - No Vrvirksomhed data found');
    return null;
  }

  const vrvirksomhed = cvrData.Vrvirksomhed;
  console.log('extractCvrDetails - Processing Vrvirksomhed:', vrvirksomhed);
  
  // Extract management and board information
  const management = vrvirksomhed.deltagerRelation?.map((relation: any) => {
    const deltager = relation.deltager;
    if (!deltager) return null;
    
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    const name = currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Unknown';
    
    const currentAddress = deltager.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
    const address = currentAddress || deltager.beliggenhedsadresse?.[deltager.beliggenhedsadresse.length - 1];
    
    let addressString = 'N/A';
    if (address) {
      addressString = formatAddress(address);
    }
    
    // Determine role based on attributes or organization type
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
    
    return {
      role: role,
      name: name,
      address: addressString
    };
  }).filter(Boolean) || [];

  // Extract historical information - sort by date to show most recent first
  const historicalNames = vrvirksomhed.navne?.map((navnItem: any) => ({
    period: formatPeriod(navnItem.periode),
    name: navnItem.navn
  })).sort((a: any, b: any) => {
    // Sort so current names (with 'Present') come first
    if (a.period.includes('Nuværende') && !b.period.includes('Nuværende')) return -1;
    if (b.period.includes('Nuværende') && !a.period.includes('Nuværende')) return 1;
    return b.period.localeCompare(a.period);
  }) || [];

  const historicalAddresses = vrvirksomhed.beliggenhedsadresse?.map((addr: any) => ({
    period: formatPeriod(addr.periode),
    address: formatAddress(addr)
  })).sort((a: any, b: any) => {
    // Sort so current addresses (with 'Present') come first
    if (a.period.includes('Nuværende') && !b.period.includes('Nuværende')) return -1;
    if (b.period.includes('Nuværende') && !a.period.includes('Nuværende')) return 1;
    return b.period.localeCompare(a.period);
  }) || [];

  // Extract company form information - get current form
  const currentForm = vrvirksomhed.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
  const legalForm = currentForm?.langBeskrivelse || currentForm?.kortBeskrivelse || 
                   vrvirksomhed.virksomhedsform?.[vrvirksomhed.virksomhedsform.length - 1]?.langBeskrivelse || 'N/A';

  // Extract status - get current status
  const currentStatus = vrvirksomhed.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
  const status = currentStatus?.status || vrvirksomhed.virksomhedsstatus?.[vrvirksomhed.virksomhedsstatus.length - 1]?.status || 'N/A';

  // Extract employment data
  const latestEmployment = vrvirksomhed.aarsbeskaeftigelse?.[0];
  const employeeCount = latestEmployment?.antalAnsatte || latestEmployment?.antalAarsvaerk || 0;

  // Enhanced purpose text from various sources
  let purposeText = "Company information from Danish Business Authority.";
  
  // Try to extract more meaningful purpose information
  if (vrvirksomhed.hovedbranche && vrvirksomhed.hovedbranche.length > 0) {
    const currentIndustry = vrvirksomhed.hovedbranche.find((branch: any) => branch.periode?.gyldigTil === null);
    const industry = currentIndustry || vrvirksomhed.hovedbranche[vrvirksomhed.hovedbranche.length - 1];
    purposeText = `Primary business activity: ${industry.branchetekst} (Code: ${industry.branchekode}). `;
    
    // Add secondary industries if available
    const secondaryIndustries = [
      ...(vrvirksomhed.bibranche1 || []),
      ...(vrvirksomhed.bibranche2 || []),
      ...(vrvirksomhed.bibranche3 || [])
    ];
    
    if (secondaryIndustries.length > 0) {
      const currentSecondary = secondaryIndustries.filter((branch: any) => !branch.periode?.gyldigTil);
      if (currentSecondary.length > 0) {
        purposeText += `Secondary activities include: ${currentSecondary.map((branch: any) => branch.branchetekst).join(', ')}.`;
      }
    }
  }

  const result = {
    management,
    historicalNames,
    historicalAddresses,
    legalForm,
    status,
    employeeCount,
    purposeText,
    fullData: vrvirksomhed
  };

  console.log('extractCvrDetails - Final result:', result);
  return result;
};
