
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
